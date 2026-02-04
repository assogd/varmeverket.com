'use client';

import { useState } from 'react';
import { SubmissionsList } from '@/components/portal/admin/SubmissionsList';

// Common form slugs - can be extended or fetched from backend in the future
const FORM_SLUGS = [
  { value: 'test-11', label: 'test-11' },
  // Add more form slugs here as they're created
];

export default function AdminSubmissionsPage() {
  const [formSlug, setFormSlug] = useState('test-11');
  const [customSlug, setCustomSlug] = useState('');
  const [useCustomSlug, setUseCustomSlug] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  const currentFormSlug = useCustomSlug ? customSlug : formSlug;

  return (
    <div className="space-y-6">
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
              {FORM_SLUGS.map(slug => (
                <option key={slug.value} value={slug.value}>
                  {slug.label}
                </option>
              ))}
              <option value="__custom__">Other (custom)...</option>
            </select>
          ) : (
            <input
              id="customFormSlug"
              type="text"
              value={customSlug}
              onChange={e => setCustomSlug(e.target.value)}
              placeholder="Enter form slug"
              className="w-full px-4 py-2 border border-text/20 dark:border-dark-text/20 rounded bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
            />
          )}
          {useCustomSlug && (
            <button
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
