import { Link } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CivicSense - Modern Civic Reporting" },
    { name: "description", content: "Real-time infrastructure reporting for the modern age. Join the movement to build better communities through data-driven civic engagement and transparent resolution tracking." },
  ];
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicReport {
  _id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  imageUrl: string;
  status: string;
  aiAnalysis?: { threatLevel?: string };
  user?: { name: string } | null;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

interface Contributor {
  _id: string;
  name: string;
  email: string;
  reportCount: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Inline Location Map ──────────────────────────────────────────────────────

interface LocationMapProps {
  lat: number | null;
  lng: number | null;
  locationGranted: boolean;
  reports: PublicReport[];
}

function LocationMap({ lat, lng, locationGranted, reports }: LocationMapProps) {
  const [LeafletMap, setLeafletMap] = useState<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      const [L, ReactLeaflet] = await Promise.all([import('leaflet'), import('react-leaflet')]);
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setLeafletMap({ L: L.default, ...ReactLeaflet });
    };
    loadLeaflet();
  }, []);

  if (!LeafletMap) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl">
        <div className="text-slate-400 flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Loading map…</span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = LeafletMap;
  const center: [number, number] = locationGranted && lat && lng ? [lat, lng] : [28.3949, 84.124];
  const zoom = locationGranted ? 15 : 7;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        key={`${center[0]}-${center[1]}-${zoom}`}
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {locationGranted && lat && lng && (
          <Marker position={[lat, lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {reports.map((report) => {
          if (!report.coordinates?.lat || !report.coordinates?.lng) return null;
          const statusColor = report.status === 'resolved' ? '#22c55e' :
            report.status === 'in-progress' ? '#0f45b3' : '#ef4444';
          const pulsingIcon = LeafletMap.L.divIcon({
            html: `<div style="width:14px;height:14px;border-radius:50%;background:${statusColor};border:2px solid white;box-shadow:0 0 8px ${statusColor}88"></div>`,
            className: '',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          return (
            <Marker key={report._id} position={[report.coordinates.lat, report.coordinates.lng]} icon={pulsingIcon}>
              <Popup>
                <div className="text-xs font-bold">{report.title}</div>
                <div className="text-[10px] text-slate-500">{report.location}</div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [locationGranted, setLocationGranted] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const [recentReports, setRecentReports] = useState<PublicReport[]>([]);
  const [stats, setStats] = useState({ resolvedIssues: 0, activeCitizens: 0, newReportsThisMonth: 0 });
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocationGranted(true); setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => setLocationGranted(false),
        { timeout: 8000 }
      );
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/reports/public/recent`)
      .then(r => r.json())
      .then(data => setRecentReports(Array.isArray(data) ? data : []))
      .catch(() => setRecentReports([]))
      .finally(() => setLoadingReports(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/reports/public/stats`)
      .then(r => r.json())
      .then(data => { if (data) setStats(data); })
      .catch(() => { })
      .finally(() => setLoadingStats(false));
  }, []);

  const handleReportClick = (e: React.MouseEvent) => {
    if (!user) { e.preventDefault(); setShowAuthModal(true); }
  };

  const tickerItems = [
    { color: "bg-green-500", text: `${stats.resolvedIssues} Issues Resolved` },
    { color: "bg-blue-500", text: "Avg Response Time: 4h 12m" },
    { color: "bg-primary", text: `${stats.activeCitizens} Active Citizens` },
    { color: "bg-purple-500", text: `${stats.newReportsThisMonth} New Reports This Month` },
    { color: "bg-orange-500", text: "AI-Powered Issue Analysis" },
  ];

  return (
    <div className="bg-background-light text-slate-900 font-sans min-h-screen flex flex-col overflow-x-hidden">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        .glass-panel {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.6);
        }
      `}</style>

      <Navbar />

      <main className="flex-grow">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-16 pb-28 lg:pt-28 lg:pb-36 bg-background-light">
          {/* Decorative blobs */}
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

              {/* Left */}
              <div className="flex flex-col justify-center text-center lg:text-left">
                <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-blue-200 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Live System Active
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl mb-6 leading-[1.1]">
                  Empowering citizens,<br className="hidden lg:block" /> optimizing cities.
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-8 lg:mx-0">
                  Real-time infrastructure reporting for the modern age. Join the movement to build better communities through data-driven civic engagement.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/report-issue"
                    onClick={handleReportClick}
                    className="flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <span className="material-symbols-outlined mr-2 text-[20px]">add_circle</span>
                    Report an Issue
                  </Link>
                  <Link
                    to="/track-report"
                    className="flex items-center justify-center rounded-lg bg-white border border-slate-200 px-6 py-3.5 text-base font-bold text-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined mr-2 text-[20px]">track_changes</span>
                    Track Report
                  </Link>
                </div>

                {/* Stats row */}
                <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-slate-900">{loadingStats ? "—" : stats.resolvedIssues.toLocaleString()}</p>
                    <p className="text-xs font-medium">Issues Resolved</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-slate-900">{loadingStats ? "—" : stats.activeCitizens.toLocaleString()}</p>
                    <p className="text-xs font-medium">Active Citizens</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-slate-900">{loadingStats ? "—" : stats.newReportsThisMonth.toLocaleString()}</p>
                    <p className="text-xs font-medium">This Month</p>
                  </div>
                </div>
              </div>

              {/* Right — Floating dashboard widgets + map */}
              <div className="relative lg:h-[560px] flex items-center justify-center">
                {/* Map as background */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100">
                  <LocationMap lat={userLat} lng={userLng} locationGranted={locationGranted} reports={recentReports} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-50/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Overlay widgets */}
                <div className="relative w-full max-w-sm space-y-4 p-5 self-start mt-6 ml-auto">
                  {/* Status widget */}
                  <div className="glass-panel rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">System Status</h3>
                      <span className="flex h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">Online</p>
                        <p className="text-[11px] text-slate-400">Last updated: Just now</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">98.2%</p>
                        <p className="text-[11px] text-slate-400">Uptime</p>
                      </div>
                    </div>
                  </div>

                  {/* Live feed mini widget */}
                  <div className="glass-panel rounded-xl p-4 shadow-lg border border-primary/10">
                    <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">bolt</span> Live Incoming
                    </h4>
                    {loadingReports ? (
                      <div className="space-y-2">
                        {[1, 2].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
                      </div>
                    ) : recentReports.slice(0, 2).map(r => (
                      <div key={r._id} className="flex items-center gap-3 p-2 rounded-lg bg-white/60 border border-slate-100 mb-2 last:mb-0">
                        <div className="h-7 w-7 rounded bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-900">{r.title}</p>
                          <p className="text-[10px] text-slate-400">{r.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marquee ticker */}
          <div className="absolute bottom-0 w-full bg-slate-900/5 backdrop-blur-sm py-2 border-t border-slate-200">
            <div className="flex overflow-hidden whitespace-nowrap">
              <div className="animate-marquee flex gap-12 text-sm font-medium text-slate-600 min-w-full">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                    {item.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS (Horizontal Timeline) ───────────────────────── */}
        <section className="py-24 bg-white border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Workflow</h2>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">From Report to Resolution</p>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500">
                Our automated pipeline ensures every issue is tracked, verified, and resolved efficiently.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-slate-100 hidden md:block">
                <div className="h-full w-1/2 bg-gradient-to-r from-primary/40 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-10 md:grid-cols-4 relative z-10">
                {[
                  { icon: "add_a_photo", label: "Snap & Send", desc: "Capture the issue. Geo-location is automatically tagged for accuracy.", active: true },
                  { icon: "psychology", label: "AI Verification", desc: "Our AI analyzes the image to categorize the issue and assess severity.", active: false },
                  { icon: "local_shipping", label: "Dispatch", desc: "The nearest available authority is automatically notified and deployed.", active: false },
                  { icon: "check_circle", label: "Resolution", desc: "Issue fixed. You receive a confirmation and the case is closed.", active: false },
                ].map((step, i) => (
                  <div key={i} className="group flex flex-col items-center text-center">
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg
                      ${step.active
                        ? 'bg-white border-2 border-primary text-primary'
                        : 'bg-white border border-slate-200 text-slate-500 group-hover:border-primary group-hover:text-primary'
                      }`}>
                      <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{step.label}</h3>
                    <p className="mt-2 text-sm text-slate-500 max-w-[200px]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES GRID ──────────────────────────────────────────── */}
        <section className="py-24 bg-background-light relative overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[10%] left-[5%] w-72 h-72 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Supported Categories</h2>
                <p className="mt-3 text-lg text-slate-500">Comprehensive coverage for all municipal infrastructure needs.</p>
              </div>
              <Link to="/report-issue" onClick={handleReportClick} className="inline-flex items-center text-primary font-semibold hover:text-primary-dark transition-colors">
                Report an issue <span className="material-symbols-outlined ml-1 text-[20px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "gavel", label: "Roads & Potholes", desc: "Report asphalt damage, sinkholes, and road marking issues.", color: "bg-orange-100 text-orange-600" },
                { icon: "light_mode", label: "Streetlights", desc: "Broken lamps, flickering lights, and electrical hazards.", color: "bg-yellow-100 text-yellow-600" },
                { icon: "delete", label: "Sanitation", desc: "Missed trash pickups, illegal dumping, and overflowing bins.", color: "bg-green-100 text-green-600" },
                { icon: "park", label: "Public Parks", desc: "Broken equipment, landscaping needs, and safety concerns.", color: "bg-teal-100 text-teal-600" },
                { icon: "format_paint", label: "Graffiti", desc: "Vandalism on public property requiring removal.", color: "bg-purple-100 text-purple-600" },
                { icon: "water_drop", label: "Water Leaks", desc: "Hydrant issues, main line breaks, and drainage problems.", color: "bg-blue-100 text-blue-600" },
              ].map((cat, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl border border-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className={`mb-4 inline-flex rounded-xl p-3 ${cat.color}`}>
                      <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{cat.label}</h3>
                    <p className="mt-2 text-slate-500 text-sm leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RECENT REPORTS ───────────────────────────────────────────── */}
        {(loadingReports || recentReports.length > 0) && (
          <section className="py-20 bg-white border-t border-slate-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-extrabold text-slate-900">Recent Reports</h2>
                <Link to="/dashboard" className="text-primary font-semibold hover:underline text-sm flex items-center gap-1">
                  View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingReports
                  ? [1, 2].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)
                  : recentReports.slice(0, 4).map(report => (
                    <div key={report._id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                      {report.imageUrl && (
                        <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                          <img
                            src={report.imageUrl.startsWith('http') ? report.imageUrl : `${API_BASE}${report.imageUrl}`}
                            className="w-full h-full object-cover"
                            alt={report.title}
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{report.category}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${report.status === 'resolved' ? 'bg-green-100 text-green-700' : report.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {report.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{report.title}</h3>
                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {report.location}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </section>
        )}

        {/* ── PARTNERS ─────────────────────────────────────────────────── */}
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-8">Official Municipal Partners</div>
            <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
              {["Kathmandu Metro", "Pokhara Metro", "Lalitpur Metro", "Birgunj Metro"].map(name => (
                <div key={name} className="font-bold text-lg text-slate-700">{name}</div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
                  <span className="material-symbols-outlined text-[18px]">radar</span>
                </div>
                <span className="text-xl font-bold text-white">CivicSense</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Building the digital infrastructure for tomorrow's smart cities. Data-driven, transparent, and citizen-focused.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Platform</h3>
              <ul className="space-y-3">
                {["Report Issue", "Track Report", "Authority Dashboard", "Accessibility"].map(item => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-slate-400 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link to="/privacy-policy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/accessibility" className="text-sm text-slate-400 hover:text-white transition-colors">Accessibility</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Your Account</h3>
              {user ? (
                <div className="space-y-3">
                  <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors block">My Dashboard</Link>
                  <Link to="/report-issue" className="text-sm text-slate-400 hover:text-white transition-colors block">New Report</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors block">Sign In</Link>
                  <Link to="/signup" className="text-sm text-slate-400 hover:text-white transition-colors block">Create Account</Link>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} CivicSense. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="text-sm text-slate-500 hover:text-white">Privacy</Link>
              <Link to="/terms-of-service" className="text-sm text-slate-500 hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL ──────────────────────────────────────────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 text-center border-b border-slate-100">
              <div className="size-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">lock</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Login Required</h3>
              <p className="text-slate-500 text-sm">Please sign in to your citizen profile to report an issue and track progress.</p>
            </div>
            <div className="p-8 space-y-3">
              <Link to="/login" className="flex items-center justify-center gap-2 w-full bg-primary text-white rounded-lg py-3 font-bold hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined text-[18px]">login</span> Sign In
              </Link>
              <Link to="/signup" className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-900 rounded-lg py-3 font-bold hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[18px]">person_add</span> Create Account
              </Link>
              <button onClick={() => setShowAuthModal(false)} className="w-full text-slate-400 text-sm py-2 hover:text-slate-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
