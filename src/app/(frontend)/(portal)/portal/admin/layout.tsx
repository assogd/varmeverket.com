'use client';

import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import PageLayout from '@/components/layout/PageLayout';
import { AdminNavigation } from '@/components/portal/admin/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <PageLayout contentType="page">
        <AdminNavigation />
        <div className="px-2 min-h-screen">{children}</div>
      </PageLayout>
    </AdminProtectedRoute>
  );
}
