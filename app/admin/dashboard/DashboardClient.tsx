'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout } from '../actions';
import { bulkGenerateQRs, toggleQRStatus, deleteQR } from './actions';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { 
  Plus, 
  Search, 
  Download, 
  FileDown,
  Trash2, 
  Check, 
  X, 
  LogOut, 
  BarChart3, 
  QrCode, 
  Car, 
  Bike, 
  User, 
  Phone, 
  Eye, 
  RefreshCw,
  SlidersHorizontal,
  Loader2,
  Lock,
  Unlock,
  Layers,
  Sparkles
} from 'lucide-react';

interface QRCodeRow {
  id: string;
  status: 'unregistered' | 'active' | 'inactive';
  owner_name: string | null;
  phone: string | null;
  car_number: string | null;
  vehicle_type: string | null;
  created_at: string;
  registered_at: string | null;
  scan_count: number;
}

interface DashboardStats {
  total: number;
  active: number;
  unregistered: number;
  inactive: number;
  totalScans: number;
}

const generateStickerCanvas = (id: string, url: string): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // 1. Fill background with white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 1500);

    const margin = 50;
    const width = 1100;
    const height = 1400;
    const radius = 60;

    // 2. Draw card border
    ctx.strokeStyle = '#0f172a'; // dark navy
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.roundRect(margin, margin, width, height, radius);
    ctx.stroke();

    // 3. Draw header bar (top section)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(margin + 8, margin + 8, width - 16, 250, [radius - 8, radius - 8, 0, 0]);
    ctx.fill();

    // 4. Draw ParkPing Logo in header bar
    const logoX = 250;
    const logoY = 175;
    
    // Emblem: Circle in Amber/Gold
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(logoX, logoY, 45, 0, Math.PI * 2);
    ctx.fill();

    // Letter 'P' inside circle
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 55px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', logoX, logoY);

    // WiFi waves (ping) on logo
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    // Wave 1
    ctx.beginPath();
    ctx.arc(logoX, logoY, 65, -Math.PI / 4, Math.PI / 4);
    ctx.stroke();
    // Wave 2
    ctx.beginPath();
    ctx.arc(logoX, logoY, 85, -Math.PI / 4, Math.PI / 4);
    ctx.stroke();

    // Logo text "ParkPing"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('ParkPing', logoX + 110, logoY);

    // 5. Generate and Draw QR Code
    QRCode.toDataURL(url, {
      width: 700,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }, (err, qrDataUrl) => {
      if (err) {
        reject(err);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Draw light grey background frame for the QR Code
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(225, 400, 750, 750, 40);
        ctx.fill();
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw QR Code inside the frame
        ctx.drawImage(img, 250, 425, 700, 700);

        // 6. Draw Sticker ID
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 36px Courier, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayId = id.toUpperCase();
        ctx.fillText(`ID: ${displayId}`, 600, 1220);

        // 7. Draw Scan to Contact Owner text
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 46px Arial, sans-serif';
        ctx.fillText('SCAN TO CONTACT VEHICLE OWNER', 600, 1310);

        // Tagline / safety notice
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 28px Arial, sans-serif';
        ctx.fillText('Secure & Anonymous • ParkPing.com', 600, 1370);

        resolve(canvas);
      };
      img.onerror = () => {
        reject(new Error('Failed to load QR code image'));
      };
      img.src = qrDataUrl;
    });
  });
};

