import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { BACKEND_API_URL } from '@/lib/backendApi';
import { getInputClasses } from '@/components/forms/fields/shared/inputStyles';
import { fetchServerSession } from '@/lib/serverSession';
import { VarmeverketIcon } from '@/components/icons';
import { Heading } from '@/components/headings';
import { Button } from '@/components/ui';
import { LoginNotifications } from '@/components/auth/LoginNotifications';

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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 pt-12">
      <div className="w-full max-w-xs space-y-6">
        <Heading variant="section" as="h2" center className="pb-10">
          Logga in
        </Heading>

        <LoginNotifications errorMessage={errorMessage} />

        {sent && (
          <div className="space-y-2 text-center">
            <Heading variant="section" as="h2" center className="pb-2">
              Kolla din inkorg
            </Heading>
            <p className="text-sm">
              Vi har skickat en temporär inloggningslänk till dig.
            </p>
          </div>
        )}

        {!sent && (
          <form action={signOnAction} className="space-y-6">
            <div>
              <label htmlFor="login-email" className="hidden mb-2">
                Din epostadress
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="Din epostadress"
                className={getInputClasses()}
              />
              <p className="text-sm mt-2">
                En inloggningslänk kommer att skickas till dig.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-text text-[color:var(--color-bg)] hover:bg-text/90"
              variant="outline"
            >
              Gå vidare
            </Button>
          </form>
        )}

        <p className="text-center">
          Inte medlem?{' '}
          <Link className="underline" href="/membership/application">
            Ansök om medlemskap här
          </Link>
          .
        </p>
      </div>

      <Link href="/" className="mt-16">
        <VarmeverketIcon size={112} className="mx-auto" />
      </Link>
    </div>
  );
}
