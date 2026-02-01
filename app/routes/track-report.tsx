import { useState, useEffect } from "react";
import { Form, Link, useSearchParams, useNavigate } from "react-router";

export default function TrackReport() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlId = searchParams.get("id");

    const [searchId, setSearchId] = useState(urlId || "");
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (urlId) {
            fetchReport(urlId);
        }
    }, [urlId]);

    const fetchReport = async (id: string) => {
        setLoading(true);
        setError("");
        setReport(null); // Clear previous data

        try {
            const response = await fetch(`/api/reports/${id}?t=${Date.now()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "No report found");
            }

            const s = data.status?.trim().toLowerCase() || 'pending';
            console.log(`Report ${id} status: ${s}`); // Debugging sync

            const reportWithTimeline = {
                ...data,
                status: s, // Ensure status is clean
                timeline: [
                    { status: "Report Received", date: new Date(data.createdAt).toLocaleString(), completed: true, desc: "Successfully logged in the municipal database." },
                    { status: "Verified by Authority", date: s !== 'pending' ? 'Verified' : 'Pending', completed: s !== 'pending', desc: s !== 'pending' ? "Official has confirmed the issue and assigned a priority." : "Awaiting review by Ward Commissioner." },
                    { status: "Work Scheduled", date: s === 'in-progress' || s === 'resolved' ? 'Active' : '-', completed: s === 'in-progress' || s === 'resolved', desc: s === 'in-progress' || s === 'resolved' ? "Field technicians have been dispatched to the location." : "Will be scheduled after verification." },
                    { status: "Resolution Complete", date: s === 'resolved' ? 'Resolved' : '-', completed: s === 'resolved', desc: s === 'resolved' ? "Task concluded. Thank you for your civic contribution!" : "Final inspection will occur after field work." },
                ]
            };

            setReport(reportWithTimeline);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Failed to fetch report");
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'in-progress': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId) return;
        fetchReport(searchId);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col md:flex-row">

            {/* Left Panel - Search & Result */}
            <div className="w-full md:w-1/2 lg:w-5/12 mx-auto flex flex-col min-h-screen bg-white shadow-2xl z-10 relative">
                {/* Header */}
                <header className="bg-blue-700 p-6 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white font-bold text-xl uppercase tracking-wider hover:opacity-80 transition-opacity">
                        <span>←</span> CivicSense
                    </button>
                </header>

                <div className="flex-grow p-8 lg:p-12 overflow-y-auto">
                    {!report ? (
                        <div className="mb-10 animate-fade-in">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Status</h1>
                            <p className="text-gray-500 mb-8">Enter your Reference ID to see real-time updates.</p>

                            <Form onSubmit={handleSearch} className="mb-10">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reference ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="input-gov flex-grow"
                                        placeholder="e.g., 679dd..."
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                        required
                                    />
                                    <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap px-6">
                                        {loading ? '...' : '🔍'}
                                    </button>
                                </div>
                                {error && <p className="text-red-600 mt-3 text-sm font-bold flex items-center gap-2"><span>⚠️</span> {error}</p>}
                            </Form>
                        </div>
                    ) : (
                        <div className="mb-6 flex items-center justify-between animate-fade-in">
                            <button
                                onClick={() => {
                                    if (urlId) navigate(-1);
                                    else setReport(null);
                                }}
                                className="text-sm font-bold text-blue-700 hover:underline flex items-center gap-1"
                            >
                                <span>←</span> {urlId ? 'Back to Dashboard' : 'Search Different ID'}
                            </button>
                            <span className="text-xs font-mono text-gray-400 font-bold">Ref: {report._id}</span>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-20 grayscale opacity-50">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-bold text-gray-400">Fetching report details...</p>
                        </div>
                    )}

                    {report && (
                        <div className="animate-fade-in space-y-8">
                            {/* Summary Card */}
                            <div className="bg-white border-2 border-blue-50 bg-gradient-to-br from-blue-50/50 to-white rounded-3xl p-8 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-100/50 px-2 py-1 rounded mb-3 inline-block">Issue Classification</span>
                                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">{report.title || report.category}</h2>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(report.status)} shadow-sm`}>
                                            {report.status}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 font-mono">{new Date(report.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <p className="text-gray-600 leading-relaxed text-sm bg-white/50 p-4 rounded-xl border border-blue-100/30">
                                        {report.description || "No detailed description provided."}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                                            <span>📍</span> {report.location}
                                        </div>
                                        {report.targetDepartment && (
                                            <div className="flex items-center gap-2 text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-lg">
                                                <span>🏢</span> {report.targetDepartment}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {report.imageUrl && (
                                    <div className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-inner mb-6">
                                        <img src={report.imageUrl} alt="Evidence" className="w-full h-56 object-cover" />
                                        <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <span>Resolution Progress</span>
                                        <span>{report.status?.includes('resolved') ? '100%' : report.status?.includes('progress') ? '70%' : '30%'}</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${report.status?.includes('resolved') ? 'bg-green-500' : report.status?.includes('progress') ? 'bg-amber-500' : 'bg-blue-600'} ${!report.status?.includes('resolved') ? 'animate-pulse' : ''}`}
                                            style={{ width: report.status?.includes('resolved') ? '100%' : report.status?.includes('progress') ? '70%' : '30%' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Log */}
                            <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-700 rounded-full"></span>
                                    Official Activity Log
                                </h3>
                                <div className="space-y-0 relative border-l-2 border-blue-100 ml-3 pl-10 pb-4">
                                    {report.timeline.map((event: any, idx: number) => (
                                        <div key={idx} className="relative mb-10 last:mb-0">
                                            <div className={`absolute -left-[54px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm text-[10px] ${event.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                {event.completed ? '✓' : idx + 1}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm tracking-tight ${event.completed ? 'text-gray-900' : 'text-gray-400 font-medium'}`}>{event.status}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <p className="text-[11px] text-gray-500 font-medium">{event.date}</p>
                                                    {event.completed && (
                                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest opacity-60 flex items-center gap-1">
                                                            <span className="w-1 h-1 bg-blue-600 rounded-full"></span> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed max-w-sm">
                                                    {event.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="p-6 border-t border-gray-100 text-center text-xs text-gray-400">
                    &copy; 2026 CivicSense Nepal
                </footer>
            </div>

            {/* Right Panel - Map Visualization */}
            <div className="hidden md:block w-1/2 lg:w-7/12 bg-gray-100 relative overflow-hidden">
                <img
                    src="/track-map.png"
                    alt="Kathmandu City Map Visualization"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-bold mb-4">Real-time Transparency</h2>
                    <p className="text-blue-100 text-lg max-w-lg">
                        Watch how your report moves through the system, from the Ward Office to the field technicians.
                    </p>
                </div>
            </div>

        </div>
    );
}
