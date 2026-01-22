'use client';

/**
 * Tab Content Components
 * Separate components for each settings tab
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import BackendAPI, { type User } from '@/lib/backendApi';
import { FormRenderer } from '@/components/forms';
import type { FormConfig } from '@/components/forms';
import { AppLink, Button } from '@/components/ui';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface PersonalTabProps {
  formConfig: FormConfig;
  profileImage?: string;
  onProfileImageChange?: (imageDataUrl: string) => void;
}

export function PersonalTab({
  formConfig,
  profileImage,
  onProfileImageChange,
}: PersonalTabProps) {
  return (
    <FormRenderer
      config={formConfig}
      customFirstField={
        <ProfilePictureUpload
          currentImage={profileImage}
          onImageChange={onProfileImageChange}
        />
      }
    />
  );
}

interface BusinessTabProps {
  formConfig: FormConfig;
}

export function BusinessTab({ formConfig }: BusinessTabProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="border-b border-text pt-4 pb-8">
          <h2 className="text-lg font-medium">
            Uppgifter om din kreativa verksamhet
          </h2>
        </div>
      </div>
      <FormRenderer config={formConfig} />
    </div>
  );
}

interface AccountTabProps {
  formConfig: FormConfig;
  user?: User | null;
}

const accessOptions = [
  { value: 'member', label: 'Member' },
  { value: 'elevate', label: 'Elevate' },
  { value: 'shape', label: 'Shape' },
];

const getDefaultAccess = (user?: User | null) => {
  const roles = user?.roles?.map(role => role.toLowerCase()) || [];
  if (roles.includes('shape')) return 'shape';
  if (roles.includes('elevate')) return 'elevate';
  return 'member';
};

export function AccountTab({ formConfig, user }: AccountTabProps) {
  const router = useRouter();
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
      router.push('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="">
      <div className="border-b border-text">
        <div className="border-b border-text pt-4 pb-8 text-center">
          <h2 className="text-lg font-medium">Din access</h2>
          <p className="font-mono mt-4">
            Vill du uppgradera din access? Ansök via detta formulär.
          </p>
        </div>

        <div className="max-w-2xl mx-auto border-r border-l border-text p-12 my-2">
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
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="border-b border-text pt-4 pb-8">
          <h2 className="text-lg font-medium">Logga ut</h2>
        </div>
        <div className="max-w-2xl mx-auto border-r border-l border-text px-10 py-8">
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant="outline"
            className="w-full"
          >
            {loggingOut ? 'Loggar ut...' : 'Logga ut'}
          </Button>
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="border-b border-text pt-4 pb-8">
          <h2 className="text-lg font-medium">Ta bort konto</h2>
          <p className="text-sm text-text/70 dark:text-dark-text/70">
            Kontakta oss om du vill ta bort ditt konto.
          </p>
        </div>
        <div className="max-w-2xl mx-auto border-r border-l border-text px-10 py-8">
          <AppLink
            link={{ type: 'external', url: 'benji@varmeverket.com' }}
            className="uppercase border border-text rounded-md inline-block max-w-full text-center overflow-hidden text-ellipsis whitespace-nowrap select-none px-4 py-3.5 w-full"
          >
            benji@varmeverket.com
          </AppLink>
        </div>
      </div>

      {formConfig && formConfig.fields && formConfig.fields.length > 0 && (
        <FormRenderer config={formConfig} />
      )}
    </div>
  );
}
