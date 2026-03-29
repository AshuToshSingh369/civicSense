import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-muted font-sans text-text-main selection:bg-primary selection:text-white leading-relaxed relative overflow-hidden">
            
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

                    <h1 className="text-4xl font-bold text-white tracking-tight mb-8 border-b border-border-muted pb-6 drop-shadow-[0_0_15px_#0d93f24d]">Terms of Service</h1>

                    <p className="text-text-muted mb-12 font-mono text-xs uppercase tracking-widest border-l-2 border-primary/40 pl-4">Last Updated: February 2026</p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">01</span> Acceptance of Terms
                            </h2>
                            <p className="text-text-main">
                                By accessing or using the CivicSense platform, you agree to be bound by these Terms of Service and all applicable laws and regulations of the Government of Nepal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">02</span> User Accountability
                            </h2>
                            <p className="text-text-main">
                                Users are responsible for the accuracy of the information provided in their reports. CivicSense is a platform for genuine civic reporting. Any attempt to provide false information, file malicious reports, or impersonate government officials will result in immediate account termination and potential legal action.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">03</span> Use of Content
                            </h2>
                            <p className="text-text-main">
                                Images and descriptions uploaded to the platform become part of the official municipal record. By submitting a report, you grant the municipal authorities the right to use this information to resolve the issue and document infrastructure maintenance.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">04</span> Service Limits
                            </h2>
                            <p className="text-text-main">
                                CivicSense acts as a bridge between citizens and authorities. While we strive for rapid resolution, response times depend on municipal resources, budget allocations, and priority levels assigned by the government authorities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                <span className="text-xs font-mono opacity-50">05</span> Prohibited Activities
                            </h2>
                            <ul className="space-y-3 text-text-main">
                                <li className="flex gap-3"><span className="text-primary mt-1 material-symbols-outlined text-[18px]">block</span> <span>Uploading inappropriate or offensive imagery.</span></li>
                                <li className="flex gap-3"><span className="text-primary mt-1 material-symbols-outlined text-[18px]">no_ads</span> <span>Using the platform for political propaganda or private advertising.</span></li>
                                <li className="flex gap-3"><span className="text-primary mt-1 material-symbols-outlined text-[18px]">gpp_bad</span> <span>Attempting to bypass platform security or access the Authority Dashboard without authorization.</span></li>
                            </ul>
                        </section>
                    </div>

                    <p className="text-xs text-text-muted mt-20 pt-8 border-t border-border-muted font-mono uppercase tracking-[0.2em] leading-relaxed">
                        For any inquiries regarding these terms, please contact the Ministry of Urban Development or your local municipal office.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
