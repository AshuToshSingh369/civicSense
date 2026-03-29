import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Accessibility() {
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

                    <h1 className="text-4xl font-bold text-white tracking-tight mb-8 border-b border-border-muted pb-6 drop-shadow-[0_0_15px_#0d93f24d]">Accessibility Statement</h1>

                    <p className="text-text-muted mb-12 font-mono text-xs uppercase tracking-widest border-l-2 border-primary/40 pl-4">Universal Access Interface • Last Updated: Feb 2026</p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                Our Commitment
                            </h2>
                            <p className="text-text-main">
                                CivicSense believes that digital government services should be accessible to all citizens, regardless of their physical or cognitive abilities. We are dedicated to ensuring our platform is usable for the widest possible audience.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                Compliance Standard
                            </h2>
                            <p className="text-text-main">
                                We aim to adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Our design system prioritizes high-contrast color palettes, clear typography, and logical navigation patterns.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                Key Interface Features
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: "Semantic HTML", desc: "Structured for screen reader optimization." },
                                    { title: "Fluid Design", desc: "Optimized for all viewport dimensions." },
                                    { title: "Keyboard Logic", desc: "Full navigation via standard input arrays." },
                                    { title: "Visual Clarity", desc: "High-legibility typography and spacing." }
                                ].map((feature, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-background-muted border border-border-muted hover:bg-white/10 transition-colors">
                                        <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                                        <p className="text-xs text-text-muted">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                                Development Roadmap
                            </h2>
                            <p className="text-text-main">
                                While we strive for full accessibility, some portions of our platform, such as complex map visualizations (LEO feeds), may present challenges. We are actively developing neural-text descriptions for these spatial data streams.
                            </p>
                        </section>
                    </div>

                    <p className="text-xs text-text-muted mt-20 pt-8 border-t border-border-muted font-mono uppercase tracking-[0.2em] leading-relaxed">
                        This statement reflects our ongoing effort to build a "Digital Nepal" that is inclusive by design.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
