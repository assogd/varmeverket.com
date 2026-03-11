'use client';

import { useState, useEffect } from 'react';
import { SubmissionsList } from '@/components/portal/admin/SubmissionsList';
import { getFormSlugs } from '@/lib/loadFormFromJson';

type FormSlugOption = { value: string; label: string; source?: string };

function buildFallbackOptions(): FormSlugOption[] {
  return getFormSlugs().map(slug => ({
    value: slug,
    label: `${slug} (JSON)`,
  }));
}

export default function AdminSubmissionsPage() {
  const [formSlugOptions, setFormSlugOptions] = useState<FormSlugOption[]>([]);
  const [formSlug, setFormSlug] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [useCustomSlug, setUseCustomSlug] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/form-slugs');
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          // Same gate as form-submissions: if API key missing, still show JSON slugs
          const fallback = buildFallbackOptions();
          if (!cancelled) {
            setFormSlugOptions(fallback);
            setFormSlug(prev => prev || fallback[0]?.value || '');
            setListError(
              (data as { message?: string })?.message ||
                'Using JSON forms only (CMS list unavailable).'
            );
          }
          return;
        }
        const slugs = (data as { slugs?: FormSlugOption[] }).slugs || [];
        if (!cancelled) {
          setFormSlugOptions(slugs);
          setFormSlug(prev => {
            if (prev && slugs.some(s => s.value === prev)) return prev;
            return slugs[0]?.value || '';
          });
          setListError(null);
        }
      } catch {
        const fallback = buildFallbackOptions();
        if (!cancelled) {
          setFormSlugOptions(fallback);
          setFormSlug(prev => prev || fallback[0]?.value || '');
          setListError('Could not load CMS forms; showing JSON slugs only.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentFormSlug = useCustomSlug ? customSlug : formSlug;

  return (
    <div className="space-y-6">
      {listError && (
        <p className="text-sm text-amber-700 dark:text-amber-300">{listError}</p>
      )}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label
            htmlFor="formSlug"
            className="block text-sm font-medium mb-2"
          >
            Form Slug
          </label>
          {!useCustomSlug ? (
            <select
              id="formSlug"
              value={formSlug}
              onChange={e => {
                if (e.target.value === '__custom__') {
                  setUseCustomSlug(true);
                } else {
                  setFormSlug(e.target.value);
                }
              }}
              className="w-full px-4 py-2 border border-text/20 dark:border-dark-text/20 rounded bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
            >
              {formSlugOptions.length === 0 ? (
                <option value="">Loading…</option>
              ) : (
                formSlugOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              )}
              <option value="__custom__">Other (custom)…</option>
            </select>
          ) : (
            <input
              id="customFormSlug"
              type="text"
              value={customSlug}
              onChange={e => setCustomSlug(e.target.value)}
              placeholder="Enter form slug (backend bucket name)"
              className="w-full px-4 py-2 border border-text/20 dark:border-dark-text/20 rounded bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
            />
          )}
          {useCustomSlug && (
            <button
              type="button"
              onClick={() => {
                setUseCustomSlug(false);
                setCustomSlug('');
              }}
              className="mt-2 text-sm text-text/70 dark:text-dark-text/70 hover:text-text dark:hover:text-dark-text"
            >
              ← Back to list
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input
            id="includeArchived"
            type="checkbox"
            checked={includeArchived}
            onChange={e => setIncludeArchived(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="includeArchived" className="text-sm whitespace-nowrap">
            Include archived
          </label>
        </div>
      </div>
      {currentFormSlug && (
        <SubmissionsList
          formSlug={currentFormSlug}
          includeArchived={includeArchived}
        />
      )}
    </div>
  );
}
