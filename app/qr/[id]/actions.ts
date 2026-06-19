'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function registerVehicle(id: string, formData: FormData) {
  const ownerName = formData.get('ownerName') as string;
  const phone = formData.get('phone') as string;
  const carNumber = formData.get('carNumber') as string;
  const vehicleType = formData.get('vehicleType') as string;

  if (!ownerName || !phone || !carNumber || !vehicleType) {
    return { success: false, error: 'All fields are required.' };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { success: false, error: 'Invalid QR ID format.' };
  }

  try {
    // Attempt to update the QR code.
    // The RLS policy allows UPDATE if current status is 'unregistered' and new status is 'active'.
    const { data, error } = await supabase
      .from('qr_codes')
      .update({
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        car_number: carNumber.trim().toUpperCase(),
        vehicle_type: vehicleType,
        status: 'active',
        registered_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'unregistered')
      .select();

    if (error) {
      console.error('Database update error during registration:', error);
      return { success: false, error: 'Registration failed. The QR code may already be registered or deactivated.' };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'QR Code not found or already registered.' };
    }

    // Revalidate paths to refresh cache
    revalidatePath(`/qr/${id}`);
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (err) {
    console.error('Registration server error:', err);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

export async function incrementScan(id: string) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { success: false, error: 'Invalid QR ID format.' };
  }

  try {
    // Call the Postgres RPC function
    const { error } = await supabase.rpc('increment_scan', { qr_id: id });

    if (error) {
      console.error('Error executing increment_scan RPC:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/qr/${id}`);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Increment scan server error:', err);
    return { success: false };
  }
}
