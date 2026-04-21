'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import {
  submissionEntries,
  formatSubmissionValue,
} from '@/components/portal/admin/submissionDisplayUtils';
import {
  type FormSubmissionLike,
  STATUS_OPTIONS,
  formatDateShort,
  groupSubmissions,
} from '@/components/portal/admin/submissionListUtils';

type FormSubmission = FormSubmissionLike & {
  archived: number;
  submission: Record<string, unknown>;
};

interface SubmissionsListProps {
  formSlug: string;
  includeArchived?: boolean;
}

/** Same form for whole page — hide per-card form id to reduce noise */
function formMatchesPage(subForm: string, pageSlug: string) {
  return (
    subForm === pageSlug ||
    subForm.replace(/^\/+/, '') === pageSlug.replace(/^\/+/, '')
  );
}

export function SubmissionsList({
  formSlug,
  includeArchived = false,
}: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [historyOpenId, setHistoryOpenId] = useState<number | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!formSlug) {
      setSubmissions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/form-submissions?formSlug=${encodeURIComponent(
        formSlug
      )}${includeArchived ? '&archived=1' : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [formSlug, includeArchived]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const patchSubmission = async (
    id: number,
    payload: { archived?: 0 | 1 } | { status: string }
  ) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/form-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { message?: string }).message || 'Update failed'
        );
      }
      await fetchSubmissions();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActionId(null);
    }
  };

  const grouped = useMemo(() => groupSubmissions(submissions), [submissions]);

  if (loading && submissions.length === 0) {
    return (
      <div className="py-12 text-center text-text/50 dark:text-dark-text/50 text-sm">
        Loading…
      </div>
    );
  }

  if (error && submissions.length === 0) {
    return (
      <div className="p-4 rounded-md bg-red-950/40 border border-red-800/50 text-red-200 text-sm">
        <p className="font-medium mb-1">Couldn’t load submissions</p>
        <p className="text-red-300/90">{error}</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="py-12 text-center text-text/50 dark:text-dark-text/50 text-sm rounded-md border border-dashed border-text/15 dark:border-dark-text/15">
        No submissions for this form.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="px-3 py-2 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-100 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-text/50 dark:text-dark-text/50">
        <span>
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          onClick={() => fetchSubmissions()}
          disabled={loading}
          className="hover:text-text dark:hover:text-dark-text disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Grouped by latest workflow status */}
      <div className="space-y-8">
        {grouped.map(({ key: groupKey, items }) => (
          <section key={groupKey} className="space-y-2">
            <h3 className="text-sm font-semibold text-text/80 dark:text-dark-text/80 flex items-baseline gap-2">
              <span>{groupKey}</span>
              <span className="text-text/45 dark:text-dark-text/45 font-normal tabular-nums">
                ({items.length})
              </span>
            </h3>
            <div className="rounded-lg border border-text/15 dark:border-dark-text/15 overflow-hidden divide-y divide-text/10 dark:divide-dark-text/10">
              {items.map(sub => {
                const isArchived = Boolean(sub.archived);
                const busy = actionId === sub.id;
                const fields = submissionEntries(sub.submission ?? {});
                const showFormRow = !formMatchesPage(sub.form, formSlug);
                const history = sub.status_history ?? [];
                const historyOpen = historyOpenId === sub.id;

                return (
                  <div
                    key={sub.id}
                    className={clsx(
                      'px-4 py-4 sm:px-5',
                      isArchived && 'bg-text/[0.02] dark:bg-white/[0.02]'
                    )}
                  >
                    {/* One-row meta + actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-sm font-medium tabular-nums">
                          #{sub.id}
                        </span>
                        <span className="text-text/60 dark:text-dark-text/60 text-sm">
                          {formatDateShort(sub.created_at)}
                        </span>
                        {sub.user_id != null && (
                          <span className="text-text/50 dark:text-dark-text/50 text-sm">
                            user {sub.user_id}
                          </span>
                        )}
                        <span
                          className={clsx(
                            'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
                            isArchived
                              ? 'bg-amber-500/20 text-amber-200'
                              : 'bg-emerald-500/20 text-emerald-200'
                          )}
                        >
                          {isArchived ? 'Archived' : 'Active'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          aria-label="Set status"
                          className="text-xs rounded-md border border-text/20 dark:border-dark-text/25 bg-bg dark:bg-dark-bg px-2 py-1.5 min-w-[9rem]"
                          disabled={busy}
                          defaultValue=""
                          onChange={e => {
                            const v = e.target.value;
                            e.target.value = '';
                            if (v) patchSubmission(sub.id, { status: v });
                          }}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option
                              key={opt.value || 'empty'}
                              value={opt.value}
                              disabled={opt.value === ''}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {!isArchived ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              patchSubmission(sub.id, { archived: 1 })
                            }
                            className="text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-md border border-text/25 dark:border-dark-text/25 hover:bg-text/5 dark:hover:bg-white/5 disabled:opacity-50"
                          >
                            Archive
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              patchSubmission(sub.id, { archived: 0 })
                            }
                            className="text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-md border border-text/25 dark:border-dark-text/25 hover:bg-text/5 dark:hover:bg-white/5 disabled:opacity-50"
                          >
                            Unarchive
                          </button>
                        )}
                      </div>
                    </div>

                    {showFormRow && (
                      <p className="mt-2 text-xs font-mono text-text/40 dark:text-dark-text/40 truncate">
                        Form: {sub.form}
                      </p>
                    )}

                    {/* Status history: compact; expand only if needed */}
                    {history.length > 0 && (
                      <div className="mt-2">
                        {history.length === 1 ? (
                          <p className="text-xs text-text/45 dark:text-dark-text/45">
                            {history[0].status} ·{' '}
                            {formatDateShort(history[0].created_at)}
                          </p>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="text-xs text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text"
                              onClick={() =>
                                setHistoryOpenId(historyOpen ? null : sub.id)
                              }
                            >
                              {historyOpen ? 'Hide' : 'Show'} history (
                              {history.length})
                            </button>
                            {historyOpen && (
                              <ul className="mt-1.5 space-y-0.5 text-xs text-text/55 dark:text-dark-text/55">
                                {history.map(h => (
                                  <li key={h.id}>
                                    <span className="text-text/70 dark:text-dark-text/70">
                                      {h.status}
                                    </span>
                                    <span className="text-text/40 dark:text-dark-text/40">
                                      {' '}
                                      · {formatDateShort(h.created_at)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Field data: real table = aligned columns, no floating pairs */}
                    {fields.length > 0 && (
                      <div className="mt-4 overflow-x-auto rounded-md border border-text/10 dark:border-dark-text/10">
                        <table className="w-full text-sm border-collapse">
                          <tbody>
                            {fields.map(([key, value]) => (
                              <tr
                                key={key}
                                className="border-b border-text/8 dark:border-dark-text/8 last:border-0"
                              >
                                <td
                                  className="align-top py-2 pl-3 pr-4 w-36 max-w-[40%] sm:w-44 text-text/50 dark:text-dark-text/50 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                  title={key}
                                >
                                  {key}
                                </td>
                                <td className="align-top py-2 pr-3 text-text dark:text-dark-text break-words">
                                  {formatSubmissionValue(value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {fields.length === 0 && (
                      <p className="mt-3 text-xs text-text/40">No field data</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
