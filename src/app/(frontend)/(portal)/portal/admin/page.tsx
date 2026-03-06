import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  // Redirect base admin route to submissions view
  redirect('/portal/admin/submissions');
}
