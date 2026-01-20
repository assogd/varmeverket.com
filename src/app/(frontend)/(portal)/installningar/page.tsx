'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import BackendAPI, { type User } from '@/lib/backendApi';
import type { FormConfig } from '@/components/forms';
import clsx from 'clsx';

// Settings imports
import { TABS, type TabType } from '@/utils/settings/constants';
import {
  createPersonalFormConfig,
  createBusinessFormConfig,
  createAccountFormConfig,
} from '@/utils/settings/formConfigs';
import {
  handlePersonalFormSubmit,
  handleBusinessFormSubmit,
  handleAccountFormSubmit,
} from '@/utils/settings/handlers';
import {
  PersonalTab,
  BusinessTab,
  AccountTab,
} from '@/components/portal/settings/components/TabContent';

export default function SettingsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | undefined>();

  // ==========================================================================
  // Data Loading
  // ==========================================================================

  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      BackendAPI.getUserByEmail(user.email)
        .then(data => {
          setUserData(data);
          if (data.profileImage) {
            setProfileImage(data.profileImage);
          }
        })
        .catch(error => {
          console.error('Failed to load user data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  // ==========================================================================
  // Form Submission Handlers
  // ==========================================================================

  const handlePersonalSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handlePersonalFormSubmit(user.email, data);
        alert('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [user?.email]
  );

  const handleBusinessSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handleBusinessFormSubmit(user.email, data);
        alert('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [user?.email]
  );

  const handleAccountSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handleAccountFormSubmit(user.email, data);
        alert('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [user?.email]
  );

  // ==========================================================================
  // Form Configurations
  // ==========================================================================

  const personalFormConfig: FormConfig = useMemo(
    () => createPersonalFormConfig(user, handlePersonalSubmit),
    [user, handlePersonalSubmit]
  );

  const businessFormConfig: FormConfig = useMemo(
    () => createBusinessFormConfig(user, handleBusinessSubmit),
    [user, handleBusinessSubmit]
  );

  const accountFormConfig: FormConfig = useMemo(
    () => createAccountFormConfig(user, handleAccountSubmit),
    [user, handleAccountSubmit]
  );

  // ==========================================================================
  // Render
  // ==========================================================================

  if (sessionLoading || loading) {
    return (
      <ProtectedRoute>
        <PageLayout contentType="page">
          <div className="max-w-4xl mx-auto px-8 pb-8">
            <p className="text-text/70 dark:text-dark-text/70">Laddar...</p>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageLayout contentType="page">
        <PageHeaderTextOnly
          text={{
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'Inställningar',
                      type: 'text',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'heading',
                  tag: 'h1',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'root',
              version: 1,
            },
          }}
        />
        <div className="max-w-4xl mx-auto px-8 pb-24">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-text/20 dark:border-dark-text/20">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'pb-4 px-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-text dark:text-dark-text border-b-2 border-text dark:border-dark-text'
                    : 'text-text/70 dark:text-dark-text/70 hover:text-text dark:hover:text-dark-text'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'personal' && (
            <PersonalTab
              formConfig={personalFormConfig}
              profileImage={profileImage}
              onProfileImageChange={setProfileImage}
            />
          )}

          {activeTab === 'business' && (
            <BusinessTab formConfig={businessFormConfig} />
          )}

          {activeTab === 'account' && (
            <AccountTab formConfig={accountFormConfig} />
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
