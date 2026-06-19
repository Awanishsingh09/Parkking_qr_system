'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.session) {
      return { success: false, error: 'Session could not be established.' };
    }

    // Set cookie using the access token
    const cookieStore = await cookies();
    cookieStore.set('parkping_admin_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.session.expires_in,
      path: '/',
    });

    return { success: true };
  } catch (err) {
    console.error('Admin login exception:', err);
    return { success: false, error: 'An unexpected authentication error occurred.' };
  }
}

export async function adminLogout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('parkping_admin_token');
    
    // Also sign out from Supabase client if possible
    await supabase.auth.signOut();
    
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('Logout error:', err);
    return { success: false, error: 'Failed to log out cleanly.' };
  }
}

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('parkping_admin_token')?.value;

    if (!token) {
      return false;
    }

    // Verify token with Supabase. This checks if the JWT is valid and unexpired
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    return true;
  } catch (err) {
    console.error('Auth check error:', err);
    return false;
  }
}
