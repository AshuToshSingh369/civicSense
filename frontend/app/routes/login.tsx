import { useState, useEffect } from "react";
import { Form, Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import AuthSidebar from "../components/AuthSidebar";
import { useAuth } from "../context/AuthContext";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Sign In - CivicSense Nepal" },
        { name: "description", content: "Secure login for CivicSense Nepal" },
    ];
}

export default function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState<"citizen" | "authority">("citizen");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ identifier: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login: authLogin, user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate(user.role === "authority" || user.role === "admin" ? "/authority-dashboard" : "/dashboard");
        }
    }, [user, navigate]);

    const validate = () => {
        let isValid = true;
        const newErrors = { identifier: "", password: "" };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[9][0-9]{9}$/;

        if (!identifier) {
            newErrors.identifier = "Mobile number or email is required";
            isValid = false;
        } else if (!emailRegex.test(identifier) && !mobileRegex.test(identifier)) {
            newErrors.identifier = "Enter a valid email or 10-digit mobile number";
            isValid = false;
        }
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
                body: JSON.stringify({ email: identifier, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            authLogin(data);
            navigate(data.role === "authority" || data.role === "admin" ? "/authority-dashboard" : "/dashboard");
        } catch (error: any) {
            alert(error.message || "Invalid credentials");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background-light font-sans text-slate-900 selection:bg-primary selection:text-white">
            <AuthSidebar
                title1={role === "citizen" ? "Welcome to" : "Authority"}
                title2={role === "citizen" ? "CivicSense Portal" : "Dashboard"}
                subtitle={role === "citizen"
                    ? "Log in to your citizen profile to report local issues and contribute to a better Nepal."
                    : "Access your authority dashboard to manage reports and coordinate resolutions."}
            />

            
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
                <div className="w-full max-w-md">
                    
                    <div className="mb-10 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white group-hover:bg-primary-dark transition-colors">
                                <span className="material-symbols-outlined text-[20px]">radar</span>
                            </div>
                            <span className="font-bold text-xl text-slate-900">CivicSense</span>
                        </Link>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome back</h1>
                        <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
                    </div>

                    
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                        {(["citizen", "authority"] as const).map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all capitalize ${role === r
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {r === "citizen" ? "👤 Citizen" : "🏛️ Authority"}
                            </button>
                        ))}
                    </div>

                    <Form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Email or Mobile Number
                            </label>
                            <input
                                type="text"
                                className={`w-full border rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm ${errors.identifier ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                                placeholder="your@email.com"
                                value={identifier}
                                onChange={(e) => { setIdentifier(e.target.value); if (errors.identifier) setErrors({ ...errors, identifier: "" }); }}
                            />
                            {errors.identifier && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.identifier}</p>}
                        </div>

                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full border rounded-lg px-4 py-3 pr-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: "" }); }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="size-4 border-slate-300 rounded text-primary focus:ring-primary" />
                                <span className="text-sm text-slate-600">Remember me</span>
                            </label>
                            <Link to="#" className="text-sm text-primary hover:underline font-medium">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-3.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting
                                ? <><span className="animate-spin material-symbols-outlined text-[18px]">sync</span> Signing in...</>
                                : <><span className="material-symbols-outlined text-[18px]">login</span> Sign In</>
                            }
                        </button>
                    </Form>

                    
                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                        <div className="relative flex justify-center text-xs text-slate-400 font-medium">
                            <span className="px-4 bg-white">or continue with</span>
                        </div>
                    </div>

                    
                    <a
                        href="http://localhost:5000/api/auth/google"
                        className="w-full flex items-center justify-center gap-3 border border-slate-200 text-slate-700 py-3 rounded-lg font-semibold text-sm shadow-sm hover:bg-slate-50 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </a>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline font-semibold">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
