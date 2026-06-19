import Link from 'next/link';
import { 
  QrCode, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  UserCheck, 
  ArrowRight, 
  Car, 
  EyeOff, 
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-teal-500/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header / Nav */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-white tracking-wider text-lg">ParkPing</span>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:text-white transition-all text-xs font-semibold tracking-wider text-slate-300"
        >
          Admin Console
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
          <Zap className="w-3.5 h-3.5 fill-teal-400/25" />
          Smart Parking Contact Solution
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Shield Your Vehicle. <br />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
            Stay Instantly Reachable.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The QR-based contact sticker that lets people ping you via Call or WhatsApp when your car blocks traffic or has an emergency — without revealing your phone number to public databases or scrapers.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-650 hover:to-emerald-650 text-slate-950 font-bold transition-all shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] w-full sm:w-auto justify-center cursor-pointer text-sm"
          >
            Go to Admin Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-350 hover:text-white transition-all text-sm font-semibold w-full sm:w-auto"
          >
            How it Works
          </a>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-900/60">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Privacy First</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No online searchable phone book. Scanners must physically scan your car&apos;s sticker, protecting you from cold callers and web scrapers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">WhatsApp & Call</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Scanners get instant direct buttons to ping your WhatsApp or initiate a quick mobile call. No custom apps to install.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Full Control</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Selling your vehicle or losing the sticker? Toggle it to &apos;Inactive&apos; inside your dashboard to block all communications instantly.
            </p>
          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-slate-900/20 py-20 border-t border-slate-900/60">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Simple 3-Step Setup</h2>
            <p className="text-sm text-slate-400">How ParkPing protects your vehicle on the streets</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 p-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-xl font-black text-teal-400">
                1
              </div>
              <h3 className="font-bold text-white">Generate & Print</h3>
              <p className="text-xs text-slate-450 leading-relaxed max-w-xs">
                Log into the Admin Console, bulk-generate stickers, and download high-resolution QR PNGs to print as vehicle stickers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 p-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-xl font-black text-amber-400">
                2
              </div>
              <h3 className="font-bold text-white">Scan & Register</h3>
              <p className="text-xs text-slate-450 leading-relaxed max-w-xs">
                Stick it on your vehicle. Scanning the code for the first time opens an owner registration form to link your details instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 p-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-xl font-black text-cyan-400">
                3
              </div>
              <h3 className="font-bold text-white">Park Securely</h3>
              <p className="text-xs text-slate-450 leading-relaxed max-w-xs">
                If your car blocks someone or is in an emergency, they scan the QR to call or WhatsApp you directly. Safe and stress-free!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
        <p>&copy; {new Date().getFullYear()} ParkPing. All rights reserved.</p>
        <p className="text-[10px] text-slate-650">Designed with next-generation security and premium user experience.</p>
      </footer>

    </div>
  );
}
