import { Link } from "react-router";

export default function Navbar() {
    return (
        <>
            {/* 1. TOP BAR (Official Strip) */}
            <div className="bg-blue-900 text-white/90 text-xs py-2 px-6 border-b border-blue-800 flex justify-between tracking-wide z-50 relative">
                <div className="flex gap-4">
                    <span>Government of Nepal</span>
                    <span className="opacity-50">|</span>
                    <span>Ministry of Urban Development</span>
                </div>
                <div className="flex gap-4 font-bold">
                    <span className="cursor-pointer hover:text-white">EN</span>
                    <span className="opacity-50">|</span>
                    <span className="cursor-pointer hover:text-white">NP</span>
                </div>
            </div>

            {/* 2. MAIN HEADER */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Emblem */}
                        <div className="w-12 h-12 relative flex items-center justify-center">
                            <svg viewBox="0 0 200 200" className="w-full h-full text-blue-800 fill-current drop-shadow-sm">
                                <path d="M100 20 L20 180 H180 Z" fill="none" stroke="currentColor" strokeWidth="8" />
                                <circle cx="100" cy="120" r="30" fill="currentColor" />
                            </svg>
                        </div>

                        <Link to="/" className="flex flex-col">
                            <span className="text-2xl font-bold text-gray-900 tracking-tight leading-none font-serif">CivicSense</span>
                            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-widest mt-1">Nagarik App Integration</span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
                        <Link to="/" className="text-blue-800 font-bold border-b-2 border-blue-800 pb-0.5">Home</Link>
                        <Link to="/report-issue" className="hover:text-blue-800 transition-colors">Report Issue</Link>
                        <Link to="/track-report" className="hover:text-blue-800 transition-colors">Track Status</Link>

                        <div className="flex gap-3 ml-4">
                            <Link to="/login" className="px-5 py-2.5 font-bold text-blue-800 border-2 border-blue-100 rounded-lg hover:border-blue-800 transition-all">
                                Login
                            </Link>
                            <Link to="/signup" className="px-5 py-2.5 font-bold text-white bg-blue-800 rounded-lg shadow-[0_4px_0_rgb(30,58,138)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(30,58,138)] transition-all">
                                Register
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>
        </>
    );
}
