import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthorityMap from "../components/map/AuthorityMap";
import { motion, AnimatePresence } from "framer-motion";
import { JURISDICTIONS_DATA } from "../utils/jurisdictions";

export default function AuthorityDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [socketAlert, setSocketAlert] = useState<{ message: string, type: 'info' | 'critical' } | null>(null);

    // Create Authority State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: "",
        email: "",
        password: "",
        departmentCode: "",
        homeDepartment: "",
        tempCity: ""
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        // Redirect if not authority
        if (user && user.role !== 'authority' && user.role !== 'admin') {
            navigate('/dashboard');
        }

        const fetchAllReports = async () => {
            if (!user) return;
            try {
                const response = await fetch('/api/reports', {
                    credentials: 'include'
                });
                const responseData = await response.json();
                const allReports = Array.isArray(responseData.data) ? responseData.data : [];

                // Hierarchical UI Handling:
                // Chairman and Admin see everything. 
                // Standard authorities see only their jurisdiction.
                const isGlobalUser = user.role === 'admin' || user.email === 'chairman@gmail.com';
                const filtered = isGlobalUser ? allReports : allReports.filter((r: any) => r.targetDepartment === user.departmentCode);
                setReports(filtered);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllReports();

        // Socket.io Real-time Setup
        const socket = io("/"); // Backend is same origin in production, or proxy in dev

        if (user?.departmentCode) {
            socket.emit('join_department', user.departmentCode);

            socket.on('department_alert', (data) => {
                setSocketAlert({ message: data.message, type: 'critical' });
                // Prepend new report if it matches department
                setReports(prev => [data.report, ...prev]);

                // Clear alert after 5s
                setTimeout(() => setSocketAlert(null), 8000);
            });

            socket.on('status_updated', (updatedReport) => {
                setReports(prev => prev.map(r => r._id === updatedReport._id ? updatedReport : r));
            });
        }

        return () => {
            socket.disconnect();
        };
    }, [user, navigate]);


    const updateStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const response = await fetch(`/api/reports/${id}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setReports(reports.map(r => r._id === id ? { ...r, status: newStatus } : r));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCreateAuthority = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const response = await fetch('/api/auth/create-authority', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createFormData)
            });
            const data = await response.json();

            if (response.ok) {
                alert("Authority account created successfully!");
                setShowCreateModal(false);
                setCreateFormData({
                    name: "",
                    email: "",
                    password: "",
                    departmentCode: "",
                    homeDepartment: "",
                    tempCity: ""
                });
            } else {
                alert(data.message || "Failed to create authority");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating authority");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCreateFormData(prev => ({ ...prev, [name]: value }));

        // Reset sub-city if city changes
        if (name === "tempCity") {
            setCreateFormData(prev => ({ ...prev, homeDepartment: "", departmentCode: "" }));
        }

        // If department code is selected (Active Sub-City), also set homeDepartment to match for consistency
        // In this app logic: departmentCode = functional jurisdiction, homeDepartment = physical location
        if (name === "departmentCode") {
            setCreateFormData(prev => ({ ...prev, homeDepartment: value }));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "resolved": return "border-green-500/50 text-green-500 bg-green-500/10";
            case "in-progress": return "border-primary/50 text-primary bg-primary/10 shadow-[0_0_10px_#0d93f21a]";
            case "pending": return "border-red-500/50 text-rose-500 bg-rose-500/10 shadow-[0_0_10px_#f43f5e1a]";
            default: return "border-white/20 text-slate-400 bg-white/5";
        }
    };

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        active: reports.filter(r => r.status === 'in-progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
    };

    // Live Map Focus Logic
    const getCityCenter = (deptCode: string): { center: [number, number], zoom: number } => {
        // default to Nepal center
        const defaultView: { center: [number, number], zoom: number } = { center: [28.3949, 84.1240], zoom: 7 };

        if (!deptCode) return defaultView;

        // Map department codes to city centers
        const cityCenters: Record<string, [number, number]> = {
            'KTM': [27.7172, 85.3240], // Kathmandu
            'LAL': [27.6644, 85.3188], // Lalitpur
            'BKT': [27.6710, 85.4298], // Bhaktapur
            'PKR': [28.2095, 83.9856], // Pokhara
            'BRT': [26.4525, 87.2718], // Biratnagar
            'BHP': [27.6833, 84.4333], // Bharatpur
            'JKP': [26.7271, 85.9229], // Janakpur
            'HTD': [27.4264, 85.0333], // Hetauda
        };

        const match = Object.keys(cityCenters).find(key => deptCode.includes(key));
        if (match) {
            return { center: cityCenters[match], zoom: 13 };
        }

        return defaultView;
    };

    const [mapViewState, setMapViewState] = useState<{ center: [number, number], zoom: number }>(getCityCenter(user?.departmentCode || ''));

    // Effect to reset view if department changes (unlikely for a single session but good practice)
    useEffect(() => {
        if (user?.departmentCode) {
            setMapViewState(getCityCenter(user.departmentCode));
        }
    }, [user?.departmentCode]);

    const handleLocateIssue = (issue: any) => {
        if (issue.coordinates?.lat && issue.coordinates?.lng) {
            setMapViewState({
                center: [issue.coordinates.lat, issue.coordinates.lng],
                zoom: 16
            });
            // Also scroll for mobile if needed, though this is for the map
        }
    };

    return (
        <div className="min-h-screen bg-background-muted font-sans text-text-main selection:bg-primary selection:text-text-main relative overflow-x-hidden">
            

            {/* Real-time Socket Alert */}
            <AnimatePresence>
                {socketAlert && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md"
                    >
                        <div className={`mx-4 p-4 rounded-xl glass-card border-2 flex items-center gap-4 ${socketAlert.type === 'critical' ? 'bg-red-900/90 border-red-500 shadow-[0_0_30px_#ef444466]' : 'bg-primary/20 border-primary shadow-[0_0_30px_#0d93f266]'} backdrop-blur-xl`}>
                            <div className="size-12 bg-background-muted rounded-full flex items-center justify-center text-2xl animate-pulse border border-border-muted">
                                <span className="material-symbols-outlined text-text-main">{socketAlert.type === 'critical' ? 'warning' : 'info'}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-extrabold text-lg text-[#003d7a] tracking-tight">Priority Alert</h4>
                                <p className="text-sm opacity-90 font-mono italic">{socketAlert.message}</p>
                            </div>
                            <button onClick={() => setSocketAlert(null)} className="text-text-main/60 hover:text-text-main transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Authority Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#000000cc] backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-card bg-white border-border-muted rounded-2xl shadow-lg w-full max-w-lg overflow-hidden relative"
                        >
                            <div className="absolute inset-0  pointer-events-none"></div>
                            <div className="bg-background-muted p-6 border-b border-border-muted flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">person_add</span>
                                    <h3 className="text-xl font-bold text-text-main tracking-tight">Add Staff Account</h3>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-text-main transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleCreateAuthority} className="p-6 space-y-5 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-text-main uppercase tracking-widest">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={createFormData.name}
                                            onChange={handleCreateChange}
                                            className="input-gov text-sm text-text-main bg-white border-border-muted"
                                            placeholder="Official Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-text-main uppercase tracking-widest">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={createFormData.email}
                                            onChange={handleCreateChange}
                                            className="input-gov text-sm text-text-main bg-white border-border-muted"
                                            placeholder="official@gov.np"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-text-main uppercase tracking-widest">City</label>
                                        <select
                                            name="tempCity"
                                            required
                                            value={createFormData.tempCity}
                                            onChange={handleCreateChange}
                                            className="input-gov text-sm text-text-main bg-white border-border-muted appearance-none"
                                        >
                                            <option value="">Select City</option>
                                            {Object.keys(JURISDICTIONS_DATA).map(city => (
                                                <option key={city} value={city} className="bg-background-light text-text-main">{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-text-main uppercase tracking-widest">Sub-City</label>
                                        <select
                                            name="departmentCode"
                                            required
                                            disabled={!createFormData.tempCity}
                                            value={createFormData.departmentCode}
                                            onChange={handleCreateChange}
                                            className="input-gov text-sm text-text-main bg-white border-border-muted appearance-none disabled:opacity-50"
                                        >
                                            <option value="">Select Sub-City</option>
                                            {createFormData.tempCity && JURISDICTIONS_DATA[createFormData.tempCity as keyof typeof JURISDICTIONS_DATA].map((subCity: any) => (
                                                <option key={subCity.value} value={subCity.value} className="bg-background-light text-text-main">{subCity.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-text-main uppercase tracking-widest">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={createFormData.password}
                                        onChange={handleCreateChange}
                                        className="input-gov text-sm text-text-main bg-white border-border-muted"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-2 text-slate-400 font-bold hover:text-text-main transition-colors text-sm uppercase tracking-widest"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="btn-primary py-2 px-8 flex items-center gap-2 group disabled:opacity-50 text-sm"
                                    >
                                        {isCreating ? (
                                            <><span className="animate-spin material-symbols-outlined text-[18px]">sync</span> Processing...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">verified_user</span> Create Account</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Dashboard Header */}
            <header className="bg-white sticky top-0 z-50 border-b border-border-muted shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="size-10 bg-background-muted text-primary rounded-lg flex items-center justify-center border border-border-muted group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-xl">account_balance</span>
                        </div>
                        <div className="leading-tight">
                            <span className="font-bold text-lg block text-text-main group-hover:text-primary transition-colors tracking-tight uppercase">Authority Dashboard</span>
                            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Staff Portal</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4 sm:gap-8">
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Jurisdiction</span>
                                <span className="text-sm font-bold text-text-main uppercase">{user?.departmentCode || 'National'}</span>
                            </div>
                            <div className="h-8 w-[1px] bg-white/10"></div>
                        </div>

                        <div className="flex items-center gap-6">
                            <span className="text-sm font-medium text-text-main hidden sm:flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                                {user?.name || 'Authorized Personnel'}
                            </span>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="text-sm text-red-600 hover:text-red-700 font-bold transition-colors flex items-center gap-2 group"
                            >
                                <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">logout</span>
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Title & Stats Section */}
            <div className="bg-white pt-12 pb-24 px-6 relative border-b border-border-muted z-10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 hidden pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div className="relative">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-background-muted border border-border-muted mb-4 backdrop-blur">
                                <span className="animate-pulse size-2 rounded-full bg-primary shadow-[0_0_8px_#0d93f2]"></span>
                                <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Live</span>
                            </div>
                            <h1 className="text-4xl xl:text-5xl font-bold text-text-main tracking-tight drop-shadow-[0_0_15px_#0d93f24d]">Issue Registry</h1>
                            <p className="text-text-muted text-sm mt-3 max-w-xl border-l-4 border-primary pl-4 font-medium">
                                Reviewing and managing citizen-reported issues in <span className="text-[#003d7a] font-bold uppercase">{user?.departmentCode || 'the grid'}</span>.
                                
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-gov-secondary py-3 px-8 flex items-center gap-2 group text-base"
                        >
                            <span className="material-symbols-outlined group-hover:animate-bounce">person_add</span>
                            Add Staff Account
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total", value: stats.total, color: "bg-white border-border-muted shadow-sm hover:border-primary", icon: "data_usage" },
                            { label: "Pending", value: stats.pending, color: "bg-red-50 border-red-200 text-red-700 shadow-sm", icon: "pending_actions", glow: "" },
                            { label: "In Progress", value: stats.active, color: "bg-blue-50 border-blue-200 text-primary shadow-sm", icon: "engineering", glow: "" },
                            { label: "Resolved", value: stats.resolved, color: "bg-green-50 border-green-200 text-green-700 shadow-sm", icon: "task_alt", glow: "" },
                        ].map((stat, i) => (
                            <div key={i} className={`glass-card p-6 rounded-2xl border ${stat.color} ${stat.glow || ''} group transition-all`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#003d7a]">{stat.label}</span>
                                    <span className="material-symbols-outlined text-[18px] opacity-40 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                                </div>
                                <div className="text-4xl font-bold text-text-main tracking-tighter drop-shadow-[0_0_8px_#ffffff33] font-mono">{stat.value.toString().padStart(2, '0')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content: Tactical Split Screen */}
            <main className="max-w-[1600px] mx-auto px-6 -mt-12 pb-24 relative z-20">
                <div className="grid lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,500px] gap-8 items-start">

                    {/* Left Column: Operation Queue */}
                    <div className="order-2 lg:order-1 space-y-8">

                        <section className="bg-white border border-border-muted rounded-xl shadow-sm overflow-hidden relative">
                            <div className="absolute inset-0  pointer-events-none"></div>

                            <div className="p-8 border-b border-border-muted flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10 bg-background-muted/50">
                                <div className="flex items-center gap-3 text-text-main">
                                    <span className="material-symbols-outlined text-primary">view_list</span>
                                    <h2 className="text-2xl font-extrabold text-[#003d7a] tracking-tight">Issue Queue</h2>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button className="flex-1 sm:flex-none px-6 py-2 bg-white/5 hover:bg-white/10 text-text-main font-bold rounded-xl text-xs uppercase tracking-widest border border-border-muted transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
                                    </button>
                                    <button className="flex-1 sm:flex-none px-6 py-2 bg-white/5 hover:bg-white/10 text-text-main font-bold rounded-xl text-xs uppercase tracking-widest border border-border-muted transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">download</span> Export
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 sm:p-8 space-y-4 relative z-10">
                                {loading ? (
                                    <div className="text-center py-20 grayscale opacity-50">
                                        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="font-mono text-sm text-primary uppercase font-bold tracking-widest animate-pulse">Loading reports...</p>
                                    </div>
                                ) : reports.length > 0 ? (
                                    reports.map((report) => (
                                        <div
                                            id={`report-${report._id}`}
                                            key={report._id}
                                            className="glass-card bg-background-muted/50 border-border-muted rounded-2xl p-6 hover:border-primary/40 hover:bg-white/[0.04] transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group relative overflow-hidden"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-border-muted group-hover:bg-primary transition-colors"></div>

                                            <div className="flex-1 pl-3">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-[10px] text-primary font-bold bg-background-muted px-2 py-0.5 rounded border border-border-muted tracking-widest uppercase">#{report._id?.slice(-6)}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(report.status)} uppercase tracking-widest font-mono`}>
                                                        {report.status}
                                                    </span>
                                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1 border-l border-border-muted pl-3">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                        {new Date(report.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-xl text-text-main group-hover:text-primary transition-colors tracking-tight mb-3">
                                                    {report.title || report.category}
                                                </h3>

                                                <div className="flex flex-wrap gap-4 text-slate-400 text-sm font-medium">
                                                    <span className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-white/5 border border-border-muted">
                                                        <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                                                        {report.location}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono text-xs">
                                                        <span className="material-symbols-outlined text-[18px]">account_balance</span>
                                                        {report.targetDepartment || 'UNASSIGNED'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold tracking-widest text-[10px]">
                                                        <span className="material-symbols-outlined text-[18px]">category</span>
                                                        {report.category || 'GENERAL'}
                                                    </span>
                                                    {report.contactNumber && (
                                                        <span className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold tracking-widest text-[10px]">
                                                            <span className="material-symbols-outlined text-[18px]">call</span>
                                                            {report.contactNumber}
                                                        </span>
                                                    )}
                                                    {user?.email === 'chairman@gmail.com' && (
                                                        <span className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-bold tracking-widest text-[10px]">
                                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                            Global View
                                                        </span>
                                                    )}
                                                </div>

                                                {report.imageUrl && (
                                                    <div className="mt-5 rounded-xl overflow-hidden border border-border-muted max-w-xs group/img relative cursor-zoom-in">
                                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                            <span className="material-symbols-outlined text-text-main text-3xl">zoom_in</span>
                                                        </div>
                                                        <img
                                                            src={report.imageUrl}
                                                            alt="Evidence Vector"
                                                            className="w-full h-32 object-cover group-hover/img:scale-110 transition-transform duration-500"
                                                            onClick={() => window.open(report.imageUrl, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-border-muted">
                                                {user?.email === 'chairman@gmail.com' ? (
                                                    <div className="px-6 py-3 border border-purple-200 bg-purple-50 rounded-xl text-purple-700 font-bold text-[10px] uppercase tracking-widest italic flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]">visibility_lock</span>
                                                        View only — chairman account
                                                    </div>
                                                ) : report.status !== 'resolved' && (
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        {report.status === 'pending' && (
                                                            <button
                                                                onClick={() => updateStatus(report._id, 'in-progress')}
                                                                disabled={updatingId === report._id}
                                                                className="flex-1 sm:flex-none px-6 py-3 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg text-xs font-bold border border-blue-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                            >
                                                                {updatingId === report._id ? (
                                                                    <span className="animate-spin material-symbols-outlined text-[16px]">sync</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-[18px]">engineering</span>
                                                                )}
                                                                Start Work
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => updateStatus(report._id, 'resolved')}
                                                            disabled={updatingId === report._id}
                                                            className="flex-1 sm:flex-none px-6 py-3 bg-green-500 text-text-main rounded-xl text-xs font-bold hover:shadow-[0_0_20px_#22c55e66] transition-all flex items-center justify-center gap-2 shadow-lg"
                                                        >
                                                            {updatingId === report._id ? (
                                                                <span className="animate-spin material-symbols-outlined text-[16px]">sync</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                                            )}
                                                            Mark Resolved
                                                        </button>
                                                    </div>
                                                )}

                                                {report.status === 'resolved' && (
                                                    <div className="px-6 py-3 border border-green-200 bg-green-50 rounded-lg text-green-700 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                        Resolved
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleLocateIssue(report)}
                                                        className="size-12 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg flex items-center justify-center border border-blue-200 transition-all group/locate"
                                                        title="Locate on Map"
                                                    >
                                                        <span className="material-symbols-outlined group-hover/locate:scale-110 transition-transform">location_searching</span>
                                                    </button>

                                                    <div className="hidden lg:block h-10 w-[1px] bg-white/10 mx-1"></div>

                                                    <Link
                                                        to={`/track-report?id=${report._id}`}
                                                        className="size-12 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-text-main rounded-xl flex items-center justify-center border border-border-muted hover:border-primary/50 transition-all group/link"
                                                        title="View Details"
                                                    >
                                                        <span className="material-symbols-outlined group-hover/link:scale-110 transition-transform">visibility</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 glass-card rounded-3xl border-white/5 border-dashed relative overflow-hidden bg-white/[0.01]">
                                        <div className="absolute inset-0  pointer-events-none"></div>
                                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-border-muted shadow-[0_0_30px_#00000033]">
                                            <span className="material-symbols-outlined text-4xl text-slate-600">domain_disabled</span>
                                        </div>
                                        <h3 className="font-bold text-text-main text-xl tracking-tight">Queue Empty</h3>
                                        <p className="text-slate-500 mt-2 max-w-sm mx-auto font-mono text-xs uppercase tracking-widest leading-relaxed">
                                            No open reports right now. New reports will show up here automatically.
                                        </p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="mt-8 text-primary font-bold hover:text-text-main transition-colors uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 mx-auto px-4 py-2 border border-primary/20 rounded-full hover:bg-primary/10"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sticky Deployment Matrix */}
                    <aside className="order-1 lg:order-2 lg:sticky lg:top-28 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-2xl">map</span>
                                <h2 className="text-lg font-bold text-text-main tracking-tight uppercase">Live Map</h2>
                            </div>
                            <div className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 font-mono text-[8px] text-[#003d7a] font-bold uppercase tracking-widest">
                                Your area
                            </div>
                        </div>

                        <div className="bg-white border border-border-muted w-full h-[400px] lg:h-[550px] rounded-xl overflow-hidden shadow-sm relative group">
                            <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10 group-hover:opacity-0 transition-opacity"></div>
                            <AuthorityMap
                                issues={reports}
                                center={mapViewState.center}
                                zoom={mapViewState.zoom}
                                onMarkerClick={(id) => {
                                    const el = document.getElementById(`report-${id}`);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                            />
                            {/* Frame deco */}
                            <div className="absolute top-4 left-4 z-10 flex gap-1">
                                <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
                                <div className="size-1.5 rounded-full bg-primary/40"></div>
                            </div>
                        </div>

                        {/* Map Legend/Status Overlay */}
                        <div className="glass-card p-4 rounded-xl border-white/5 bg-background-muted/50">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Legend</p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold">
                                    <span style={{ color: '#ff0055' }}>🔻</span> Pending
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold">
                                    <span style={{ color: '#0d93f2' }}>🔻</span> In Progress
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold">
                                    <span style={{ color: '#00ff85' }}>🔻</span> Resolved
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}
