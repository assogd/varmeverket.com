'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

type SavedEvent = {
  id: number;
  user_id: number;
  article_id: string;
  created_at: string;
};

type PayloadEvent = {
  id: string;
  slug: string;
  title: string;
  startDateTime: string | null;
  endDateTime: string | null;
};

function formatEventDate(start: string | null, end: string | null): string {
  if (!start) return '—';
  const d = new Date(start);
  const dateStr = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (!end) return `${dateStr} · ${timeStr}`;
  const e = new Date(end);
  const endTimeStr = e.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr} · ${timeStr} – ${endTimeStr}`;
}

function EventCard({
  event,
  onAdd,
  onRemove,
}: {
  event: PayloadEvent;
  onAdd: (articleId: string, email: string) => Promise<void>;
  onRemove: (articleId: string, email: string) => Promise<void>;
}) {
  const [addEmail, setAddEmail] = useState('');
  const [removeEmail, setRemoveEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [addMessage, setAddMessage] = useState<string | null>(null);
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);

  const handleAdd = async () => {
    const email = addEmail.trim();
    if (!email) return;
    setAdding(true);
    setAddMessage(null);
    try {
      await onAdd(event.id, email);
      setAddMessage(`Added ${email}`);
      setAddEmail('');
    } catch (e) {
      setAddMessage(e instanceof Error ? e.message : 'Failed');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async () => {
    const email = removeEmail.trim();
    if (!email) return;
    setRemoving(true);
    setRemoveMessage(null);
    try {
      await onRemove(event.id, email);
      setRemoveMessage(`Removed ${email}`);
      setRemoveEmail('');
    } catch (e) {
      setRemoveMessage(e instanceof Error ? e.message : 'Failed');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <article
      className={clsx(
        'rounded-xl border border-text/15 dark:border-dark-text/15 overflow-hidden',
        'bg-bg dark:bg-dark-bg shadow-sm transition-shadow hover:shadow-md'
      )}
    >
      <div className="p-5">
        <h3 className="font-semibold text-lg text-text dark:text-dark-text mb-1">
          {event.title || event.slug || event.id}
        </h3>
        <p className="text-sm text-text/70 dark:text-dark-text/70 mb-2">
          {formatEventDate(event.startDateTime, event.endDateTime)}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-text/50 dark:text-dark-text/50">
          {event.slug && (
            <span className="font-mono bg-text/5 dark:bg-dark-text/5 px-2 py-0.5 rounded">
              {event.slug}
            </span>
          )}
          <span className="font-mono truncate max-w-[12rem]" title={event.id}>
            ID: {event.id}
          </span>
        </div>

        <div className="mt-4 border-t border-text/10 dark:border-dark-text/10 pt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text/60 dark:text-dark-text/60 mb-2">
              Manage users
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text/60 dark:text-dark-text/60 mb-1">
                  Add user to this event
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={addEmail}
                    onChange={e => setAddEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="user@example.com"
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-text/20 dark:border-dark-text/20 rounded-lg bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
                  />
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={adding}
                    className="px-3 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 shrink-0"
                  >
                    {adding ? 'Adding…' : 'Add'}
                  </button>
                </div>
                {addMessage && (
                  <p
                    className={clsx(
                      'mt-1 text-xs',
                      addMessage.startsWith('Added')
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-red-700 dark:text-red-300'
                    )}
                  >
                    {addMessage}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-text/60 dark:text-dark-text/60 mb-1">
                  Remove user from this event
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={removeEmail}
                    onChange={e => setRemoveEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRemove()}
                    placeholder="user@example.com"
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-text/20 dark:border-dark-text/20 rounded-lg bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
                  />
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={removing}
                    className="px-3 py-2 text-sm font-medium rounded-lg bg-red-600/90 text-white hover:bg-red-700 disabled:opacity-50 shrink-0"
                  >
                    {removing ? 'Removing…' : 'Remove'}
                  </button>
                </div>
                {removeMessage && (
                  <p
                    className={clsx(
                      'mt-1 text-xs',
                      removeMessage.startsWith('Removed')
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-red-700 dark:text-red-300'
                    )}
                  >
                    {removeMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function EventsList() {
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payloadEvents, setPayloadEvents] = useState<PayloadEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const res = await fetch('/api/admin/payload-events', { method: 'GET' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            (data as { message?: string }).message ||
              'Failed to load events from Payload'
          );
        }
        if (!cancelled) {
          setPayloadEvents(
            ((data as { events?: PayloadEvent[] }).events || []).map(e => ({
              ...e,
              startDateTime: e.startDateTime ?? null,
              endDateTime: e.endDateTime ?? null,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setEventsError(
            err instanceof Error ? err.message : 'Failed to load events'
          );
        }
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter an email address');
      setEvents([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/events?email=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { message?: string }).message ||
            'Failed to fetch saved events'
        );
      }
      setEvents((data as { savedEvents?: SavedEvent[] }).savedEvents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const addUserToEvent = async (articleId: string, userEmail: string) => {
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, articleId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        (data as { message?: string }).message || 'Failed to add user'
      );
    }
  };

  const removeUserFromEvent = async (articleId: string, userEmail: string) => {
    const res = await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, articleId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        (data as { message?: string }).message || 'Failed to remove user'
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Event cards */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text/70 dark:text-dark-text/70 mb-4">
          Events
        </h2>
        {eventsError && (
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {eventsError}
          </p>
        )}
        {eventsLoading ? (
          <div className="py-12 text-center text-text/60 dark:text-dark-text/60 text-sm">
            Loading events…
          </div>
        ) : payloadEvents.length === 0 ? (
          <div className="py-12 text-center text-text/60 dark:text-dark-text/60 text-sm rounded-xl border border-dashed border-text/20 dark:border-dark-text/20">
            No events from Payload. Add events in the CMS to manage assignments
            here.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payloadEvents.map(ev => (
              <EventCard
                key={ev.id}
                event={ev}
                onAdd={addUserToEvent}
                onRemove={removeUserFromEvent}
              />
            ))}
          </div>
        )}
      </section>

      {/* Look up by user email */}
      <section className="border-t border-text/15 dark:border-dark-text/15 pt-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text/70 dark:text-dark-text/70">
          Look up saved events by user email
        </h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label
              htmlFor="userEmailLookup"
              className="block text-xs font-medium text-text/60 dark:text-dark-text/60 mb-1"
            >
              User email
            </label>
            <input
              id="userEmailLookup"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="user@example.com"
              className="w-full px-3 py-2 text-sm border border-text/20 dark:border-dark-text/20 rounded-lg bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-text/10 dark:bg-dark-text/10 text-text dark:text-dark-text hover:bg-text/20 dark:hover:bg-dark-text/20 disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        )}
        {!loading && email.trim() && events.length === 0 && (
          <p className="text-sm text-text/60 dark:text-dark-text/60">
            No saved events for this user.
          </p>
        )}
        {!loading && events.length > 0 && (
          <div className="rounded-lg border border-text/15 dark:border-dark-text/15 divide-y divide-text/10 dark:divide-dark-text/10">
            <p className="px-4 py-2 text-xs font-medium text-text/50 dark:text-dark-text/50">
              {events.length} saved event{events.length !== 1 ? 's' : ''}
            </p>
            {events.map(ev => (
              <div
                key={ev.id}
                className="px-4 py-3 text-sm flex flex-wrap items-center gap-2"
              >
                <span className="font-mono text-xs text-text/60 dark:text-dark-text/60">
                  {ev.article_id}
                </span>
                <span className="text-text/50 dark:text-dark-text/50">
                  {new Date(ev.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
