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
            if (!user?.token) return;
            try {
                const response = await fetch('/api/reports', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const data = await response.json();

                // If citizen, filter reports to only show their own
                if (user.role === 'citizen') {
                    // Logic would usually be on backend, but ensuring here
                }
                setReports(data);
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
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 relative">

            {/* Real-time Notification for Citizen */}
            {socketAlert && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md animate-fade-in-down">
                    <div className="mx-4 p-4 rounded-xl bg-blue-900 text-white shadow-2xl border border-blue-700 flex items-center gap-3">
                        <span className="text-xl">🔔</span>
                        <p className="text-sm font-bold">{socketAlert}</p>
                    </div>
                </div>
            )}

            {/* Dashboard Header */}

            <header className="bg-blue-900 text-white sticky top-0 z-50 shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-white text-blue-900 rounded-lg flex items-center justify-center shadow-lg font-bold text-xl group-hover:scale-105 transition-transform border border-blue-100">
                            CS
                        </div>
                        <div className="leading-tight">
                            <span className="font-bold text-lg block group-hover:text-blue-100 transition-colors">Citizen Dashboard</span>
                            <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">A digital approach for better services</span>
                        </div>
                    </Link>



                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-blue-100 hidden sm:block">Namaste, {user?.name || 'Guest'}</span>
                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="text-sm text-white/80 hover:text-white font-bold hover:underline transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Profile Banner */}
            <div className="relative h-64 bg-blue-900 overflow-hidden">
                <img
                    src="/hero-nepal.png"
                    alt="City Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
                    style={{ objectPosition: 'center bottom' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-blue-900/60"></div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
                    <div className="flex items-end gap-6">
                        <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-4xl mb-[-12px]">
                            👤
                        </div>
                        <div className="mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'Your'}'s Impact</h1>
                            <p className="text-gray-600 font-medium">Citizen Role: {user?.role || 'Guest'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 pt-12">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                        <span className="text-gray-400 text-xs font-bold uppercase block mb-2">Total Reports</span>
                        <span className="text-4xl font-bold text-gray-900">{stats.total}</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                        <span className="text-green-600 text-xs font-bold uppercase block mb-2">Resolved</span>
                        <span className="text-4xl font-bold text-green-600">{stats.resolved}</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                        <span className="text-amber-600 text-xs font-bold uppercase block mb-2">In Progress</span>
                        <span className="text-4xl font-bold text-amber-600">{stats.inProgress}</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-lg shadow-blue-900/10 hover:-translate-y-1 transition-transform bg-gradient-to-br from-white to-blue-50">
                        <span className="text-blue-600 text-xs font-bold uppercase block mb-2">Impact Score</span>
                        <span className="text-4xl font-bold text-blue-700">{stats.resolved * 100 + stats.inProgress * 20}</span>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                    <Link to="/report-issue" className="btn-primary flex items-center gap-2 shadow-xl shadow-blue-900/20 text-sm py-3 px-8 transform hover:scale-105 transition-all">
                        <span>📷</span> New Report
                    </Link>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 grayscale opacity-50">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-bold text-gray-400">Loading your reports...</p>
                        </div>
                    ) : reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group cursor-pointer relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-blue-500 transition-colors"></div>

                                <div className="pl-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-xs text-gray-400 font-bold">#{report._id?.slice(-6)}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(report.status)} uppercase tracking-wide`}>
                                            {report.status}
                                        </span>
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200 ml-2 hidden sm:block">
                                            <div
                                                className={`h-full ${report.status?.toLowerCase().includes('resolved') ? 'bg-green-500' : report.status?.toLowerCase().includes('progress') ? 'bg-amber-500' : 'bg-blue-600'}`}
                                                style={{ width: report.status?.toLowerCase().includes('resolved') ? '100%' : report.status?.toLowerCase().includes('progress') ? '70%' : '30%' }}
                                            ></div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">{report.title || report.category}</h3>
                                    <p className="text-gray-500 text-sm flex flex-wrap items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1"><span>📍</span> {report.location}</span>
                                        {report.targetDepartment && (
                                            <span className="flex items-center gap-1 text-blue-600 font-bold opacity-70">
                                                <span>🏢</span> {report.targetDepartment}
                                            </span>
                                        )}
                                    </p>
                                    {report.imageUrl && (
                                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 w-32 h-20">
                                            <img src={report.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                                    <span className="text-xs text-gray-400 font-medium">{new Date(report.createdAt).toLocaleDateString()}</span>
                                    <Link to={`/track-report?id=${report._id}`} className="btn-secondary py-2 px-6 text-sm font-bold bg-gray-50 hover:bg-white border-gray-200 ml-auto md:ml-0">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No reports filed yet. Start by reporting a civic issue.</p>
                            <Link to="/report-issue" className="text-blue-700 font-bold hover:underline mt-2 inline-block">Report Now →</Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
