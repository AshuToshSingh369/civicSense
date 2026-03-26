import { useState, useEffect } from "react";
import { Form, Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import AuthSidebar from "../components/AuthSidebar";
import { useAuth } from "../context/AuthContext";
import { JURISDICTIONS_DATA } from "../utils/jurisdictions";

export default function CompleteProfile() {
    const navigate = useNavigate();
    const { user, login: authLogin } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        tempCity: "",
        homeDepartment: ""
    });

    useEffect(() => {
        // If user is not logged in, send them to login
        if (!user) {
            navigate("/login");
            return;
        }

        // If user already has location data, send them to dashboard
        if (user.homeDepartment && user.departmentCode) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset sub-city if city changes
        if (name === "tempCity") {
            setFormData(prev => ({ ...prev, homeDepartment: "" }));
        }
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tempCity || !formData.homeDepartment) {
            setError("Please select both your city and sub-sector.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    homeDepartment: `${formData.homeDepartment}, ${formData.tempCity}`,
                    departmentCode: formData.homeDepartment // Using sub-city code as departmentCode
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update local auth context
                authLogin(data);
                navigate("/dashboard");
            } else {
                setError(data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-muted flex flex-col lg:flex-row font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0d93f20d] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#a855f70d] rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>

            {/* Left Panel - Information (Common component) */}
            <AuthSidebar
                title1="Node"
                title2="Configuration"
                subtitle="Almost there! Tell us your location so we can route your reports to the right municipality."
            />

            {/* Right Panel - Form (Neon Theme) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white border border-border-muted shadow-sm p-8 rounded-2xl shadow-sm border border-primary/20 relative"
                >
                    <div className="absolute inset-x-0 h-[1px] top-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                    <div className="mb-8 text-center flex flex-col items-center">
                        <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_#0d93f233] mb-6 border border-primary/30">
                            <span className="material-symbols-outlined text-3xl">location_on</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Geo-Sync Required</h2>
                        <p className="text-text-muted text-sm font-mono tracking-wider uppercase">Set your operational jurisdiction.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-3 animate-head-shake">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    <Form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="relative group">
                                <label className="block text-xs font-mono font-bold text-primary/80 mb-2 uppercase tracking-widest">Operational City (Sector)</label>
                                <div className="relative">
                                    <select
                                        name="tempCity"
                                        className="w-full bg-background-muted border border-border-muted rounded-lg px-4 py-3 text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all shadow-inner font-mono appearance-none"
                                        onChange={handleChange}
                                        value={formData.tempCity}
                                    >
                                        <option value="" className="bg-[#111518] text-text-muted">Select City</option>
                                        {Object.keys(JURISDICTIONS_DATA).map(city => (
                                            <option key={city} value={city} className="bg-[#111518] text-white">{city}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {formData.tempCity && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative group"
                                >
                                    <label className="block text-xs font-mono font-bold text-primary/80 mb-2 uppercase tracking-widest">Sub-Sector Jurisdicton</label>
                                    <div className="relative">
                                        <select
                                            name="homeDepartment"
                                            className="w-full bg-background-muted border border-border-muted rounded-lg px-4 py-3 text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all shadow-inner font-mono appearance-none"
                                            value={formData.homeDepartment}
                                            onChange={handleChange}
                                        >
                                            <option value="" className="bg-[#111518] text-text-muted">Select Jurisdiction</option>
                                            {JURISDICTIONS_DATA[formData.tempCity as keyof typeof JURISDICTIONS_DATA].map((subCity: any) => (
                                                <option key={subCity.value} value={subCity.value} className="bg-[#111518] text-white">{subCity.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 group shadow-[0_8px_20px_#0d93f233] relative overflow-hidden disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined text-[20px]">sync</span>
                                        Synchronizing Hub...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">verified_user</span>
                                        Establish Node Connection
                                    </>
                                )}
                            </span>
                        </button>

                        <div className="text-center">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-xs font-mono text-text-muted hover:text-primary transition-colors tracking-widest uppercase"
                            >
                                Re-Authenticate
                            </button>
                        </div>
                    </Form>
                </motion.div>
            </div>
        </div>
    );
}
