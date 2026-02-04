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
                      text: 'Admin',
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
        <AdminNavigation />
        <div className="px-2 pb-24">{children}</div>
      </PageLayout>
    </ProtectedRoute>
  );
}
