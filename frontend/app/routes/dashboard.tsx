import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [socketAlert, setSocketAlert] = useState<string | null>(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        // Redirect authorities/admins to their portal
        if (user && (user.role === 'authority' || user.role === 'admin')) {
            navigate('/authority-dashboard');
        }

        const fetchReports = async () => {
            if (!user) return;
            try {
                const response = await fetch('/api/reports', {
                    credentials: 'include'
                });
                const data = await response.json();

                // If citizen, filter reports to only show their own
                if (user.role === 'citizen') {
                    // Logic would usually be on backend, but ensuring here
                }
                setReports(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();

        // Real-time Updates
        const socket = io("/");

        socket.on('status_updated', (updatedReport) => {
            setReports(prev => prev.map(r => r._id === updatedReport._id ? updatedReport : r));
            setSocketAlert(`Update: Report #${updatedReport._id.slice(-6)} is now ${updatedReport.status}`);
            setTimeout(() => setSocketAlert(null), 6000);
        });

        return () => {
            socket.disconnect();
        };
    }, [user, navigate]);


    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "resolved": return "bg-green-100 text-green-700 border-green-200";
            case "in-progress": return "bg-amber-100 text-amber-700 border-amber-200";
            case "rejected": return "bg-red-100 text-red-700 border-red-200";
            case "pending": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const stats = {
        total: reports.length,
        resolved: reports.filter(r => r.status?.toLowerCase() === 'resolved').length,
        inProgress: reports.filter(r => r.status?.toLowerCase() === 'in-progress').length,
        pending: reports.filter(r => r.status?.toLowerCase() === 'pending').length,
    };

    return (
        <div className="min-h-screen bg-background-muted font-sans text-text-main pb-20 relative selection:bg-primary selection:text-white">

            

            {/* Real-time Notification for Citizen */}
            {socketAlert && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md animate-fade-in-down">
                    <div className="mx-4 p-4 rounded-xl bg-white text-text-main shadow-sm border border-border-muted flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary animate-pulse">notifications_active</span>
                        <p className="text-sm font-bold tracking-wide">{socketAlert}</p>
                    </div>
                </div>
            )}

            {/* Dashboard Header */}
            <header className="bg-white sticky top-0 z-50 border-b border-border-muted">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="size-10 bg-background-muted text-primary rounded-lg flex items-center justify-center border border-border-muted group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-xl">radar</span>
                        </div>
                        <div className="leading-tight">
                            <span className="font-bold text-lg block text-[#003d7a] group-hover:text-primary transition-colors tracking-tight">My Dashboard</span>
                            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Citizen</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-text-main hidden sm:flex items-center gap-2">
                            <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                            {user?.name || 'Guest'}
                        </span>
                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="text-sm text-text-muted hover:text-text-main font-bold transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Profile Banner */}
            <div className="relative h-64 overflow-hidden border-b border-border-muted z-10 bg-white">
                <div className="absolute inset-0 bg-primary/5"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-light to-transparent"></div>

                <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-8 relative z-10">
                    <div className="flex items-end gap-6">
                        <div className="size-24 bg-background-muted rounded-2xl border border-border-muted shadow-sm overflow-hidden flex items-center justify-center text-4xl mb-[-12px] relative group cursor-pointer">
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                            <span className="material-symbols-outlined text-5xl text-primary relative z-10">person</span>
                        </div>
                        <div className="mb-2">
                            <h1 className="text-3xl font-extrabold text-[#003d7a] tracking-tight flex items-center gap-3">
                                {user?.name || 'Your'}'s Reports
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border border-primary/30 text-primary bg-primary/10">Active</span>
                            </h1>
                            <p className="text-text-muted text-sm mt-1 font-bold">Role: <span className="text-primary uppercase">{user?.role || 'Guest'}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 relative z-10">
                    <div className="card-gov hover:border-primary max-sm:p-4 transition-all group">
                        <span className="text-text-muted text-xs font-bold uppercase tracking-widest block mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px]">data_usage</span> Total Reports
                        </span>
                        <span className="text-4xl font-extrabold text-[#003d7a]">{stats.total}</span>
                    </div>
                    <div className="card-gov hover:border-green-500 max-sm:p-4 transition-all group">
                        <span className="text-green-700 text-xs font-bold uppercase tracking-widest block mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Resolved
                        </span>
                        <span className="text-4xl font-extrabold text-green-600">{stats.resolved}</span>
                    </div>
                    <div className="card-gov hover:border-amber-500 max-sm:p-4 transition-all group">
                        <span className="text-amber-700 text-xs font-bold uppercase tracking-widest block mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px]">sync</span> In Progress
                        </span>
                        <span className="text-4xl font-extrabold text-amber-600">{stats.inProgress}</span>
                    </div>
                    <div className="card-gov hover:border-primary max-sm:p-4 transition-all group relative overflow-hidden">
                        <div className="hidden transition-colors"></div>
                        <span className="text-primary text-xs font-bold uppercase tracking-widest block mb-2 flex items-center gap-2 relative z-10">
                            <span className="material-symbols-outlined text-[14px]">military_tech</span> Impact Score
                        </span>
                        <span className="text-4xl font-extrabold text-primary relative z-10">{stats.resolved * 100 + stats.inProgress * 20}</span>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-border-muted pb-6 relative z-10">
                    <h2 className="text-2xl font-extrabold text-[#003d7a] tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span>
                        My Reports
                    </h2>
                    <Link to="/report-issue" className="btn-gov-primary flex items-center gap-2 text-sm py-3 px-8 group">
                        <span className="material-symbols-outlined group-hover:animate-pulse">add_circle</span> New Report
                    </Link>
                </div>

                <div className="space-y-4 relative z-10">
                    {loading ? (
                        <div className="text-center py-20 grayscale opacity-50">
                            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-mono text-sm text-primary uppercase tracking-widest font-bold animate-pulse">Loading reports...</p>
                        </div>
                    ) : reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report._id} className="card-gov hover:border-primary px-6 py-4 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group cursor-pointer relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-border-muted group-hover:bg-primary transition-colors"></div>

                                <div className="pl-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] text-primary font-bold bg-background-muted px-2 py-0.5 rounded border border-border-muted tracking-widest uppercase">#{report._id?.slice(-6)}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(report.status)} uppercase tracking-widest font-mono`}>
                                            {report.status}
                                        </span>
                                        <div className="w-24 h-1.5 bg-border-muted rounded-full overflow-hidden ml-2 hidden sm:block">
                                            <div
                                                className={`h-full ${report.status?.toLowerCase().includes('resolved') ? 'bg-green-500 shadow-[0_0_5px_#22c55e80]' : report.status?.toLowerCase().includes('progress') ? 'bg-amber-500 shadow-[0_0_5px_#fbbf2480]' : 'bg-primary shadow-[0_0_5px_#0d93f280]'}`}
                                                style={{ width: report.status?.toLowerCase().includes('resolved') ? '100%' : report.status?.toLowerCase().includes('progress') ? '70%' : '30%' }}
                                            ></div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-[#003d7a] group-hover:text-primary transition-colors tracking-tight">{report.title || report.category}</h3>
                                    <p className="text-text-muted text-sm font-bold flex flex-wrap items-center gap-3 mt-2">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">location_on</span> {report.location}</span>
                                        {report.targetDepartment && (
                                            <span className="flex items-center gap-1 text-primary/80 font-mono text-xs border border-primary/20 px-2 py-0.5 rounded bg-primary/5">
                                                <span className="material-symbols-outlined text-[14px]">domain</span> {report.targetDepartment}
                                            </span>
                                        )}
                                    </p>
                                    {report.imageUrl && (
                                        <div className="mt-4 rounded-lg overflow-hidden border border-border-muted w-32 h-20 opacity-90 group-hover:opacity-100 transition-opacity">
                                            <img src={report.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                    <Link to={`/track-report?id=${report._id}`} className="btn-gov-secondary py-2 px-6 text-sm font-bold ml-auto md:ml-0 flex items-center gap-2">
                                        View Details <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-lg border-2 border-border-muted border-dashed relative overflow-hidden">
                            <div className=" pointer-events-none"></div>
                            <div className="size-16 bg-background-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border-muted">
                                <span className="material-symbols-outlined text-3xl text-primary">inbox</span>
                            </div>
                            <p className="text-text-muted font-bold uppercase tracking-widest text-xs">No reports yet.</p>
                            <Link to="/report-issue" className="text-primary font-bold hover:underline mt-4 inline-flex items-center gap-2">
                                File your first report <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
