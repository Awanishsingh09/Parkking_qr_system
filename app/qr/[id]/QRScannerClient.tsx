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
  Sparkles
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

  // Form Fields
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('car');

  // Trigger scan increment on mount if QR is active
  useEffect(() => {
    if (data.status === 'active') {
      incrementScan(id);
    }
  }, [id, data.status]);

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
        <h2 className="text-2xl font-bold text-white mb-2">QR Code Deactivated</h2>
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
    <div className="w-full max-w-md p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden text-slate-100">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500" />
      
      {success && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-2xl text-sm flex items-start gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <span className="font-bold block">Successfully Linked!</span>
            Your QR code sticker is now active. Anyone scanning it can contact you.
          </div>
        </div>
      )}

      {/* Header section with vehicle image/icon */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/25 rounded-2xl flex items-center justify-center text-teal-400">
          {getVehicleIcon(data.vehicle_type, "w-8 h-8")}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wide">
            {data.car_number}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs font-medium">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Owner: {data.owner_name}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 mb-6 space-y-3.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Vehicle Type</span>
          <span className="font-semibold text-slate-300 capitalize">{data.vehicle_type}</span>
        </div>
        <div className="h-px bg-slate-850/50" />
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Status</span>
          <span className="flex items-center gap-1 font-semibold text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping inline-block" />
            Active & Reachable
          </span>
        </div>
        {data.registered_at && (
          <>
            <div className="h-px bg-slate-850/50" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Registered On</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
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

      <div className="space-y-4">
        {/* Call Button */}
        <a
          href={`tel:${data.phone}`}
          className="flex items-center justify-center gap-3 w-full bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          <PhoneCall className="w-5 h-5 text-teal-400" />
          Call Owner
        </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${data.phone?.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20near%20your%20vehicle%20(${data.car_number}).%20Could%20you%20please%20check%20on%20it%3F%20(Sent%20via%20ParkPing)`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-650 hover:to-green-650 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 fill-slate-950 text-transparent" />
          WhatsApp Owner
        </a>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-600 flex items-center justify-center gap-1">
        <span className="font-semibold text-slate-500">ParkPing Security</span>
        <span>•</span>
        <span>Scan tracked for security logs</span>
      </div>
    </div>
  );
}
