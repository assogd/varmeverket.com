'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageLayout from '@/components/layout/PageLayout';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import { AdminNavigation } from '@/components/portal/admin/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <PageLayout contentType="page">
        <AdminNavigation />
        <div className="px-2 h-screen">{children}</div>
      </PageLayout>
    </ProtectedRoute>
  );
}
