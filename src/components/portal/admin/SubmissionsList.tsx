'use client';

import { useState, useEffect } from 'react';

interface FormSubmission {
  id: number;
  form: string;
  submission: Record<string, unknown>;
  user_id: number | null;
  created_at: string;
  archived: number;
}

interface SubmissionsListProps {
  formSlug: string;
  includeArchived?: boolean;
}

export function SubmissionsList({
  formSlug,
  includeArchived = false,
}: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formSlug) {
      setSubmissions([]);
      return;
    }

    const fetchSubmissions = async () => {
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
    };

    fetchSubmissions();
  }, [formSlug, includeArchived]);

  if (loading) {
    return (
      <div className="p-8 text-center text-text/70 dark:text-dark-text/70">
        Loading submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
          Error loading submissions
        </p>
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-text/70 dark:text-dark-text/70">
        No submissions found for form &quot;{formSlug}&quot;
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-text/70 dark:text-dark-text/70">
        Found {submissions.length} submission(s)
      </div>
      <div className="space-y-4">
        {submissions.map(submission => (
          <div
            key={submission.id}
            className="p-6 border border-text/20 dark:border-dark-text/20 rounded-lg bg-bg dark:bg-dark-bg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Submission #{submission.id}
                </h3>
                <div className="text-sm text-text/70 dark:text-dark-text/70 space-y-1">
                  <div>Form: {submission.form}</div>
                  <div>Created: {new Date(submission.created_at).toLocaleString()}</div>
                  {submission.user_id && (
                    <div>User ID: {submission.user_id}</div>
                  )}
                  <div>
                    Status:{' '}
                    {submission.archived ? (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Archived
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-text/10 dark:border-dark-text/10">
              <h4 className="text-sm font-medium mb-2">Submission Data:</h4>
              <pre className="text-xs p-4 bg-text/5 dark:bg-dark-text/5 rounded overflow-auto">
                {JSON.stringify(submission.submission, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
