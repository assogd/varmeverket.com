'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import BackendAPI, { type User } from '@/lib/backendApi';
import { FormRenderer, createField, createSection } from '@/components/forms';
import type { FormConfig } from '@/components/forms';
import clsx from 'clsx';

type TabType = 'personal' | 'business' | 'account';

export default function SettingsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | undefined>();

  // Load user data
  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      BackendAPI.getUserByEmail(user.email)
        .then(data => {
          setUserData(data);
          // Profile image would come from user data when backend supports it
        })
        .catch(error => {
          console.error('Failed to load user data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement image upload to backend
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;

      try {
        await BackendAPI.updateUser(user.email, {
          name: data.name as string,
          email: data.email as string,
        });
        // TODO: Save additional fields (phone, DOB, location, gender) when backend supports them
        // These fields are currently only validated but not saved to backend
        alert('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [user?.email]
  );

  // Create form config with pre-filled values from user data
  const personalFormConfig: FormConfig = useMemo(() => {
    const defaultValues = {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      dateOfBirth: '',
      location: '',
      gender: '',
    };

    return {
      sections: [
        createSection('Personuppgifter', [
          createField('name', 'Namn', 'text', {
            required: true,
            placeholder: 'För- och efternamn',
            helpText: 'Detta är ditt offentliga visningsnamn.',
            defaultValue: defaultValues.name,
          }),
          createField('email', 'Email', 'email', {
            required: true,
            placeholder: 'Din e-postadress',
            defaultValue: defaultValues.email,
          }),
          createField('phone', 'Mobilnummer', 'tel', {
            required: true,
            placeholder: 'Ditt mobilnummer',
            defaultValue: defaultValues.phone,
          }),
          createField('dateOfBirth', 'Födelsedatum', 'date', {
            required: true,
            placeholder: 'MM/DD/AAAA',
            defaultValue: defaultValues.dateOfBirth,
          }),
          createField('location', 'Vart är du baserad?', 'select', {
            required: true,
            placeholder: 'Välj',
            defaultValue: defaultValues.location,
            options: [
              { label: 'Stockholm', value: 'stockholm' },
              { label: 'Göteborg', value: 'goteborg' },
              { label: 'Malmö', value: 'malmo' },
              { label: 'Uppsala', value: 'uppsala' },
              { label: 'Linköping', value: 'linkoping' },
              { label: 'Örebro', value: 'örebro' },
              { label: 'Annat', value: 'annat' },
            ],
          }),
          createField(
            'gender',
            'Vilket kön identifierar du dig som?',
            'select',
            {
              required: true,
              defaultValue: defaultValues.gender,
              options: [
                { label: 'Man', value: 'man' },
                { label: 'Kvinna', value: 'kvinna' },
                { label: 'Icke-binär', value: 'icke-binär' },
                { label: 'Vill ej uppge', value: 'vill-ej-uppge' },
                { label: 'Övrigt', value: 'övrigt' },
              ],
            }
          ),
        ]),
      ],
      submitButtonLabel: 'SPARA',
      onSubmit: handleFormSubmit,
      successMessage: 'Inställningar sparade!',
      showSuccessMessage: true,
    };
  }, [user, handleFormSubmit]);

  const tabs = [
    { id: 'personal' as TabType, label: 'PERSONLIGT' },
    { id: 'business' as TabType, label: 'VERKSAMHET' },
    { id: 'account' as TabType, label: 'KONTO' },
  ];

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
            {tabs.map(tab => (
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
            <div className="space-y-8">
              {/* Profile Picture */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">Profilbild</label>
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 rounded-lg bg-text/10 dark:bg-dark-text/10 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-text/5 dark:bg-dark-text/5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/jpeg,image/png"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-image"
                      className="inline-block px-4 py-2 border border-text/30 dark:border-dark-text/30 rounded-md cursor-pointer hover:bg-text/5 dark:hover:bg-dark-text/5 transition-colors"
                    >
                      BYT UT BILD
                    </label>
                    <p className="text-xs text-text/60 dark:text-dark-text/60 mt-2">
                      Bilden bör vara en jpg eller png.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <FormRenderer config={personalFormConfig} />
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium mb-6">Verksamhet</h2>
              <p className="text-text/70 dark:text-dark-text/70">
                Verksamhetsinställningar kommer snart...
              </p>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium mb-6">Konto</h2>
              <p className="text-text/70 dark:text-dark-text/70">
                Kontoinställningar kommer snart...
              </p>
            </div>
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
