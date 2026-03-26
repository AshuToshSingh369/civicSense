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
            const response = await fetch(`/api/reports/${id}?t=${Date.now()}`, {
                credentials: 'include'
            });
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
        <div className="min-h-screen bg-background-muted font-sans text-text-main flex flex-col md:flex-row relative selection:bg-primary selection:text-white overflow-hidden">

            

            {/* Left Panel - Search & Result */}
            <div className="w-full md:w-1/2 lg:w-5/12 mx-auto flex flex-col min-h-screen bg-white border border-border-muted shadow-sm shadow-md z-10 relative border-r border-border-muted backdrop-blur-xl">
                {/* Header */}
                <header className="bg-white/90 p-6 flex items-center justify-between border-b border-border-muted">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-main font-bold text-xl hover:text-primary transition-colors group">
                        <span className="group-hover:-translate-x-1 transition-transform material-symbols-outlined">arrow_back</span>
                        CivicSense
                    </button>
                    <div className="flex items-center gap-2 text-xs font-mono text-primary/80 uppercase tracking-widest bg-primary/10 px-3 py-1 rounded border border-primary/20">
                        <span className="material-symbols-outlined text-[14px]">radar</span> Track Status
                    </div>
                </header>

                <div className="flex-grow p-8 lg:p-12 overflow-y-auto relative">
                    {!report ? (
                        <div className="mb-10 animate-fade-in relative z-10">
                            <h1 className="text-3xl font-extrabold text-[#003d7a] mb-2 tracking-tight">Track Your Report</h1>
                            <p className="text-text-muted mb-8 font-mono text-sm tracking-wider uppercase">Enter your report ID to see the latest status and updates.</p>

                            <Form onSubmit={handleSearch} className="mb-10">
                                <label className="block text-xs font-mono font-bold text-primary/80 mb-2 uppercase tracking-widest">Report ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="w-full bg-background-muted border rounded-lg px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:ring-1 focus:border-transparent transition-all font-mono border-border-muted focus:ring-primary shadow-inner"
                                        placeholder="e.g., 679dd..."
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                        required
                                    />
                                    <button type="submit" disabled={loading} className="btn-primary min-w-[60px] flex items-center justify-center font-mono">
                                        {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">search</span>}
                                    </button>
                                </div>
                                {error && <p className="text-red-400 mt-3 text-sm font-mono flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">error</span> {error}</p>}
                            </Form>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5 pointer-events-none">
                                <span className="material-symbols-outlined text-[200px]">fingerprint</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 flex items-center justify-between animate-fade-in relative z-10">
                            <button
                                onClick={() => {
                                    if (urlId) navigate(-1);
                                    else setReport(null);
                                }}
                                className="text-sm font-bold text-primary hover:text-[#003d7a] transition-colors flex items-center gap-1 uppercase tracking-wider group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform material-symbols-outlined text-[18px]">keyboard_backspace</span>
                                {urlId ? '← Back' : 'Search Again'}
                            </button>
                            <span className="text-xs font-mono text-text-muted font-bold bg-background-muted px-2 py-1 rounded border border-border-muted">Ref: <span className="text-primary">{report._id}</span></span>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-20 grayscale opacity-50 relative z-10">
                            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-mono text-sm text-primary uppercase tracking-widest animate-pulse">Looking up report...</p>
                        </div>
                    )}

                    {report && (
                        <div className="animate-fade-in space-y-8 relative z-10">
                            {/* Summary Card */}
                            <div className="bg-white border border-border-muted shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-1 rounded inline-flex items-center gap-1 mb-3 font-mono">
                                            <span className="material-symbols-outlined text-[12px]">category</span> Issue
                                        </span>
                                        <h2 className="text-3xl font-extrabold text-[#003d7a] leading-tight tracking-tight">{report.title || report.category}</h2>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border font-mono shadow-[0_0_10px_#00000080] ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </div>
                                        <p className="text-[10px] text-text-muted mt-2 font-mono flex items-center justify-end gap-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 relative z-10">
                                    <p className="text-text-main leading-relaxed text-sm bg-background-muted p-4 rounded-xl border border-border-muted font-mono shadow-inner">
                                        {report.description || "No detailed description provided."}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-xs font-medium font-mono uppercase tracking-wider">
                                        <div className="flex items-center gap-2 text-text-main bg-background-muted border border-border-muted px-3 py-1.5 rounded pr-4">
                                            <span className="material-symbols-outlined text-[16px] text-text-muted">location_on</span> {report.location}
                                        </div>
                                        {report.targetDepartment && (
                                            <div className="flex items-center gap-2 text-primary/90 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded pr-4">
                                                <span className="material-symbols-outlined text-[16px] text-primary">domain</span> {report.targetDepartment}
                                            </div>
                                        )}
                                        {report.contactNumber && (
                                            <div className="flex items-center gap-2 text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded pr-4 text-xs font-bold font-mono">
                                                <span className="material-symbols-outlined text-[16px]">call</span> {report.contactNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {report.imageUrl && (
                                    <div className="relative group rounded-xl overflow-hidden border border-border-muted shadow-[0_0_20px_#00000080] mb-6 z-10 opacity-80 hover:opacity-100 transition-opacity">
                                        <img src={report.imageUrl} alt="Evidence" className="w-full h-56 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors pointer-events-none"></div>
                                        <div className="absolute bottom-2 right-2 bg-white text-[10px] text-text-muted font-bold px-2 py-1 rounded border border-border-muted uppercase tracking-wider">Photo</div>
                                    </div>
                                )}

                                <div className="space-y-2 relative z-10">
                                    <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono">
                                        <span>Progress</span>
                                        <span className="text-primary">{report.status?.includes('resolved') ? '100%' : report.status?.includes('progress') ? '70%' : '30%'}</span>
                                    </div>
                                    <div className="h-2 bg-background-muted rounded-full overflow-hidden border border-border-muted">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${report.status?.includes('resolved') ? 'bg-green-500' : report.status?.includes('progress') ? 'bg-amber-500' : 'bg-primary'} ${!report.status?.includes('resolved') ? 'animate-pulse' : ''}`}
                                            style={{ width: report.status?.includes('resolved') ? '100%' : report.status?.includes('progress') ? '70%' : '30%' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Log */}
                            <div className="bg-white border border-border-muted shadow-sm rounded-2xl p-8 border-border-muted relative z-10">
                                <h3 className="font-extrabold text-[#003d7a] mb-8 flex items-center gap-2 tracking-tight">
                                    <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                                    Progress Timeline
                                </h3>
                                <div className="space-y-0 relative border-l border-border-muted ml-3 pl-10 pb-4">
                                    {report.timeline.map((event: any, idx: number) => (
                                        <div key={idx} className="relative mb-10 last:mb-0 group">
                                            <div className={`absolute -left-[54px] top-0 size-8 rounded-full border-2 flex items-center justify-center shadow-[0_0_15px_#00000080] font-mono text-[10px] font-bold transition-all ${event.completed ? 'bg-background-muted border-primary text-primary shadow-[0_0_10px_#0d93f280]' : 'bg-white border-border-muted text-text-muted'}`}>
                                                {event.completed ? <span className="material-symbols-outlined text-[14px]">check</span> : `0${idx + 1}`}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm tracking-tight transition-colors ${event.completed ? 'text-[#003d7a]' : 'text-text-muted'}`}>{event.status}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">{event.date}</p>
                                                    {event.completed && (
                                                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest opacity-80 flex items-center gap-1 font-mono">
                                                            <span className="material-symbols-outlined text-[12px]">verified</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-xs mt-2 leading-relaxed max-w-sm font-mono transition-colors text-text-muted`}>
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

                <footer className="p-6 border-t border-border-muted text-center text-[10px] font-mono uppercase tracking-widest text-text-muted relative z-10 bg-background-muted">
                    &copy; 2026 CivicSense Protocol
                </footer>
            </div>

            {/* Right Panel - Map Visualization */}
            <div className="hidden md:block w-1/2 lg:w-7/12 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 z-10 pointer-events-none"></div>
                <img
                    src="/track-map.png"
                    alt="Kathmandu City Map Visualization"
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                />

                {/* Overlay FX */}
                <div className=""></div>
                <div className="hidden"></div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#003d7a]/60 via-[#003d7a]/20 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050a0fcc_100%)] z-10"></div>

                <div className="absolute bottom-16 left-16 right-16 text-white z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/30 mb-6 backdrop-blur">
                        <span className="animate-pulse size-2 rounded-full bg-primary"></span>
                        <span className="text-primary text-xs font-mono font-bold uppercase tracking-widest">Real-time Updates</span>
                    </div>
                    <h2 className="text-5xl font-extrabold text-white mb-4 tracking-tight ">Track Your Report</h2>
                    <p className="text-white/90 text-lg max-w-xl leading-relaxed">
                        See exactly where your report stands — from submission to resolution.
                    </p>
                </div>

                {/* Decorative Map Elements */}
                <div className="absolute top-[30%] left-[40%] z-20">
                    <div className="relative flex items-center justify-center size-12">
                        <div className="pulse-ring absolute inset-0"></div>
                        <div className="pulse-dot size-3 relative z-10"></div>
                    </div>
                </div>
            </div>

        </div>
    );
}
