'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { checkAdminAuth } from '../actions';
import { revalidatePath } from 'next/cache';

export async function bulkGenerateQRs(quantity: number) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  if (quantity <= 0 || quantity > 250) {
    return { success: false, error: 'Quantity must be between 1 and 250.' };
  }

  try {
    const rows = Array.from({ length: quantity }, () => ({
      status: 'unregistered' as const,
    }));

    const { data, error } = await supabaseAdmin
      .from('qr_codes')
      .insert(rows)
      .select();

    if (error) {
      console.error('Error bulk inserting QR codes:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/dashboard');
    return { success: true, count: data?.length || 0 };
  } catch (err) {
    console.error('Bulk generate exception:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function toggleQRStatus(id: string, currentStatus: 'unregistered' | 'active' | 'inactive') {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  if (currentStatus === 'unregistered') {
    return { success: false, error: 'Cannot toggle status of an unregistered QR code.' };
  }

  const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';

  try {
    const { error } = await supabaseAdmin
      .from('qr_codes')
      .update({ status: nextStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling QR status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath(`/qr/${id}`);
    return { success: true, nextStatus };
  } catch (err) {
    console.error('Toggle status exception:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteQR(id: string) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting QR code:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Delete QR exception:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
