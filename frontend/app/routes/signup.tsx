import { useState, useEffect } from "react";
import { Form, Link, useNavigate } from "react-router";
import type { Route } from "./+types/signup";
import AuthSidebar from "../components/AuthSidebar";
import { useAuth } from "../context/AuthContext";
import { JURISDICTIONS_DATA } from "../utils/jurisdictions";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Create Account - CivicSense Nepal" },
        { name: "description", content: "Create a new CivicSense account" },
    ];
}

export default function Signup() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login: authLogin, user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate(user.role === "authority" || user.role === "admin" ? "/authority-dashboard" : "/dashboard");
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "",
        homeDepartment: "", tempCity: "", password: "", confirmPassword: ""
    });
    const [errors, setErrors] = useState({
        firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: "" }));
        if (name === "tempCity") setFormData(prev => ({ ...prev, [name]: value, homeDepartment: "" }));
    };

    const validate = () => {
        let isValid = true;
        const newErrors = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[9][0-9]{9}$/;

        if (!formData.firstName.trim()) { newErrors.firstName = "First Name is required"; isValid = false; }
        if (!formData.lastName.trim()) { newErrors.lastName = "Last Name is required"; isValid = false; }
        if (!formData.email) { newErrors.email = "Email/Mobile is required"; isValid = false; }
        else if (!emailRegex.test(formData.email) && !mobileRegex.test(formData.email)) { newErrors.email = "Invalid format"; isValid = false; }
        if (!formData.password) { newErrors.password = "Password is required"; isValid = false; }
        else if (formData.password.length < 6) { newErrors.password = "Min 6 characters required"; isValid = false; }
        if (formData.confirmPassword !== formData.password) { newErrors.confirmPassword = "Passwords do not match"; isValid = false; }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email, password: formData.password,
                    homeDepartment: formData.homeDepartment, tempCity: formData.tempCity
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Signup failed');
            navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
        } catch (error: any) {
            alert(error.message || "Failed to register. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = (hasError: boolean) =>
        `w-full border rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`;
    const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="min-h-screen flex bg-background-light font-sans text-slate-900 selection:bg-primary selection:text-white">
            <AuthSidebar
                title1="Join the"
                title2="CivicSense Community"
                subtitle="Create your account to start reporting issues in your local community and track their resolution progress."
            />

            
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:px-16 lg:py-10 bg-white overflow-y-auto">
                <div className="w-full max-w-md">
                    
                    <div className="mb-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white group-hover:bg-primary-dark transition-colors">
                                <span className="material-symbols-outlined text-[20px]">radar</span>
                            </div>
                            <span className="font-bold text-xl text-slate-900">CivicSense</span>
                        </Link>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
                        <p className="text-slate-500 text-sm">Join thousands of citizens making Nepal better</p>
                    </div>

                    <Form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>First Name</label>
                                <input name="firstName" type="text" className={inputCls(!!errors.firstName)} placeholder="Ram" value={formData.firstName} onChange={handleChange} />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Last Name</label>
                                <input name="lastName" type="text" className={inputCls(!!errors.lastName)} placeholder="Sharma" value={formData.lastName} onChange={handleChange} />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                            </div>
                        </div>

                        
                        <div>
                            <label className={labelCls}>Email or Mobile Number</label>
                            <input name="email" type="text" className={inputCls(!!errors.email)} placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Municipality</label>
                                <select name="tempCity" className="w-full border border-slate-200 rounded-lg px-3 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none bg-white" onChange={handleChange} value={formData.tempCity}>
                                    <option value="">Select city</option>
                                    {Object.keys(JURISDICTIONS_DATA).map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                            {formData.tempCity && (
                                <div>
                                    <label className={labelCls}>Ward / Unit</label>
                                    <select name="homeDepartment" className="w-full border border-slate-200 rounded-lg px-3 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none bg-white" value={formData.homeDepartment} onChange={handleChange}>
                                        <option value="">Select ward</option>
                                        {JURISDICTIONS_DATA[formData.tempCity as keyof typeof JURISDICTIONS_DATA].map((subCity: any) => (
                                            <option key={subCity.value} value={subCity.value}>{subCity.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        
                        <div>
                            <label className={labelCls}>Password</label>
                            <div className="relative">
                                <input name="password" type={showPassword ? "text" : "password"} className={inputCls(!!errors.password) + " pr-11"} placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        
                        <div>
                            <label className={labelCls}>Confirm Password</label>
                            <input name="confirmPassword" type="password" className={inputCls(!!errors.confirmPassword)} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-3.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mt-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting
                                ? <><span className="animate-spin material-symbols-outlined text-[18px]">sync</span> Creating account...</>
                                : <><span className="material-symbols-outlined text-[18px]">person_add</span> Create Account</>
                            }
                        </button>
                    </Form>

                    
                    <div className="relative my-6">
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

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
