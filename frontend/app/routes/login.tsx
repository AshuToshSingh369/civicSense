import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/login";
import AuthSidebar from "../components/AuthSidebar";
import { useAuth } from "../context/AuthContext";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Login - CivicSense Nepal" },
        { name: "description", content: "Secure login for CivicSense Nepal" },
    ];
}

export default function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState<"citizen" | "authority">("citizen");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ identifier: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login: authLogin } = useAuth();

    const validate = () => {
        let isValid = true;
        const newErrors = { identifier: "", password: "" };

        // Validate Identifier (Email or Mobile)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[9][0-9]{9}$/; // Nepali mobile starts with 9, 10 digits

        if (!identifier) {
            newErrors.identifier = "Mobile number or email is required";
            isValid = false;
        } else if (!emailRegex.test(identifier) && !mobileRegex.test(identifier)) {
            newErrors.identifier = "Enter a valid email or 10-digit mobile number";
            isValid = false;
        }

        // Validate Password
        if (!password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: identifier,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Success
            authLogin(data);
            if (data.role === "authority" || data.role === "admin") {
                navigate("/authority-dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Invalid credentials");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans text-gray-900">

            {/* Reusable Sidebar */}
            <AuthSidebar
                title1={role === "citizen" ? "Welcome Back," : "Official Portal,"}
                title2={role === "citizen" ? "Citizen." : "Authority."}
                subtitle={role === "citizen"
                    ? "Log in to check the status of your reports and stay connected with your local government."
                    : "Access the municipal command centre to manage public infrastructure and citizen reports."
                }
            />

            {/* Right Panel - Professional Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-40 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative z-10"
                >
                    <div className="mb-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                            <div className="w-10 h-10 bg-blue-700 text-white rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-900/10 group-hover:scale-110 transition-transform">
                                CS
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-none">CivicSense</span>
                                <span className="text-[8px] uppercase text-blue-600 font-bold tracking-tighter">Digital Services</span>
                            </div>
                        </Link>


                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Namaste!</h2>
                        <p className="text-gray-500">Log in to access your dashboard.</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
                        <button
                            type="button"
                            onClick={() => setRole("citizen")}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === "citizen"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Citizen
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("authority")}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === "authority"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Authority
                        </button>
                    </div>

                    <Form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className={`input-gov ${errors.identifier ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                                placeholder="e.g., ram@example.com"
                                value={identifier}
                                onChange={(e) => {
                                    setIdentifier(e.target.value);
                                    if (errors.identifier) setErrors({ ...errors, identifier: "" });
                                }}
                            />
                            {errors.identifier && <p className="text-red-600 text-xs mt-1 font-medium">{errors.identifier}</p>}
                        </div>



                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                className={`input-gov ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: "" });
                                }}
                            />
                            {errors.password && <p className="text-red-600 text-xs mt-1 font-medium">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            <Link to="#" className="text-blue-700 font-bold hover:underline">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full btn-primary py-4 shadow-lg shadow-blue-900/10 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Logging in...' : 'Secure Login'}
                        </button>
                    </Form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        New to CivicSense?{' '}
                        <Link to="/signup" className="text-blue-700 font-bold hover:underline font-lg">
                            Create Citizenship ID
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
