'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackendAPI, { type Subscription } from '@/lib/backendApi';
import { FormRenderer } from '@/components/forms';
import { AppLink, Button, LoadingState } from '@/components/ui';
import { SectionFrame } from '@/components/layout/SectionFrame';
import { useNotification } from '@/hooks/useNotification';
import { createAccountFormConfig } from '@/utils/settings/formConfigs';
import { handleAccountFormSubmit } from '@/utils/settings/handlers';
import { useSettingsTab } from '@/utils/settings/useSettingsTab';

function getProductNameFromSubscription(
  subscription: Subscription[] | null
): string {
  const first = subscription?.[0];
  const item = first?.items?.[0];
  return item?.product_name ?? 'Community';
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { showError } = useNotification();
  const { formConfig: accountFormConfig, user, loading: settingsLoading } = useSettingsTab(
    createAccountFormConfig,
    (user, data) => handleAccountFormSubmit(user!.email, data)
  );

  const [subscription, setSubscription] = useState<Subscription[] | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      setSubscription(null);
      setSubscriptionLoading(false);
      return;
    }
    setSubscriptionLoading(true);
    setSubscriptionError(null);
    BackendAPI.getSubscription(user.email)
      .then(setSubscription)
      .catch(err => {
        console.error('Failed to load subscription:', err);
        setSubscriptionError(
          err instanceof Error ? err.message : 'Kunde inte hämta medlemskap'
        );
      })
      .finally(() => setSubscriptionLoading(false));
  }, [user?.email]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await BackendAPI.logout();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      showError('Kunde inte logga ut. Försök igen.');
      router.push('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <SectionFrame
        title="Din access"
        description="Vill du uppgradera din access? Ansök via detta formulär."
      >
        <p className="">Din aktuella access</p>
        <div className="mt-2 border border-text rounded-sm uppercase px-4 py-3 bg-text/10 dark:bg-dark-text/10">
          {subscriptionLoading ? (
            <span className="opacity-70">…</span>
          ) : subscriptionError ? (
            <span className="opacity-70">{subscriptionError}</span>
          ) : (
            getProductNameFromSubscription(subscription)
          )}
        </div>
      </SectionFrame>

      <SectionFrame title="Logga ut" variant="compact">
        <Button
          onClick={handleLogout}
          disabled={loggingOut}
          variant="outline"
          className="w-full"
        >
          {loggingOut ? 'Loggar ut...' : 'Logga ut'}
        </Button>
      </SectionFrame>

      <SectionFrame
        title="Ta bort konto"
        description="Kontakta oss om du vill ta bort ditt konto."
      >
        <AppLink
          link={{ type: 'external', url: 'benji@varmeverket.com' }}
          className="uppercase border border-text rounded-md inline-block max-w-full text-center overflow-hidden text-ellipsis whitespace-nowrap select-none px-4 py-3.5 w-full"
        >
          benji@varmeverket.com
        </AppLink>
      </SectionFrame>

      {(accountFormConfig?.content?.length ?? 0) > 0 &&
        (settingsLoading ? (
          <LoadingState message="Laddar dina uppgifter…" />
        ) : (
          <FormRenderer config={accountFormConfig} />
        ))}
    </>
  );
}
