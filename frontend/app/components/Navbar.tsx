import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleReportClick = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            navigate('/login');
        }
        setIsMenuOpen(false);
    };

    return (
        <header 
            className={`sticky top-0 z-[100] transition-all duration-300 ${
                isScrolled 
                ? "bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-lg shadow-slate-200/20 py-3" 
                : "bg-white border-b border-slate-100 py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02] active:scale-95">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                        <span className="material-symbols-outlined text-[24px]">radar</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-xl text-slate-900 tracking-tighter leading-none">CivicSense</span>
                        <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">Nepal Portal</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center bg-slate-100/50 border border-slate-200/60 rounded-full px-1.5 py-1">
                    {[
                        { name: "Global Map", path: "/" },
                        { name: "Report Issue", path: "/report-issue", protected: true },
                        { name: "Track Progress", path: "/track-report" }
                    ].map((item) => {
                        const isProtected = item.protected && (!user || user.role === 'citizen');
                        if (item.protected && user && user.role !== 'citizen') return null;
                        
                        return (
                            <Link 
                                key={item.name}
                                to={item.path} 
                                onClick={item.protected ? handleReportClick : undefined}
                                className="px-5 py-2 text-[13px] font-bold text-slate-600 hover:text-primary rounded-full transition-all hover:bg-white hover:shadow-sm"
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Auth Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <Link to={user.role === 'authority' || user.role === 'admin' ? "/authority-dashboard" : "/dashboard"}>
                            <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all active:scale-95">
                                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                My Dashboard
                            </button>
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                                Sign In
                            </Link>
                            <Link to="/signup">
                                <button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-primary/10 hover:-translate-y-0.5 transition-all active:scale-95">
                                    Get Started
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors focus:outline-none"
                >
                    <span className="material-symbols-outlined text-2xl font-bold">
                        {isMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 py-6 px-6 space-y-4 shadow-2xl animate-fade-in-down">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-slate-600 font-bold p-3 rounded-xl hover:bg-slate-50">
                        <span className="material-symbols-outlined text-primary">public</span> Home Map
                    </Link>
                    {(!user || user.role === 'citizen') && (
                        <Link to="/report-issue" onClick={handleReportClick} className="flex items-center gap-3 text-slate-600 font-bold p-3 rounded-xl hover:bg-slate-50">
                            <span className="material-symbols-outlined text-primary">add_circle</span> Report Issue
                        </Link>
                    )}
                    <Link to="/track-report" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-slate-600 font-bold p-3 rounded-xl hover:bg-slate-50">
                        <span className="material-symbols-outlined text-primary">search</span> Track Status
                    </Link>
                    
                    <div className="pt-4 flex flex-col gap-3">
                        {user ? (
                            <Link 
                                to={user.role === 'authority' || user.role === 'admin' ? "/authority-dashboard" : "/dashboard"}
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full bg-slate-900 text-white text-center py-4 rounded-xl font-bold shadow-lg"
                            >
                                Open Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full border border-slate-200 text-slate-600 text-center py-4 rounded-xl font-bold bg-slate-50">
                                    Sign In
                                </Link>
                                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full bg-primary text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-primary/20">
                                    Create Profile
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
