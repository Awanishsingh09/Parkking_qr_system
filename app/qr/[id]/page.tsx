import { supabaseAdmin } from '@/lib/supabase';
import QRScannerClient from './QRScannerClient';
import { AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QRPage({ params }: PageProps) {
  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUuid = uuidRegex.test(id);

  let qrCode = null;
  let fetchError = false;

  if (isValidUuid) {
    try {
      const { data, error } = await supabaseAdmin
        .from('qr_codes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching QR code:', error);
        fetchError = true;
      } else {
        qrCode = data;
      }
    } catch (err) {
      console.error('Fetch exception:', err);
      fetchError = true;
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-black flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Navbar */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:border-teal-500/50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase">Home</span>
        </Link>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
          <Shield className="w-4 h-4 text-teal-500/80" />
          <span>ParkPing Secure</span>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-grow flex items-center justify-center">
        {!isValidUuid || (!qrCode && !fetchError) ? (
          <div className="w-full max-w-md p-8 bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl text-center shadow-2xl relative overflow-hidden text-slate-100">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
            <div className="mx-auto w-16 h-16 bg-red-950/45 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">QR Code Not Found</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              We couldn&apos;t find a valid ParkPing sticker matching this code.
              Please check if you scanned the right QR code or contact support.
            </p>
            <div className="h-px bg-slate-850 my-4" />
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : fetchError ? (
          <div className="w-full max-w-md p-8 bg-slate-900/85 backdrop-blur-xl border border-red-500/20 rounded-3xl text-center shadow-2xl relative overflow-hidden text-slate-100">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
            <div className="mx-auto w-16 h-16 bg-red-950/45 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              There was a problem communicating with our database. Please check your internet connection and try scanning again.
            </p>
          </div>
        ) : (
          <QRScannerClient id={id} initialData={qrCode} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-600">
        <p>&copy; {new Date().getFullYear()} ParkPing. All rights reserved.</p>
        <p className="mt-1 text-[10px] text-slate-700">QR-Based Instant Vehicle Contact System</p>
      </footer>
    </div>
  );
}
