import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AuthorityDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [socketAlert, setSocketAlert] = useState<{ message: string, type: 'info' | 'critical' } | null>(null);

    useEffect(() => {
        // Redirect if not authority
        if (user && user.role !== 'authority' && user.role !== 'admin') {
            navigate('/dashboard');
        }

        const fetchAllReports = async () => {
            if (!user?.token) return;
            try {
                const response = await fetch('/api/reports', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const data = await response.json();

                // Filter reports to only show those targeting this authority's jurisdiction
                const filtered = data.filter((r: any) => r.targetDepartment === user.departmentCode);
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
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

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        active: reports.filter(r => r.status === 'in-progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-gray-900 bg-noise relative">

            {/* Real-time Socket Alert */}
            {socketAlert && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md animate-fade-in-down">
                    <div className={`mx-4 p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-4 ${socketAlert.type === 'critical' ? 'bg-red-600 border-red-400 text-white' : 'bg-blue-900 border-blue-700 text-white'}`}>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl animate-pulse">
                            ⚠️
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg">Priority Alert</h4>
                            <p className="text-sm opacity-90">{socketAlert.message}</p>
                        </div>
                        <button onClick={() => setSocketAlert(null)} className="text-white/60 hover:text-white text-xl p-1">✕</button>
                    </div>
                </div>
            )}

            <Navbar />

            {/* Dashboard Header */}
            <div className="bg-blue-900 pt-12 pb-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-10 mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Authority Portal</span>
                                <span className="text-blue-200 text-sm font-medium">Jurisdiction: {user?.departmentCode || 'National'}</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white font-serif">Command Centre</h1>
                            <p className="text-blue-100 mt-2 opacity-80">Managing citizen infrastructure reports for your assigned ward.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-blue-100 hidden sm:block">Namaste, {user?.name}</span>
                            <button
                                onClick={() => { logout(); navigate('/login'); }}
                                className="text-sm text-white/80 hover:text-white font-bold hover:underline"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                        {[
                            { label: "Total Reports", value: stats.total, color: "bg-blue-800/50" },
                            { label: "New / Pending", value: stats.pending, color: "bg-amber-500/20 text-amber-300" },
                            { label: "In Progress", value: stats.active, color: "bg-blue-400/20 text-blue-200" },
                            { label: "Resolved", value: stats.resolved, color: "bg-green-500/20 text-green-300" },
                        ].map((stat, i) => (
                            <div key={i} className={`${stat.color} backdrop-blur-md border border-white/10 rounded-2xl p-6`}>
                                <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{stat.label}</div>
                                <div className="text-3xl font-bold font-serif">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 -mt-12 pb-24 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-900">Active Task Queue</h2>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold border border-gray-200 hover:bg-white transition-all">Filter</button>
                            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold border border-gray-200 hover:bg-white transition-all">Export JSON</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-20 grayscale opacity-50">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-bold text-gray-400">Loading authority data...</p>
                            </div>
                        ) : reports.length > 0 ? (
                            reports.map((report) => (
                                <div key={report._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-xs text-gray-400 font-bold">#{report._id?.slice(-6)}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(report.status)} uppercase tracking-wide`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900">{report.title || report.category}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                                <span>📍</span> {report.location}
                                            </p>
                                            {report.targetDepartment && (
                                                <p className="text-blue-600/70 text-sm flex items-center gap-1 font-bold">
                                                    <span>🏢</span> {report.targetDepartment}
                                                </p>
                                            )}
                                            <p className="text-gray-400 text-sm flex items-center gap-1">
                                                <span>🕒</span> {new Date(report.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {report.imageUrl && (
                                            <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 max-w-xs cursor-zoom-in group">
                                                <img
                                                    src={report.imageUrl}
                                                    alt="Evidence"
                                                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                                                    onClick={() => window.open(report.imageUrl, '_blank')}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 w-full lg:w-auto">
                                        {report.status !== 'resolved' && (
                                            <>
                                                {report.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateStatus(report._id, 'in-progress')}
                                                        disabled={updatingId === report._id}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        <span>👷</span> Start & Notify
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => updateStatus(report._id, 'resolved')}
                                                    disabled={updatingId === report._id}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    <span>🔔</span> Resolve & Notify
                                                </button>

                                            </>
                                        )}
                                        {report.status === 'resolved' && (
                                            <div className="flex items-center gap-1 text-green-600 font-bold text-sm px-4">
                                                <span>✅</span> Resolved
                                            </div>
                                        )}

                                        <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

                                        <Link
                                            to={`/track-report?id=${report._id}`}
                                            className="p-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all border border-gray-200 group-hover:border-blue-200 group-hover:text-blue-600"
                                            title="View Details"
                                        >
                                            👁️
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-24 grayscale opacity-50 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                <div className="text-6xl mb-6">🏛️</div>
                                <h3 className="font-bold text-gray-500 text-xl">No active reports in queue</h3>
                                <p className="text-gray-400 mt-2 max-w-sm mx-auto">Your municipal queue is currently clear. Citizen submissions for {user?.departmentCode || 'your ward'} will appear here in real-time.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-6 text-blue-600 font-bold hover:underline"
                                >
                                    Refresh Registry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>


            <Footer />
        </div>
    );
}
