'use client';

import { useState, useEffect } from 'react';
import { registerVehicle, incrementScan } from './actions';
import { 
  Car, 
  Bike, 
  Smartphone, 
  MessageSquare, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Hash, 
  ChevronRight, 
  Loader2, 
  PhoneCall, 
  Share2,
  Calendar,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRCodeData {
  id: string;
  status: 'unregistered' | 'active' | 'inactive';
  owner_name?: string;
  phone?: string;
  car_number?: string;
  vehicle_type?: string;
  created_at?: string;
  registered_at?: string;
}

const maskPhone = (phone?: string) => {
  if (!phone) return '';
  const trimmed = phone.trim();
  
  if (trimmed.startsWith('+')) {
    const hasSpace = trimmed.indexOf(' ') > 0;
    if (hasSpace) {
      const parts = trimmed.split(' ');
      const countryCode = parts[0];
      const mainNumber = parts.slice(1).join(' ');
      if (mainNumber.length > 4) {
        return `${countryCode} ${'•'.repeat(mainNumber.length - 3)}${mainNumber.slice(-3)}`;
      }
    }
    return `${trimmed.slice(0, 4)}${'•'.repeat(Math.max(0, trimmed.length - 7))}${trimmed.slice(-3)}`;
  } else {
    if (trimmed.length > 6) {
      return `${trimmed.slice(0, 2)}${'•'.repeat(trimmed.length - 5)}${trimmed.slice(-3)}`;
    }
    return '••••••' + trimmed.slice(-3);
  }
};

export default function QRScannerClient({ 
  id, 
  initialData 
}: { 
  id: string; 
  initialData: QRCodeData; 
}) {
  const [data, setData] = useState<QRCodeData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Form Fields
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('car');

  // Trigger scan increment on mount if QR is active when opened
  useEffect(() => {
    if (initialData.status === 'active') {
      incrementScan(id);
    }
  }, [id, initialData.status]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('ownerName', ownerName);
    formData.append('phone', phone);
    formData.append('carNumber', carNumber);
    formData.append('vehicleType', vehicleType);

    const res = await registerVehicle(id, formData);
    if (res.success) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setSuccess(true);
      setData({
        id,
        status: 'active',
        owner_name: ownerName,
        phone,
        car_number: carNumber.toUpperCase(),
        vehicle_type: vehicleType,
        registered_at: new Date().toISOString()
      });
    } else {
      setError(res.error || 'Failed to register. Please try again.');
    }
    setLoading(false);
  };

  const getVehicleIcon = (type?: string, className = "w-6 h-6") => {
    switch (type) {
      case 'bike':
      case 'scooter':
        return <Bike className={className} />;
      default:
        return <Car className={className} />;
    }
  };

  // 1. INACTIVE STATE
  if (data.status === 'inactive') {
    return (
      <div className="w-full max-w-md p-6 bg-slate-900/80 backdrop-blur-xl border border-red-500/20 rounded-3xl text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
        <div className="mx-auto w-16 h-16 bg-red-950/50 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sticker Disabled</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          This QR code has been disabled by the administrator or the vehicle owner.
          Please contact support if you believe this is a mistake.
        </p>
        <div className="h-px bg-slate-800 my-4" />
        <div className="text-xs text-slate-500">ID: {id}</div>
      </div>
    );
  }

  // 2. UNREGISTERED STATE (SHOW REGISTRATION FORM)
  if (data.status === 'unregistered' && !success) {
    return (
      <div className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-850 rounded-3xl shadow-2xl relative overflow-hidden text-slate-100">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-amber-500" />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              New Sticker Detected
            </span>
            <h2 className="text-2xl font-bold text-white mt-3">Register Sticker</h2>
            <p className="text-slate-400 text-sm mt-1">
              Link this QR code to your vehicle.
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/25 rounded-2xl flex items-center justify-center text-teal-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Vehicle Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'car', label: 'Car', icon: <Car className="w-4 h-4" /> },
                { id: 'bike', label: 'Bike', icon: <Bike className="w-4 h-4" /> },
                { id: 'scooter', label: 'Scooter', icon: <Bike className="w-4 h-4 rotate-12" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setVehicleType(item.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    vehicleType === item.id
                      ? 'bg-teal-500/10 border-teal-400 text-teal-400'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Mobile Number (with WhatsApp)
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Vehicle Plate Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MH12AB1234"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-650 hover:to-emerald-650 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Register My Vehicle
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          Sticker ID: {id}
        </div>
      </div>
    );
  }

  // 3. REGISTERED / ACTIVE STATE
  return (
    <div className="w-full max-w-md flex flex-col gap-4 relative overflow-x-hidden text-slate-100 box-border px-0.5">
      {/* Background ambient light effects */}
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-2xl text-sm flex items-start gap-2.5 animate-bounce shadow-lg shadow-emerald-950/20 box-border">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <span className="font-bold block">Successfully Linked!</span>
            Your QR code sticker is now active. Anyone scanning it can contact you.
          </div>
        </div>
      )}

      {/* 1. HERO SECTION: COMPACT PASSPORT CARD */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-900/90 via-[#0D1527]/95 to-slate-950/90 border border-slate-800/80 p-4.5 shadow-xl group transition-all duration-500 hover:border-cyan-500/30 box-border">
        {/* Subtle diagonal background mesh pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080e1a_1px,transparent_1px),linear-gradient(to_bottom,#080e1a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        
        {/* Glowing border/accent highlights */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        
        {/* Card Header: Badges */}
        <div className="flex justify-between items-center mb-3.5 relative z-10">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-extrabold uppercase tracking-wider text-cyan-400 shadow-sm">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>Verified Owner</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Active</span>
          </div>
        </div>

        {/* Card Body: Profile Row (Vehicle Icon, Owner Details & License Plate) */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Owner details */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-center text-cyan-400">
              {getVehicleIcon(data.vehicle_type, "w-5.5 h-5.5 text-cyan-400")}
            </div>
            <div className="text-left">
              <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">VEHICLE OWNER</div>
              <div className="text-sm font-extrabold text-white">{data.owner_name}</div>
            </div>
          </div>

          {/* Compact Plate Number */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 font-mono text-center shadow-inner">
            <div className="text-[8px] text-slate-600 font-bold uppercase tracking-wider mb-0.5">PLATE</div>
            <div className="text-sm font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 uppercase">
              {data.car_number}
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK CONTACT SECTION (HIGH PRIORITY - 56PX BUTTONS) */}
      <div className="flex flex-col gap-3">
        {/* Call Owner Button */}
        <a
          href={`tel:${data.phone}`}
          className="flex items-center justify-center gap-3 w-full h-[56px] min-h-[56px] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-extrabold text-sm rounded-[16px] transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] cursor-pointer box-border"
        >
          <PhoneCall className="w-6 h-6 text-slate-950" />
          Call Owner
        </a>

        {/* WhatsApp Owner Button */}
        <a
          href={`https://wa.me/${data.phone?.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20near%20your%20vehicle%20(${data.car_number}).%20Could%20you%20please%20check%20on%20it%3F%20(Sent%20via%20ParkPing)`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full h-[56px] min-h-[56px] bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-650 hover:to-green-650 text-slate-950 font-extrabold text-sm rounded-[16px] transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] cursor-pointer box-border"
        >
          <MessageSquare className="w-6 h-6 fill-slate-950 text-transparent" />
          WhatsApp Owner
        </a>

        {/* Send SMS Button */}
        <a
          href={`sms:${data.phone}?body=${encodeURIComponent("Hello, your vehicle may be blocking access or requires your attention. I found your ParkPing sticker and am trying to reach you. Please check your vehicle.\n")}`}
          className="flex items-center justify-center gap-3 w-full h-[56px] min-h-[56px] bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 text-slate-200 font-extrabold text-sm rounded-[16px] transition-all shadow-md active:scale-[0.98] box-border"
        >
          <MessageSquare className="w-6 h-6 text-sky-400" />
          Send SMS
        </a>
      </div>

      {/* 3. VEHICLE DETAILS COLLAPSIBLE ACCORDION */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setDetailsExpanded(!detailsExpanded)}
          className="w-full flex justify-between items-center bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-[16px] p-4 text-xs text-slate-400 font-bold tracking-wider hover:bg-slate-900/65 transition-all duration-300 active:scale-[0.99] cursor-pointer box-border"
        >
          <span className="flex items-center gap-2.5">
            {getVehicleIcon(data.vehicle_type, "w-4 h-4 text-cyan-400")}
            <span>VEHICLE DETAILS</span>
          </span>
          {detailsExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {detailsExpanded && (
          <div className="bg-slate-900/25 backdrop-blur-md border border-slate-850 rounded-[16px] p-4.5 space-y-3.5 transition-all duration-300 animate-[fadeIn_0.2s_ease-out] box-border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Vehicle Type</span>
              <span className="font-semibold text-slate-200 capitalize flex items-center gap-1.5">
                <span className="text-cyan-400/80">{getVehicleIcon(data.vehicle_type, "w-4 h-4")}</span>
                {data.vehicle_type}
              </span>
            </div>

            {data.phone && (
              <>
                <div className="h-px bg-slate-800/40" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Contact Number</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400/80" />
                    {maskPhone(data.phone)}
                  </span>
                </div>
              </>
            )}

            <div className="h-px bg-slate-800/40" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Contact Availability</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                24/7 Secure Routing
              </span>
            </div>

            {data.registered_at && (
              <>
                <div className="h-px bg-slate-800/40" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Registration Date</span>
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(data.registered_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 4. TRUST & SECURITY INFO CARD */}
      <div className="p-4.5 rounded-[16px] bg-slate-900/40 backdrop-blur-md border border-slate-850/80 shadow-lg relative overflow-hidden box-border">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Shield className="w-4.5 h-4.5 text-cyan-400" />
          </div>
          <div className="text-left flex-grow">
            <div className="text-xs font-bold text-slate-200">Verified Vehicle Owner</div>
            <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Protected by ParkPing</div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Your contact details are encrypted and hidden. Communication is initiated safely without exposing your number.
            </p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/60 text-[9px] text-slate-500 font-bold tracking-wider uppercase">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-cyan-400" /> Secure Routing
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyan-400" /> Encrypted Info
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-[10px] text-slate-600 flex items-center justify-center gap-1">
        <span className="font-semibold text-slate-500">ParkPing Security</span>
        <span>•</span>
        <span>Scan tracked for security logs</span>
      </div>
    </div>
  );
}
