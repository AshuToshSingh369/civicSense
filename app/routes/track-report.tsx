import { useState } from "react";
import { Form, Link } from "react-router";

export default function TrackReport() {
    const [searchId, setSearchId] = useState("");
    const [report, setReport] = useState<any>(null); // Mock state for result
    const [error, setError] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId) return;

        // Mock Simulation
        if (searchId === "123456") {
            setReport({
                id: "123456",
                status: "In Progress",
                category: "Pothole",
                location: "Main Market Road, Sector 4",
                date: "Jan 30, 2026",
                timeline: [
                    { status: "Report Received", date: "Jan 30, 10:00 AM", completed: true },
                    { status: "Verified by Authority", date: "Jan 30, 02:00 PM", completed: true },
                    { status: "Work Scheduled", date: "Jan 31, 09:00 AM", completed: true },
                    { status: "Resolution Complete", date: "-", completed: false },
                ]
            });
            setError("");
        } else {
            setReport(null);
            setError("No report found with this ID. Please check and try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col md:flex-row">

            {/* Left Panel - Search & Result */}
            <div className="w-full md:w-1/2 lg:w-5/12 mx-auto flex flex-col min-h-screen bg-white shadow-2xl z-10 relative">
                {/* Header */}
                <header className="bg-blue-700 p-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl uppercase tracking-wider">
                        <span>←</span> CivicSense
                    </Link>
                </header>

                <div className="flex-grow p-8 lg:p-12 overflow-y-auto">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Status</h1>
                        <p className="text-gray-500">Enter your Reference ID to see real-time updates.</p>
                    </div>

                    <Form onSubmit={handleSearch} className="mb-10">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Reference ID</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input-gov flex-grow"
                                placeholder="e.g., 123456"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap px-6">
                                🔍
                            </button>
                        </div>
                        {error && <p className="text-red-600 mt-3 text-sm font-bold flex items-center gap-2"><span>⚠️</span> {error}</p>}
                    </Form>

                    {report && (
                        <div className="animate-fade-in">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Current Status</span>
                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{report.status}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-blue-900 mb-1">{report.category} Issue</h2>
                                <p className="text-gray-500 text-sm mb-4">📍 {report.location}</p>
                                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-3/4 animate-pulse"></div>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-6">Activity Log</h3>
                            <div className="space-y-0 relative border-l-2 border-gray-200 ml-3 pl-8 pb-4">
                                {report.timeline.map((event: any, idx: number) => (
                                    <div key={idx} className="relative mb-8 last:mb-0">
                                        <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-white ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${event.completed ? 'text-gray-900' : 'text-gray-400'}`}>{event.status}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                                        </div>
                                    </div>
                                ))}
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
