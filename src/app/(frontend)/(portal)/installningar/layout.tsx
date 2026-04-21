'use client';

import { SettingsNavigation } from '@/components/portal/settings/SettingsNavigation';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <PageLayout
        contentType="page"
        paddingBottom={false}
        className="pb-20 sm:pb-0"
      >
        <PageHeaderTextOnly title="Inställningar" />
        <SettingsNavigation />
        {children}
      </PageLayout>
    </ProtectedRoute>
  );
}