export default function DashboardClient({
  initialQRCodes,
  stats
}: {
  initialQRCodes: QRCodeRow[];
  stats: DashboardStats;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [qrCodes, setQrCodes] = useState<QRCodeRow[]>(initialQRCodes);

  // Compute metrics dynamically from the state so they update instantly on status changes and deletion
  const currentStats = {
    total: qrCodes.length,
    active: qrCodes.filter((x) => x.status === 'active').length,
    unregistered: qrCodes.filter((x) => x.status === 'unregistered').length,
    inactive: qrCodes.filter((x) => x.status === 'inactive').length,
    totalScans: qrCodes.reduce((acc, x) => acc + (x.scan_count || 0), 0),
  };

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Bulk Generator States
  const [showGenModal, setShowGenModal] = useState(false);
  const [genQuantity, setGenQuantity] = useState(10);
  const [generating, setGenerating] = useState(false);

  // Local notification banner
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleLogout = async () => {
    const res = await adminLogout();
    if (res.success) {
      router.push('/admin/login');
      router.refresh();
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const res = await bulkGenerateQRs(genQuantity);
    if (res.success) {
      triggerNotice(`Successfully generated ${res.count} new QR codes.`);
      setShowGenModal(false);
      // Refresh page data
      startTransition(() => {
        router.refresh();
      });
    } else {
      triggerNotice(res.error || 'Failed to generate QR codes.', 'error');
    }
    setGenerating(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: 'unregistered' | 'active' | 'inactive') => {
    // Optimistic Update
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setQrCodes(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));

    const res = await toggleQRStatus(id, currentStatus);
    if (res.success) {
      triggerNotice(`Status updated to ${res.nextStatus}.`);
      startTransition(() => {
        router.refresh();
      });
    } else {
      // Revert if error
      setQrCodes(prev => prev.map(item => item.id === id ? { ...item, status: currentStatus } : item));
      triggerNotice(res.error || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    // Optimistic Delete
    const originalList = [...qrCodes];
    setQrCodes(prev => prev.filter(item => item.id !== id));

    const res = await deleteQR(id);
    if (res.success) {
      triggerNotice('QR code deleted successfully.');
      startTransition(() => {
        router.refresh();
      });
    } else {
      setQrCodes(originalList);
      triggerNotice(res.error || 'Failed to delete QR code.', 'error');
    }
  };

  const handleDownloadPNG = async (id: string, carNumber: string | null) => {
    try {
      const url = `${window.location.origin}/qr/${id}`;
      const canvas = await generateStickerCanvas(id, url);
      const pngUrl = canvas.toDataURL('image/png');
      
      const filename = carNumber ? `parkping-${carNumber.toLowerCase()}.png` : `parkping-${id.slice(0, 8)}.png`;

      // Trigger download
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerNotice('Printable sticker PNG downloaded successfully.');
    } catch (err) {
      console.error(err);
      triggerNotice('Error exporting sticker PNG.', 'error');
    }
  };

  const handleDownloadPDF = async (id: string, carNumber: string | null) => {
    try {
      const url = `${window.location.origin}/qr/${id}`;
      const canvas = await generateStickerCanvas(id, url);
      const imgData = canvas.toDataURL('image/png');

      const filename = carNumber ? `parkping-${carNumber.toLowerCase()}.pdf` : `parkping-${id.slice(0, 8)}.pdf`;

      // Set PDF layout to 4x5 inches for 300 DPI sticker aspect ratio
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [4, 5]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 4, 5);
      pdf.save(filename);
      triggerNotice('Printable sticker PDF downloaded successfully.');
    } catch (err) {
      console.error(err);
      triggerNotice('Error exporting sticker PDF.', 'error');
    }
  };

  // Sync state with server changes
  if (initialQRCodes.length !== qrCodes.length && searchTerm === '' && statusFilter === 'all') {
    setQrCodes(initialQRCodes);
  }

  // Filter list locally for real-time search
  const filteredCodes = qrCodes.filter(item => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.owner_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.car_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
    const matchesFilter = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getVehicleIcon = (type: string | null) => {
    switch (type) {
      case 'bike':
      case 'scooter':
        return <Bike className="w-4 h-4 text-slate-400" />;
      default:
        return <Car className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-850 py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
            <QrCode className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">ParkPing</h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Admin Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-medium hidden md:inline bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-full">
            Logged in as Admin
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Dashboard Area */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Notice alert */}
        {notice && (
          <div className={`p-4 rounded-2xl text-sm border flex items-center justify-between shadow-lg transition-all animate-in fade-in duration-300 ${
            notice.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-950/40 border-red-500/20 text-red-400'
          }`}>
            <span>{notice.message}</span>
            <button onClick={() => setNotice(null)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Analytics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Total */}
          <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-3xl relative overflow-hidden flex flex-col justify-between h-32">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Stickers</span>
              <QrCode className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">{currentStats.total}</div>
              <p className="text-[10px] text-slate-500 mt-1">Generated barcodes</p>
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-3xl relative overflow-hidden flex flex-col justify-between h-32">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-teal-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Registered</span>
              <Check className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">{currentStats.active}</div>
              <p className="text-[10px] text-teal-500 mt-1 font-medium">
                {currentStats.total > 0 ? Math.round((currentStats.active / currentStats.total) * 100) : 0}% Active Rate
              </p>
            </div>
          </div>

          {/* Card 3: Unregistered */}
          <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-3xl relative overflow-hidden flex flex-col justify-between h-32">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Unregistered</span>
              <Plus className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">{currentStats.unregistered}</div>
              <p className="text-[10px] text-slate-500 mt-1">Awaiting scanner setup</p>
            </div>
          </div>

          {/* Card 4: Inactive */}
          <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-3xl relative overflow-hidden flex flex-col justify-between h-32">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Deactivated</span>
              <X className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">{currentStats.inactive}</div>
              <p className="text-[10px] text-slate-500 mt-1">Blocked / Disabled</p>
            </div>
          </div>

          {/* Card 5: Scans */}
          <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-3xl relative overflow-hidden col-span-2 lg:col-span-1 flex flex-col justify-between h-32">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-fuchsia-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Scan Telemetry</span>
              <BarChart3 className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">{currentStats.totalScans}</div>
              <p className="text-[10px] text-slate-500 mt-1">All-time scan views</p>
            </div>
          </div>

        </section>

        {/* Dashboard Operations Console */}
        <section className="bg-slate-900/40 border border-slate-850 rounded-3xl overflow-hidden p-6 space-y-6 shadow-xl">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search owner, plate, phone, id..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-slate-350 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-650" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-350 focus:outline-none focus:border-amber-500 text-sm transition-colors cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="unregistered">Unregistered</option>
                  <option value="inactive">Deactivated</option>
                </select>
              </div>
            </div>

            {/* Quick Action Trigger */}
            <button
              onClick={() => setShowGenModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-650 hover:to-yellow-650 text-slate-950 font-bold transition-all shadow-lg active:scale-[0.98] w-full sm:w-auto justify-center cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              Generate QR Sticker
            </button>
          </div>

          {/* QR List Table / Cards */}
          <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/45">
            {filteredCodes.length === 0 ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Layers className="w-8 h-8 text-slate-700 animate-pulse" />
                <span className="font-semibold text-sm">No QR codes found</span>
                <span className="text-xs text-slate-600">Try adjusting your filters or search queries</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-850 text-left text-xs text-slate-350">
                <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Sticker ID / Route</th>
                    <th scope="col" className="px-6 py-4">Owner Profile</th>
                    <th scope="col" className="px-6 py-4">Car Number</th>
                    <th scope="col" className="px-6 py-4 text-center">Scans</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredCodes.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                            Active
                          </span>
                        ) : item.status === 'unregistered' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Awaiting Setup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* ID / Route */}
                      <td className="px-6 py-4 font-mono select-all whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{item.id.slice(0, 8)}...</span>
                          <a
                            href={`/qr/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-450 hover:text-white transition-colors"
                            title="Preview Public Scan View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Owner Profile */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.owner_name ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-white font-medium">
                              {getVehicleIcon(item.vehicle_type)}
                              <span>{item.owner_name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                              <Phone className="w-3 h-3" />
                              <span>{item.phone}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No owner linked</span>
                        )}
                      </td>

                      {/* Plate */}
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-white tracking-wide uppercase">
                        {item.car_number || (
                          <span className="text-slate-600 font-normal italic">-</span>
                        )}
                      </td>

                      {/* Scan count */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-extrabold text-slate-300">
                        {item.scan_count}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* PNG Download */}
                          <button
                            onClick={() => handleDownloadPNG(item.id, item.car_number)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                            title="Download 300 DPI Sticker PNG"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* PDF Download */}
                          <button
                            onClick={() => handleDownloadPDF(item.id, item.car_number)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Download Printable Sticker PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Switch */}
                          {item.status !== 'unregistered' && (
                            <button
                              onClick={() => handleToggleStatus(item.id, item.status)}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                item.status === 'active' 
                                  ? 'bg-emerald-950/20 hover:bg-emerald-900/30 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-500 hover:text-emerald-450'
                              }`}
                              title={item.status === 'active' ? "Disable QR Code" : "Enable QR Code"}
                            >
                              {item.status === 'active' ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-850 text-slate-550 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                            title="Delete sticker record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* GENERATE MODAL */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-850 rounded-3xl shadow-2xl relative overflow-hidden text-slate-200 animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Bulk QR Generator
              </h3>
              <button 
                onClick={() => setShowGenModal(false)}
                className="p-1 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Number of Stickers to Generate
                </label>
                <input
                  type="number"
                  min="1"
                  max="250"
                  required
                  value={genQuantity}
                  onChange={(e) => setGenQuantity(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors text-sm font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Generates blank physical stickers. Each will automatically prompt for vehicle registration when scanned for the first time.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-200 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || genQuantity <= 0}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-650 hover:to-yellow-650 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
