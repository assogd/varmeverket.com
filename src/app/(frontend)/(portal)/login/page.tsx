import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { BACKEND_API_URL } from '@/lib/backendApi';
import { getInputClasses } from '@/components/forms/fields/shared/inputStyles';
import { fetchServerSession } from '@/lib/serverSession';

async function signOnAction(formData: FormData) {
  'use server';
  const email = String(formData.get('email') || '').trim();
  if (!email) {
    redirect('/login?error=' + encodeURIComponent('Email är obligatorisk.'));
  }

  const origin = headers().get('origin');
  const redirectUrl = origin
    ? `${origin}/dashboard`
    : 'https://www.varmeverket.com/dashboard';

  const response = await fetch(
    `${BACKEND_API_URL}/session/sign-on?redirect=${encodeURIComponent(
      redirectUrl
    )}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      (data as { message?: string })?.message ||
      'Kunde inte skicka magic link. Försök igen.';
    redirect('/login?error=' + encodeURIComponent(message));
  }

  redirect('/login?sent=1');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { sent?: string; error?: string };
}) {
  const headerCookie = headers().get('cookie') || '';
  const session = await fetchServerSession(headerCookie);
  if (session?.user) {
    redirect('/dashboard');
  }

  const errorMessage =
    typeof searchParams?.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : null;
  const sent = searchParams?.sent === '1';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Sign In</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter your email address and we&apos;ll send you a magic link to
            sign in.
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 rounded border bg-red-50 border-red-500 text-red-800">
              <p className="font-mono text-sm">{errorMessage}</p>
            </div>
          )}

          {sent && (
            <div className="mb-6 p-4 rounded border bg-green-50 border-green-500 text-green-800">
              <p className="font-mono text-sm">
                Check your inbox for a magic link to sign in. Click the link to
                complete your sign-in.
              </p>
            </div>
          )}

          <form action={signOnAction} className="space-y-6">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium mb-2"
              >
                Email Address <span aria-hidden="true">*</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="user@example.com"
                className={getInputClasses()}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                We&apos;ll send you a magic link to sign in
              </p>
            </div>
            <button
              type="submit"
              className="uppercase bg-text text-bg mix-blend-multiply rounded-md block text-center w-full px-4 py-3.5 transition-transform duration-75 ease-out active:scale-[0.99] hover:bg-opacity-90"
            >
              Send Magic Link
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              After clicking the link in your email, you&apos;ll be
              automatically signed in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
