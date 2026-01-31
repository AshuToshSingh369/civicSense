import { Link } from "react-router";

export default function Dashboard() {
    // Mock Data
    const myReports = [
        { id: "123456", category: "Pothole", location: "Sector 4, Main Road", date: "Jan 30, 2026", status: "In Progress" },
        { id: "123455", category: "Garbage", location: "Park Gate No. 2", date: "Jan 28, 2026", status: "Resolved" },
        { id: "123450", category: "Streetlight", location: "Near School", date: "Jan 15, 2026", status: "Rejected" },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Resolved": return "bg-green-100 text-green-700 border-green-200";
            case "In Progress": return "bg-amber-100 text-amber-700 border-amber-200";
            case "Rejected": return "bg-red-100 text-red-700 border-red-200";
            case "Submitted": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            {/* Dashboard Header */}
            <header className="bg-blue-900 text-white sticky top-0 z-50 shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-blue-900 rounded-lg flex items-center justify-center font-bold shadow-sm">CS</div>
                        <div className="leading-tight">
                            <span className="font-bold text-lg block">Citizen Dashboard</span>
                            <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Bagmati Province</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-blue-100 hidden sm:block">Namaste, Ashutosh</span>
                        <Link to="/login" className="text-sm text-white/80 hover:text-white font-bold hover:underline transition-colors">Sign Out</Link>
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
                            <h1 className="text-3xl font-bold text-gray-900">Ashutosh's Impact</h1>
                            <p className="text-gray-600 font-medium">Citizen ID: 9841-XXXXXX</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 pt-12">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                        <span className="text-gray-400 text-xs font-bold uppercase block mb-2">Total Reports</span>
                        <span className="text-4xl font-bold text-gray-900">12</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                        <span className="text-green-600 text-xs font-bold uppercase block mb-2">Resolved</span>
                        <span className="text-4xl font-bold text-green-600">8</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                        <span className="text-amber-600 text-xs font-bold uppercase block mb-2">In Progress</span>
                        <span className="text-4xl font-bold text-amber-600">3</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-lg shadow-blue-900/10 hover:-translate-y-1 transition-transform bg-gradient-to-br from-white to-blue-50">
                        <span className="text-blue-600 text-xs font-bold uppercase block mb-2">Impact Score</span>
                        <span className="text-4xl font-bold text-blue-700">850</span>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                    <Link to="/report-issue" className="btn-primary flex items-center gap-2 shadow-xl shadow-blue-900/20 text-sm py-3 px-8 transform hover:scale-105 transition-all">
                        <span>📷</span> New Report
                    </Link>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                    {myReports.map((report) => (
                        <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group cursor-pointer relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-blue-500 transition-colors"></div>

                            <div className="pl-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono text-xs text-gray-400 font-bold">#{report.id}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(report.status)} uppercase tracking-wide`}>
                                        {report.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">{report.category} Issue</h3>
                                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                    <span>📍</span> {report.location}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                                <span className="text-xs text-gray-400 font-medium">{report.date}</span>
                                <Link to={`/track-report?id=${report.id}`} className="btn-secondary py-2 px-6 text-sm font-bold bg-gray-50 hover:bg-white border-gray-200 ml-auto md:ml-0">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
