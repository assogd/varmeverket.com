import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { BACKEND_API_URL } from '@/lib/backendApi';
import { getInputClasses } from '@/components/forms/fields/shared/inputStyles';
import { fetchServerSession } from '@/lib/serverSession';
import { VarmeverketIcon } from '@/components/icons';
import { Heading } from '@/components/headings';

async function signOnAction(formData: FormData) {
  'use server';
  const email = String(formData.get('email') || '').trim();
  if (!email) {
    redirect('/login?error=' + encodeURIComponent('Email är obligatorisk.'));
  }

  const headerList = await headers();
  const origin = headerList.get('origin');
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
  const headerList = await headers();
  const headerCookie = headerList.get('cookie') || '';
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-3">
          <Heading variant="section" as="h2" center>
            Logga in
          </Heading>
        </div>

        {errorMessage && (
          <div className="p-4 rounded border bg-red-50 border-red-500 text-red-800">
            <p className="font-mono text-sm">{errorMessage}</p>
          </div>
        )}

        {sent && (
          <div className="p-4 rounded border bg-green-50 border-green-500 text-green-800">
            <p className="font-mono text-sm">
              Kolla din inkorg. Vi har skickat en temporär inloggningslänk till
              dig.
            </p>
          </div>
        )}

        {!sent && (
          <form action={signOnAction} className="space-y-6">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium mb-2"
              >
                Din epostadress <span aria-hidden="true">*</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="Din epostadress"
                className={getInputClasses()}
              />
              <p className="text-xs text-text/70 dark:text-dark-text/70 mt-2">
                En inloggningslänk kommer att skickas till dig.
              </p>
            </div>
            <button
              type="submit"
              className="uppercase bg-text text-bg mix-blend-multiply rounded-md block text-center w-full px-4 py-3.5 transition-transform duration-75 ease-out active:scale-[0.99] hover:bg-opacity-90"
            >
              GÅ VIDARE
            </button>
          </form>
        )}

        <p className="text-sm text-text/70 dark:text-dark-text/70">
          Inte medlem?{' '}
          <Link className="underline" href="/membership/application">
            Ansök om medlemskap här.
          </Link>
        </p>
      </div>

      <div className="mt-16 text-text">
        <VarmeverketIcon size={72} className="mx-auto" />
      </div>
    </div>
  );
}
