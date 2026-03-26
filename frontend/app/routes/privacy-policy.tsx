import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-muted font-sans text-text-main selection:bg-primary selection:text-white leading-relaxed relative overflow-hidden">
            {/* Background Animated Elements */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0d93f21a] rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#a855f71a] rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>

            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-20 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-12 text-sm font-bold text-primary hover:text-white transition-colors flex items-center gap-2 group"
                >
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Return to Mission Control
                </button>

                <div className="bg-white border border-border-muted shadow-sm bg-white/80 border-border-muted p-12 lg:p-16 rounded-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

                    <h1 className="text-4xl font-bold text-white tracking-tight mb-8 border-b border-border-muted pb-6 drop-shadow-[0_0_15px_#0d93f24d]">Privacy Policy</h1>

                    <p className="text-text-muted mb-12 font-mono text-xs uppercase tracking-widest border-l-2 border-primary/40 pl-4">Last Updated: February 2026</p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">01</span> Introduction
                            </h2>
                            <p className="text-text-main">
                                CivicSense is committed to protecting the privacy and security of our users' personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our platform for civic reporting.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">02</span> Data Collection
                            </h2>
                            <p className="text-text-main mb-6">
                                We collect information necessary to provide and improve our services, including:
                            </p>
                            <ul className="space-y-3 text-text-main">
                                <li className="flex gap-3"><span className="text-primary mt-1 material-symbols-outlined text-[18px]">verified</span> <span><strong>Account Information:</strong> Name, email address, and verified mobile number.</span></li>
                                <li className="flex gap-3"><span className="text-primary mt-1 material-symbols-outlined text-[18px]">location_on</span> <span><strong>Report Data:</strong> Descriptions of civic issues, photos, and precise GPS location coordinates.</span></li>
                                <li className="flex gap-3"><span className="text-primary mt-1 material-symbols-outlined text-[18px]">security</span> <span><strong>Authentication Data:</strong> Encrypted password strings and session identifiers.</span></li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">03</span> Use of Information
                            </h2>
                            <p className="text-text-main mb-6">
                                The information collected is used for the following official purposes:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "To process and route your reports to the appropriate municipal authorities.",
                                    "To provide real-time updates regarding the status of your reported issues.",
                                    "To verify the authenticity of reports and prevent misuse of the platform.",
                                    "To analyze civic trends for improved municipal planning and service delivery."
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-background-muted border border-border-muted text-sm text-text-muted">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">04</span> Data Sharing
                            </h2>
                            <p className="text-text-main">
                                CivicSense does not sell or lease your personal data to third parties. Your report details (excluding sensitive personal identity markers) are shared exclusively with authorized government officials and field technicians responsible for resolving the reported issue.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">05</span> Data Security
                            </h2>
                            <p className="text-text-main">
                                We implement industry-standard security measures, including HTTPS encryption and secure server environments, to protect your data from unauthorized access, alteration, or disclosure.
                            </p>
                        </section>
                    </div>

                    <p className="text-xs text-text-muted mt-20 pt-8 border-t border-border-muted font-mono uppercase tracking-[0.2em] leading-relaxed">
                        This policy is governed by the laws of the Government of Nepal regarding digital data protection and privacy. Unauthorized access attempts are monitored and logged.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
