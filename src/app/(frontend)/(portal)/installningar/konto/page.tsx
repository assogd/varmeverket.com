'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import BackendAPI, { type User } from '@/lib/backendApi';
import { FormRenderer } from '@/components/forms';
import type { FormConfig } from '@/components/forms';
import { AppLink, Button } from '@/components/ui';
import { SectionFrame } from '@/components/layout/SectionFrame';
import { useNotification } from '@/hooks/useNotification';
import { createAccountFormConfig } from '@/utils/settings/formConfigs';
import { handleAccountFormSubmit } from '@/utils/settings/handlers';
import { useSettingsTab } from '@/utils/settings/useSettingsTab';

const accessOptions = [
  { value: 'member', label: 'Member' },
  { value: 'elevate', label: 'Elevate' },
  { value: 'shape', label: 'Shape' },
];

function getDefaultAccess(user?: User | null) {
  const roles = user?.roles?.map(role => role.toLowerCase()) || [];
  if (roles.includes('shape')) return 'shape';
  if (roles.includes('elevate')) return 'elevate';
  return 'member';
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { showError } = useNotification();
  const { formConfig: accountFormConfig, user } = useSettingsTab(
    createAccountFormConfig,
    (user, data) => handleAccountFormSubmit(user!.email, data)
  );

  const [selectedAccess, setSelectedAccess] = useState(() =>
    getDefaultAccess(user)
  );
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setSelectedAccess(getDefaultAccess(user));
  }, [user]);

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
        <div className="mt-2 space-y-2 select-none">
          {accessOptions.map(option => {
            const isSelected = option.value === selectedAccess;
            return (
              <label
                key={option.value}
                className={clsx(
                  'flex items-center justify-between border border-text rounded-sm px-4 py-3 cursor-pointer',
                  isSelected && 'bg-text/10 dark:bg-dark-text/10',
                  !isSelected && 'opacity-50'
                )}
              >
                <span className="">{option.label}</span>
                <span
                  className={clsx(
                    'h-3.5 w-3.5 rounded-full border border-text flex items-center justify-center',
                    isSelected && 'bg-text'
                  )}
                />
                <input
                  type="radio"
                  name="access"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setSelectedAccess(option.value)}
                  className="sr-only"
                  disabled={!isSelected}
                />
              </label>
            );
          })}
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

      {accountFormConfig?.content?.length > 0 && (
        <FormRenderer config={accountFormConfig} />
      )}
    </>
  );
}
