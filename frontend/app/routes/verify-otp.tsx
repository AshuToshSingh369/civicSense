import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";

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
                login(data); // Save user and token
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
        <div className="flex min-h-screen bg-white font-inter text-gray-900">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-50 border-r border-gray-200 flex-col justify-center px-12">
                <h1 className="text-3xl font-bold text-blue-900 mb-4">Security Check</h1>
                <p className="text-lg text-gray-700">
                    We use Two-Factor Authentication (2FA) to protect your account and personal data. Verified accounts ensure the integrity of our civic reporting system.
                </p>
            </div>

            {/* Right Panel - OTP Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 lg:px-24">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h1>
                        <p className="text-gray-600 text-lg">Enter the code sent to <span className="font-bold text-blue-900">{email || 'your email'}</span>.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-lg font-bold text-gray-800 mb-3">
                                6-Digit Code <span className="text-red-700" aria-hidden="true">*</span>
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                aria-required="true"
                                className="input-gov text-center text-3xl tracking-[0.5em] font-mono h-16"
                                placeholder="------"
                            />
                            <p className="text-sm text-gray-500 mt-2">Check your inbox for the 6-digit code.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || otp.length < 6}
                            className={`btn-primary w-full shadow-lg ${isSubmitting ? 'opacity-70' : ''}`}
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-700 font-medium">
                            Didn't receive code?{" "}
                            <button type="button" className="text-blue-700 font-bold underline hover:text-blue-900">
                                Resend Code
                            </button>
                        </p>
                        <div className="mt-6">
                            <Link to="/login" className="text-gray-600 underline hover:text-gray-900">
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

