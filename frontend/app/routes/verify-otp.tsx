import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import AuthSidebar from "../components/AuthSidebar";

export default function VerifyOtp() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const [otp, setOtp] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert("Email missing from URL");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data);
                navigate("/dashboard");
            } else {
                alert(data.message || "Verification failed");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during verification.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background-light font-sans text-slate-900 selection:bg-primary selection:text-white">
            <AuthSidebar
                title1="Security"
                title2="Verification"
                subtitle="To ensure the integrity of our civic reporting network, we require a one-time verification code sent to your email."
            />

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-10 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white group-hover:bg-primary-dark transition-colors">
                                <span className="material-symbols-outlined text-[20px]">radar</span>
                            </div>
                            <span className="font-bold text-xl text-slate-900">CivicSense</span>
                        </Link>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Verify your account</h1>
                        <p className="text-slate-500 text-sm">We've sent a 6-digit code to <span className="text-primary font-semibold">{email || 'your email'}</span></p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label htmlFor="otp" className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-[0.2em] text-center">
                                Enter Verification Code
                            </label>

                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                autoFocus
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-5 text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-center text-4xl tracking-[0.5em] font-black placeholder-slate-200 shadow-inner"
                                placeholder="000000"
                            />
                            
                            <p className="text-[11px] text-slate-400 mt-6 text-center font-medium leading-relaxed">
                                Please check your inbox and spam folder.<br />
                                The code is valid for 10 minutes.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || otp.length < 6}
                            className={`w-full flex items-center justify-center gap-3 bg-primary text-white rounded-xl py-4 text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isSubmitting || otp.length < 6 ? 'opacity-50 cursor-not-allowed saturate-0' : ''}`}
                        >
                            {isSubmitting ? (
                                <><span className="animate-spin material-symbols-outlined text-[18px]">sync</span> Verifying...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[20px]">verified</span> Verify Code</>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm mb-6">
                            Didn't receive the code?{" "}
                            <button type="button" className="text-primary hover:underline font-semibold ml-1">
                                Resend Code
                            </button>
                        </p>
                        <Link to="/login" className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Cancel and Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
