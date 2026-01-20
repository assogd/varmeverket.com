'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import BackendAPI, { type User } from '@/lib/backendApi';
import clsx from 'clsx';

type TabType = 'personal' | 'business' | 'account';

interface PersonalFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  location: string;
  gender: string;
  profileImage?: string;
}

export default function SettingsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PersonalFormData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    gender: '',
  });

  // Load user data
  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      BackendAPI.getUserByEmail(user.email)
        .then(data => {
          setUserData(data);
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: '',
            dateOfBirth: '',
            location: '',
            gender: '',
          });
        })
        .catch(error => {
          console.error('Failed to load user data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const handleInputChange = (field: keyof PersonalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.email) return;

    setSaving(true);
    try {
      await BackendAPI.updateUser(user.email, {
        name: formData.name,
        email: formData.email,
      });
      // TODO: Save additional fields (phone, DOB, location, gender) when backend supports them
      alert('Inställningar sparade!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Kunde inte spara inställningar. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement image upload to backend
      console.log('Image upload:', file);
    }
  };

  const tabs = [
    { id: 'personal' as TabType, label: 'PERSONLIGT' },
    { id: 'business' as TabType, label: 'VERKSAMHET' },
    { id: 'account' as TabType, label: 'KONTO' },
  ];

  const genderOptions = [
    { value: 'man', label: 'Man' },
    { value: 'kvinna', label: 'Kvinna' },
    { value: 'icke-binär', label: 'Icke-binär' },
    { value: 'vill-ej-uppge', label: 'Vill ej uppge' },
    { value: 'övrigt', label: 'Övrigt' },
  ];

  const locationOptions = [
    { value: 'stockholm', label: 'Stockholm' },
    { value: 'goteborg', label: 'Göteborg' },
    { value: 'malmo', label: 'Malmö' },
    { value: 'uppsala', label: 'Uppsala' },
    { value: 'linkoping', label: 'Linköping' },
    { value: 'örebro', label: 'Örebro' },
    { value: 'annat', label: 'Annat' },
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
              <h2 className="text-lg font-medium mb-6">Personuppgifter</h2>

              {/* Profile Picture */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">Profilbild</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-lg bg-text/10 dark:bg-dark-text/10 flex items-center justify-center overflow-hidden">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
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

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Namn
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="För- och efternamn"
                  className="w-full px-4 py-3 bg-transparent border border-text/30 dark:border-dark-text/30 rounded-md focus:outline-none focus:border-text dark:focus:border-dark-text transition-colors"
                />
                <p className="text-xs text-text/60 dark:text-dark-text/60">
                  Detta är ditt offentliga visningsnamn.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="Din e-postadress"
                  className="w-full px-4 py-3 bg-transparent border border-text/30 dark:border-dark-text/30 rounded-md focus:outline-none focus:border-text dark:focus:border-dark-text transition-colors"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium">
                  Mobilnummer
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder="Ditt mobilnummer"
                  className="w-full px-4 py-3 bg-transparent border border-text/30 dark:border-dark-text/30 rounded-md focus:outline-none focus:border-text dark:focus:border-dark-text transition-colors"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium"
                >
                  Födelsedatum
                </label>
                <input
                  type="text"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={e =>
                    handleInputChange('dateOfBirth', e.target.value)
                  }
                  placeholder="MM/DD/AAAA"
                  className="w-full px-4 py-3 bg-transparent border border-text/30 dark:border-dark-text/30 rounded-md focus:outline-none focus:border-text dark:focus:border-dark-text transition-colors"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium">
                  Vart är du baserad?
                </label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-text/30 dark:border-dark-text/30 rounded-md focus:outline-none focus:border-text dark:focus:border-dark-text transition-colors"
                >
                  <option value="">Välj</option>
                  {locationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Vilket kön identifierar du dig som?
                </label>
                <div className="space-y-2">
                  {genderOptions.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          checked={formData.gender === option.value}
                          onChange={e =>
                            handleInputChange('gender', e.target.value)
                          }
                          className="sr-only"
                        />
                        <div
                          className={clsx(
                            'w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center',
                            formData.gender === option.value
                              ? 'border-text dark:border-dark-text'
                              : 'border-text/30 dark:border-dark-text/30 group-hover:border-text/50 dark:group-hover:border-dark-text/50'
                          )}
                        >
                          {formData.gender === option.value && (
                            <div className="w-2 h-2 rounded-full bg-text dark:bg-dark-text" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={clsx(
                    'w-full px-6 py-4 bg-text dark:bg-dark-text text-bg dark:text-dark-bg rounded-md font-medium uppercase transition-opacity',
                    saving
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:opacity-90'
                  )}
                >
                  {saving ? 'SPARAR...' : 'SPARA'}
                </button>
              </div>
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
