import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleReportClick = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            alert("Authentication Required: Please login to report a civic issue.");
            navigate('/login');
        }
    };

    return (
        <>
            {/* 1. TOP BAR (Official Strip) */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-blue-900 text-white/90 text-xs py-2 px-6 border-b border-blue-800 flex justify-between tracking-wide z-50 relative"
            >
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
            </motion.div>

            {/* 2. MAIN HEADER */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300"
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Corporate Brand Emblem */}
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 bg-blue-800 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white/20"
                        >
                            CS
                        </motion.div>

                        <Link to="/" className="flex flex-col group">
                            <motion.span
                                whileHover={{ x: 2 }}
                                className="text-2xl font-bold text-gray-900 tracking-tight leading-none font-serif group-hover:text-blue-900 transition-colors"
                            >
                                CivicSense
                            </motion.span>
                            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-widest mt-1">A digital approach for better services</span>
                        </Link>

                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
                        <Link to="/" className="relative hover:text-blue-800 transition-colors group">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-800 transition-all group-hover:w-full"></span>
                        </Link>

                        {/* Only citizens or unauthenticated users can report issues */}
                        {(!user || user.role === 'citizen') && (
                            <Link to="/report-issue" onClick={handleReportClick} className="relative hover:text-blue-800 transition-colors group">
                                Report Issue
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-800 transition-all group-hover:w-full"></span>
                            </Link>
                        )}

                        <Link to="/track-report" className="relative hover:text-blue-800 transition-colors group">
                            Track Status
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-800 transition-all group-hover:w-full"></span>
                        </Link>

                        <div className="flex gap-3 ml-4">

                            {user ? (
                                <Link
                                    to={user.role === 'authority' || user.role === 'admin' ? "/authority-dashboard" : "/dashboard"}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05, translateY: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-5 py-2.5 font-bold text-white bg-blue-800 rounded-lg shadow-[0_4px_0_rgb(30,58,138)] hover:shadow-[0_2px_0_rgb(30,58,138)] transition-all flex items-center gap-2"
                                    >
                                        <span>👤</span> Dashboard
                                    </motion.button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-5 py-2.5 font-bold text-blue-800 border-2 border-blue-100 rounded-lg hover:border-blue-800 transition-all"
                                        >
                                            Login
                                        </motion.button>
                                    </Link>
                                    <Link to="/signup">
                                        <motion.button
                                            whileHover={{ scale: 1.05, translateY: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-5 py-2.5 font-bold text-white bg-blue-800 rounded-lg shadow-[0_4px_0_rgb(30,58,138)] hover:shadow-[0_2px_0_rgb(30,58,138)] transition-all"
                                        >
                                            Register
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </motion.header>
        </>
    );
}
