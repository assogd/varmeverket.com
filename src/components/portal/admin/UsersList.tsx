'use client';

import { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/buttons/Button';
import {
  submissionEntries,
  formatSubmissionValue,
} from '@/components/portal/admin/submissionDisplayUtils';
import {
  STATUS_OPTIONS,
  formatDateShort as formatSubmissionDateShort,
  submissionPayload,
} from '@/components/portal/admin/submissionListUtils';

interface BackendReport {
  endpoint: string;
  method: string;
  status: number;
  statusText: string;
  responseBody?: string;
  requestedEmail?: string;
}

interface User {
  email: string;
  idx: number;
  name: string;
  username: string;
  roles?: string[];
  created?: string;
  updated?: string;
  phone?: string;
  birthdate?: string;
  address_street?: string;
  address_code?: number;
  address_city?: string;
  profile?: Record<string, unknown> | null;
  profileImage?: string;
}

interface EmailStatus {
  email: string;
  user_idx: number;
  verified: string;
  subscribed: number;
  enabled: number;
}

interface SubscriptionItem {
  product_name: string;
}

interface Subscription {
  id: string | null;
  status: string;
  items: SubscriptionItem[];
}

/**
 * v3 form_submissions from GET /v3/users/:email.
 * PATCH must use submission_id when present — API is PATCH /v3/forms/<submission_id>.
 */
type FormSubmissionItem = {
  id?: number;
  submission_id?: number;
  form: string;
  submission?: Record<string, unknown>;
  created_at?: string;
  archived?: number;
  user_id?: number | null;
  /** Backend may omit note; 7.2 list uses mixed shapes */
  status_history?: unknown[];
  /** Some payloads expose current status at top level */
  status?: string;
};

function submissionPatchId(sub: FormSubmissionItem): number {
  const raw = sub.submission_id ?? sub.id;
  const n = typeof raw === 'string' ? Number(raw) : raw;
  return typeof n === 'number' && Number.isFinite(n) ? n : NaN;
}

/** Normalize status label from user aggregate or full GET (history may be partial). */
function workflowStatusFromSubmission(sub: FormSubmissionItem): string | null {
  if (typeof sub.status === 'string' && sub.status.trim()) {
    return sub.status.trim();
  }
  const h = sub.status_history;
  if (!Array.isArray(h) || h.length === 0) return null;
  const last = h[h.length - 1];
  if (typeof last === 'string') return last;
  if (last && typeof last === 'object' && last !== null && 'status' in last) {
    const s = (last as { status?: unknown }).status;
    if (typeof s === 'string' && s.trim()) return s.trim();
  }
  return null;
}

function formatHistoryLine(entry: unknown): string {
  if (typeof entry === 'string') return entry;
  if (!entry || typeof entry !== 'object') return String(entry);
  const o = entry as Record<string, unknown>;
  const status =
    typeof o.status === 'string' ? o.status : JSON.stringify(o.status);
  const created =
    typeof o.created_at === 'string'
      ? formatSubmissionDateShort(o.created_at)
      : '';
  return created ? `${status} · ${created}` : status;
}

interface UserData {
  user: User | null;
  emailStatus: EmailStatus | null;
  subscription?: Subscription[] | null;
  subscriptionError?: string | null;
  formSubmissions?: FormSubmissionItem[] | null;
  formSubmissionsError?: string | null;
  warnings?: {
    userError: string | null;
    emailError: string | null;
  };
}

function formatDateShort(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

/** Calendar age in full years (birth date → today). */
function ageInYears(birth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Birthdate: date only + "(X år)" — API often sends midnight UTC */
function formatBirthdate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dateStr = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const age = ageInYears(d);
  if (age >= 0 && age < 150) {
    return `${dateStr} (${age} år)`;
  }
  return dateStr;
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        'rounded-lg border border-text/15 dark:border-dark-text/15 overflow-hidden',
        className
      )}
    >
      <h3 className="px-4 py-3 text-sm font-semibold border-b border-text/10 dark:border-dark-text/10 bg-text/[0.03] dark:bg-white/[0.03]">
        {title}
      </h3>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function DataTable({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-md border border-text/10 dark:border-dark-text/10">
      <table className="w-full text-sm border-collapse">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr
              key={label}
              className="border-b border-text/8 dark:border-dark-text/8 last:border-0"
            >
              <td className="align-top py-2 pl-3 pr-4 w-40 text-text/50 dark:text-dark-text/50 font-medium whitespace-nowrap">
                {label}
              </td>
              <td className="align-top py-2 pr-3 text-text dark:text-dark-text break-words">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubmissionFieldsTable({ data }: { data: Record<string, unknown> }) {
  const fields = submissionEntries(data);
  if (fields.length === 0) {
    return (
      <p className="text-xs text-text/45 dark:text-dark-text/45">No fields</p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border border-text/10 dark:border-dark-text/10">
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
              <td className="align-top py-2 pr-3 break-words">
                {formatSubmissionValue(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsersList() {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [patchLoading, setPatchLoading] = useState(false);
  const [submissionActionId, setSubmissionActionId] = useState<number | null>(
    null
  );
  const [historyOpenId, setHistoryOpenId] = useState<number | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [backendReport, setBackendReport] = useState<BackendReport | null>(
    null
  );
  const { showError, showWarning, showSuccess } = useNotification();

  const handleSearch = async () => {
    if (!email.trim()) {
      showError('Please enter an email address');
      return;
    }

    setLoading(true);
    setBackendReport(null);

    try {
      const response = await fetch(
        `/api/admin/users?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.backendReport) {
          setBackendReport(data.backendReport);
        }
        if (response.status === 404 && data.warnings) {
          setUserData(data);
          showWarning(data.message || 'User not found');
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      } else {
        setUserData(data);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Unknown error');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  /** PATCH /v2/email via /api/admin/users — API_GUIDE §8.2 */
  const setLoginEnabled = async (enabled: 0 | 1) => {
    const targetEmail =
      userData?.emailStatus?.email ?? userData?.user?.email ?? email.trim();
    if (!targetEmail) {
      showError('No email to update');
      return;
    }
    setPatchLoading(true);
    setBackendReport(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, enabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { message?: string }).message || 'Update failed'
        );
      }
      showSuccess(
        enabled === 1
          ? 'User activated — they can log in.'
          : 'Login disabled for this user.'
      );
      // Refetch
      const getRes = await fetch(
        `/api/admin/users?email=${encodeURIComponent(targetEmail)}`
      );
      const getData = await getRes.json();
      if (getRes.ok) setUserData(getData);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setPatchLoading(false);
    }
  };

  const copyReportToClipboard = () => {
    if (!backendReport) return;
    const report = `## Backend report
- Endpoint: ${backendReport.endpoint}
- Status: ${backendReport.status} ${backendReport.statusText}
- Email: ${backendReport.requestedEmail ?? ''}
- Time: ${new Date().toISOString()}
${backendReport.responseBody ? `\n${backendReport.responseBody}` : ''}
`;
    void navigator.clipboard.writeText(report).then(() => {
      showSuccess('Report copied to clipboard.');
    });
  };

  const refetchUser = useCallback(async () => {
    const q = email.trim();
    if (!q) return;
    try {
      const getRes = await fetch(
        `/api/admin/users?email=${encodeURIComponent(q)}`
      );
      const getData = await getRes.json();
      if (getRes.ok) setUserData(getData);
    } catch {
      // ignore
    }
  }, [email]);

  /**
   * PATCH status returns only { status_message } — user aggregate often has no
   * status_history. Refresh via GET /v3/forms/<form>/<id> and merge into state.
   */
  const refreshSubmissionInState = useCallback(
    async (id: number, formSlug: string) => {
      const form = formSlug?.trim();
      if (!form || !id) return;
      try {
        const r = await fetch(
          `/api/admin/form-submissions/${id}?form=${encodeURIComponent(form)}`
        );
        const json = (await r.json().catch(() => ({}))) as {
          submission?: FormSubmissionItem | null;
        };
        if (!r.ok || !json.submission) return;
        const fresh = json.submission as FormSubmissionItem;
        setUserData(prev => {
          if (!prev?.formSubmissions?.length) return prev;
          const list = prev.formSubmissions.map(item => {
            if (submissionPatchId(item) !== id) return item;
            return {
              ...item,
              ...fresh,
              form: fresh.form || item.form,
            };
          });
          return { ...prev, formSubmissions: list };
        });
      } catch {
        // fallback below
      }
    },
    []
  );

  const patchSubmission = async (
    id: number,
    payload: { archived?: 0 | 1 } | { status: string },
    formSlugForRefresh?: string
  ) => {
    if (!id || Number.isNaN(id)) {
      setSubmissionError('Missing submission id — cannot update.');
      return;
    }
    setSubmissionActionId(id);
    setSubmissionError(null);
    try {
      const res = await fetch(`/api/admin/form-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        details?: unknown;
      };
      if (!res.ok) {
        const msg =
          data.message ||
          data.error ||
          (typeof data.details === 'object' &&
          data.details &&
          'message' in data.details
            ? String((data.details as { message?: string }).message)
            : null) ||
          `Update failed (${res.status})`;
        throw new Error(msg);
      }
      const form = formSlugForRefresh?.trim();
      if (form) {
        await refreshSubmissionInState(id, form);
      }
      await refetchUser();
      if (form) {
        await refreshSubmissionInState(id, form);
      }
    } catch (e) {
      setSubmissionError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSubmissionActionId(null);
    }
  };

  const submissionsByForm = useMemo(() => {
    const list = userData?.formSubmissions;
    if (!list?.length) return [];
    const map = new Map<string, FormSubmissionItem[]>();
    for (const s of list) {
      const key = s.form || 'Unknown form';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { sensitivity: 'base' })
    );
  }, [userData?.formSubmissions]);

  // Single source for identity (avoid repeating email / user id across sections)
  const displayEmail =
    userData?.user?.email ?? userData?.emailStatus?.email ?? null;
  const displayUserId =
    userData?.user?.idx ?? userData?.emailStatus?.user_idx ?? null;
  const displayName = userData?.user?.name || null;

  const profileRows: { label: string; value: React.ReactNode }[] = [];
  if (userData?.user) {
    const u = userData.user;
    if (u.username) profileRows.push({ label: 'Username', value: u.username });
    if (u.roles?.length)
      profileRows.push({ label: 'Roles', value: u.roles.join(', ') });
    if (u.phone) profileRows.push({ label: 'Phone', value: u.phone });
    if (u.birthdate)
      profileRows.push({
        label: 'Birthdate',
        value: formatBirthdate(u.birthdate),
      });
    if (u.address_street)
      profileRows.push({
        label: 'Address',
        value: [u.address_street, u.address_code, u.address_city]
          .filter(Boolean)
          .join(', '),
      });
    if (u.created)
      profileRows.push({
        label: 'Account created',
        value: formatDateShort(u.created),
      });
    if (u.updated)
      profileRows.push({
        label: 'Profile updated',
        value: formatDateShort(u.updated),
      });
    if (u.profile && Object.keys(u.profile).length > 0) {
      profileRows.push({
        label: 'Profile',
        value: (
          <SubmissionFieldsTable data={u.profile as Record<string, unknown>} />
        ),
      });
    }
    if (u.profileImage)
      profileRows.push({ label: 'Profile image', value: u.profileImage });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1 min-w-0">
          <label htmlFor="userEmail" className="block text-sm font-medium mb-2">
            Search by email
          </label>
          <input
            id="userEmail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder="user@example.com"
            autoComplete="email"
            className="w-full px-4 py-3.5 border border-text/20 dark:border-dark-text/20 rounded-md bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleSearch}
        >
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>

      {loading && (
        <div className="py-12 text-center text-text/50 dark:text-dark-text/50 text-sm">
          Loading…
        </div>
      )}

      {backendReport && (
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-950/20">
          <h3 className="font-semibold text-amber-200 mb-2 text-sm">
            Backend report
          </h3>
          <pre className="text-xs overflow-x-auto mb-3">
            {backendReport.responseBody}
          </pre>
          <button
            type="button"
            onClick={copyReportToClipboard}
            className="text-xs px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700"
          >
            Copy for report
          </button>
        </div>
      )}

      {userData && (userData.user || userData.emailStatus) && (
        <div className="space-y-6">
          {userData.warnings?.userError && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {userData.warnings.userError}
            </p>
          )}

          {/* Summary card: main block + toolbox (actions) top-right on sm+ */}
          <section className="rounded-lg border border-text/15 dark:border-dark-text/15 overflow-hidden">
            <div className="px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  {displayName && (
                    <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                      {displayName}
                    </h2>
                  )}
                  <p className="text-sm text-text/70 dark:text-dark-text/70 mt-1">
                    {displayEmail ?? email}
                    {displayUserId != null && (
                      <span className="text-text/50 dark:text-dark-text/50">
                        {' '}
                        · ID {displayUserId}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {userData.emailStatus && (
                    <>
                      <span
                        className={clsx(
                          'text-xs font-medium px-2 py-1 rounded-md',
                          userData.emailStatus.enabled
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-red-500/15 text-red-300'
                        )}
                      >
                        {userData.emailStatus.enabled
                          ? 'Can log in'
                          : 'Cannot log in'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-md bg-text/10 dark:bg-white/10 text-text/80 dark:text-dark-text/80">
                        Verified{' '}
                        {userData.emailStatus.verified
                          ? formatDateShort(userData.emailStatus.verified)
                          : '—'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-md bg-text/10 dark:bg-white/10 text-text/80 dark:text-dark-text/80">
                        Newsletter:{' '}
                        {userData.emailStatus.subscribed ? 'Yes' : 'No'}
                      </span>
                    </>
                  )}
                  {userData.subscription?.[0]?.items?.[0] && (
                    <span className="text-xs px-2 py-1 rounded-md bg-text/10 dark:bg-white/10 text-text/80 dark:text-dark-text/80">
                      {userData.subscription[0].items[0].product_name}
                    </span>
                  )}
                  {userData.subscriptionError && (
                    <span className="text-xs px-2 py-1 rounded-md bg-amber-500/15 text-amber-200">
                      Membership: {userData.subscriptionError}
                    </span>
                  )}
                </div>
              </div>

              {userData.emailStatus && (
                <div className="shrink-0 self-start sm:self-center">
                  {userData.emailStatus.enabled ? (
                    <button
                      type="button"
                      disabled={patchLoading}
                      onClick={() => setLoginEnabled(0)}
                      className={clsx(
                        'text-xs font-medium px-3 py-2 rounded-md transition-colors',
                        'bg-amber-500/15 text-amber-200 hover:bg-amber-500/25',
                        'disabled:opacity-50 disabled:pointer-events-none'
                      )}
                    >
                      {patchLoading ? '…' : 'Disable login'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={patchLoading}
                      onClick={() => setLoginEnabled(1)}
                      className={clsx(
                        'text-xs font-medium px-3 py-2 rounded-md transition-colors',
                        'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30',
                        'disabled:opacity-50 disabled:pointer-events-none'
                      )}
                    >
                      {patchLoading ? '…' : 'Activate user'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
              {/* No second table for email/user id — only extra profile fields */}
              {profileRows.length > 0 && (
                <div className="pt-2 border-t border-text/10 dark:border-dark-text/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text/50 dark:text-dark-text/50 mb-2">
                    Profile & details
                  </p>
                  <DataTable rows={profileRows} />
                </div>
              )}
            </div>
          </section>

          {/* Form submissions */}
          {(userData.formSubmissions != null ||
            userData.formSubmissionsError) && (
            <Section title="Form submissions">
              {userData.formSubmissionsError && (
                <p className="text-sm text-amber-500 mb-4">
                  {userData.formSubmissionsError}
                </p>
              )}
              {userData.formSubmissions &&
                userData.formSubmissions.length === 0 &&
                !userData.formSubmissionsError && (
                  <p className="text-sm text-text/50 dark:text-dark-text/50">
                    No submissions linked to this user.
                  </p>
                )}
              {submissionError && (
                <div
                  className="mb-4 px-3 py-2 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-100 text-sm"
                  role="alert"
                >
                  {submissionError}
                </div>
              )}

              {submissionsByForm.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-text/50 dark:text-dark-text/50">
                    <span>
                      {`${userData.formSubmissions!.length} submission${
                        userData.formSubmissions!.length !== 1 ? 's' : ''
                      }`}
                    </span>
                    <button
                      type="button"
                      onClick={() => refetchUser()}
                      className="hover:text-text dark:hover:text-dark-text"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-6">
                    {submissionsByForm.map(([formKey, items]) => (
                      <div key={formKey} className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-text/50 dark:text-dark-text/50">
                          {formKey}{' '}
                          <span className="font-normal normal-case text-text/40">
                            ({items.length})
                          </span>
                        </h4>
                        <div className="rounded-lg border border-text/15 dark:border-dark-text/15 overflow-hidden divide-y divide-text/10 dark:divide-dark-text/10">
                          {items.map(sub => {
                            const patchId = submissionPatchId(sub);
                            const isArchived = Boolean(sub.archived);
                            const busy =
                              submissionActionId === patchId ||
                              submissionActionId === sub.id;
                            const payload = submissionPayload(sub);
                            const fields = submissionEntries(payload);
                            const history = Array.isArray(sub.status_history)
                              ? sub.status_history
                              : [];
                            const workflowStatus =
                              workflowStatusFromSubmission(sub);
                            const historyOpen =
                              historyOpenId === patchId ||
                              historyOpenId === sub.id;
                            const createdAt = sub.created_at || '';

                            return (
                              <div
                                key={patchId || sub.id || formKey}
                                className={clsx(
                                  'px-4 py-4 sm:px-5',
                                  isArchived &&
                                    'bg-text/[0.02] dark:bg-white/[0.02]'
                                )}
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span className="font-mono text-sm font-medium tabular-nums">
                                      #{(patchId || sub.id) ?? '—'}
                                    </span>
                                    {createdAt && (
                                      <span className="text-text/60 dark:text-dark-text/60 text-sm">
                                        {formatSubmissionDateShort(createdAt)}
                                      </span>
                                    )}
                                    {sub.user_id != null && (
                                      <span className="text-text/50 dark:text-dark-text/50 text-sm">
                                        user {sub.user_id}
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 flex-wrap">
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
                                      {workflowStatus ? (
                                        <span
                                          className={clsx(
                                            'text-[10px] font-medium px-1.5 py-0.5 rounded',
                                            'bg-text/10 dark:bg-white/10 text-text/80 dark:text-dark-text/80'
                                          )}
                                          title="Latest workflow status"
                                        >
                                          {workflowStatus}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-text/40 dark:text-dark-text/40">
                                          No status
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                                    <select
                                      key={`status-${patchId}-${history.length}-${sub.archived}-${workflowStatus ?? ''}`}
                                      aria-label="Set status"
                                      className="text-xs rounded-md border border-text/20 dark:border-dark-text/25 bg-bg dark:bg-dark-bg px-2 py-1.5 min-w-[9rem]"
                                      disabled={busy || !patchId}
                                      defaultValue=""
                                      onChange={e => {
                                        const v = e.target.value;
                                        e.target.value = '';
                                        if (v && patchId) {
                                          patchSubmission(
                                            patchId,
                                            { status: v },
                                            sub.form
                                          );
                                        }
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
                                        disabled={busy || !patchId}
                                        onClick={() =>
                                          patchId &&
                                          patchSubmission(
                                            patchId,
                                            { archived: 1 },
                                            sub.form
                                          )
                                        }
                                        className="text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-md border border-text/25 dark:border-dark-text/25 hover:bg-text/5 dark:hover:bg-white/5 disabled:opacity-50"
                                      >
                                        Archive
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={busy || !patchId}
                                        onClick={() =>
                                          patchId &&
                                          patchSubmission(
                                            patchId,
                                            { archived: 0 },
                                            sub.form
                                          )
                                        }
                                        className="text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-md border border-text/25 dark:border-dark-text/25 hover:bg-text/5 dark:hover:bg-white/5 disabled:opacity-50"
                                      >
                                        Unarchive
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {!patchId && (
                                  <p className="mt-2 text-xs text-amber-500/90">
                                    Missing submission id.
                                    <br />
                                    Needs submission_id or id for PATCH.
                                  </p>
                                )}
                                {history.length > 0 && (
                                  <div className="mt-2">
                                    {history.length === 1 ? (
                                      <p className="text-xs text-text/45 dark:text-dark-text/45">
                                        {formatHistoryLine(history[0])}
                                      </p>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          className="text-xs text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text"
                                          onClick={() =>
                                            setHistoryOpenId(
                                              historyOpen
                                                ? null
                                                : patchId || sub.id || null
                                            )
                                          }
                                        >
                                          {historyOpen ? 'Hide' : 'Show'}{' '}
                                          history ({history.length})
                                        </button>
                                        {historyOpen && (
                                          <ul className="mt-1.5 space-y-0.5 text-xs text-text/55 dark:text-dark-text/55">
                                            {history.map((h, idx) => (
                                              <li
                                                key={
                                                  typeof h === 'object' &&
                                                  h &&
                                                  'id' in h
                                                    ? String(
                                                        (h as { id: unknown })
                                                          .id
                                                      )
                                                    : idx
                                                }
                                              >
                                                {formatHistoryLine(h)}
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                                {fields.length > 0 && (
                                  <div className="mt-4">
                                    <SubmissionFieldsTable data={payload} />
                                  </div>
                                )}
                                {fields.length === 0 && (
                                  <p className="mt-3 text-xs text-text/40">
                                    No field data
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {!userData.user && !userData.emailStatus && (
            <div className="py-12 text-center text-text/50 dark:text-dark-text/50 text-sm rounded-lg border border-dashed border-text/15 dark:border-dark-text/15">
              No user data found for this email
            </div>
          )}
        </div>
      )}
    </div>
  );
}
