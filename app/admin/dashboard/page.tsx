import { supabaseAdmin } from '@/lib/supabase';
import { checkAdminAuth } from '../actions';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

// Ensure the page is dynamic to fetch the latest values on load
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  // Retrieve all QR code rows from the database, newest first
  const { data: qrs, error } = await supabaseAdmin
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Dashboard DB read error:', error);
  }

  const list = qrs || [];

  // Compute analytical metrics
  const stats = {
    total: list.length,
    active: list.filter((x) => x.status === 'active').length,
    unregistered: list.filter((x) => x.status === 'unregistered').length,
    inactive: list.filter((x) => x.status === 'inactive').length,
    totalScans: list.reduce((acc, x) => acc + (x.scan_count || 0), 0),
  };

  return <DashboardClient initialQRCodes={list} stats={stats} />;
}
