import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import type { Route } from "./+types/signup";
import AuthSidebar from "../components/AuthSidebar";
import { useAuth } from "../context/AuthContext";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Register - CivicSense Nepal" },
        { name: "description", content: "Create a new CivicSense account" },
    ];
}

const JURISDICTIONS: Record<string, string[]> = {
    "Kathmandu": ["Ward 1 - Central", "Ward 2 - Thamel", "Ward 3 - Maharajgunj", "Ward 4 - Baluwatar"],
    "Pokhara": ["Ward 5 - Lakeside", "Ward 6 - Baidam", "Ward 17 - Birauta", "Ward 9 - New Road"],
    "Lalitpur": ["Ward 3 - Pulchowk", "Ward 4 - Jhamsikhel", "Ward 5 - Jawalakhel", "Ward 2 - Sanepa"],
    "Bharatpur": ["Ward 10 - Chautari", "Ward 1 - Narayangarh", "Ward 12 - Bypass"],
    "Biratnagar": ["Ward 2 - Main Road", "Ward 7 - Bazaar", "Ward 9 - Airport Road"],
};

export default function Signup() {
    const navigate = useNavigate();
    const [role, setRole] = useState<"citizen" | "authority">("citizen");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login: authLogin } = useAuth();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        deptCode: "",
        homeDepartment: "",
        tempCity: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        deptCode: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }

        // Reset ward if city changes
        if (name === "tempCity") {
            setFormData(prev => ({ ...prev, homeDepartment: "" }));
        }
    };

    const validate = () => {
        let isValid = true;
        const newErrors = { firstName: "", lastName: "", email: "", deptCode: "", password: "", confirmPassword: "" };

        if (!formData.firstName.trim()) { newErrors.firstName = "First Name is required"; isValid = false; }
        if (!formData.lastName.trim()) { newErrors.lastName = "Last Name is required"; isValid = false; }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[9][0-9]{9}$/;
        if (!formData.email) {
            newErrors.email = "Email/Mobile is required";
            isValid = false;
        } else if (!emailRegex.test(formData.email) && !mobileRegex.test(formData.email)) {
            newErrors.email = "Invalid Format";
            isValid = false;
        }

        if (role === "authority" && !formData.deptCode.trim()) {
            newErrors.deptCode = "Dept Code is required";
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Min 6 chars required";
            isValid = false;
        }

        if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
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
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    password: formData.password,
                    role: role,
                    departmentCode: formData.deptCode,
                    homeDepartment: formData.homeDepartment
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
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
            alert(error.message || "Failed to register. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans text-gray-900">

            {/* Reusable Sidebar */}
            <AuthSidebar
                title1="Your Voice,"
                title2="Your Community."
                subtitle="Create an account to report issues, track progress, and help your Ward Office work efficiently."
            />

            {/* Right Panel - Form (Blue Theme) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-40 pointer-events-none"></div>

                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative z-10">
                    <div className="mb-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 bg-blue-700 text-white rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.75 3c1.995 0 3.529.902 4.25 2.522C12.721 3.902 14.255 3 16.25 3c3.036 0 5.5 2.322 5.5 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                            </div>
                            <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">CivicSense</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500">Join the Digital Nepal initiative.</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
                        <button type="button" onClick={() => setRole("citizen")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === "citizen" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Citizen</button>
                        <button type="button" onClick={() => setRole("authority")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === "authority" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Authority</button>
                    </div>

                    <Form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                <input name="firstName" type="text" className={`input-gov ${errors.firstName ? 'border-red-500' : ''}`} placeholder="Ram" value={formData.firstName} onChange={handleChange} />
                                {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                <input name="lastName" type="text" className={`input-gov ${errors.lastName ? 'border-red-500' : ''}`} placeholder="Sharma" value={formData.lastName} onChange={handleChange} />
                                {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName}</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email / Mobile</label>
                            <input name="email" type="text" className={`input-gov ${errors.email ? 'border-red-500' : ''}`} placeholder="ram@example.com" value={formData.email} onChange={handleChange} />
                            {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                        </div>

                        {role === "citizen" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                    <select
                                        name="tempCity"
                                        className="input-gov"
                                        onChange={handleChange}
                                        value={formData.tempCity} // Bind value
                                    >
                                        <option value="">Select City</option>
                                        {Object.keys(JURISDICTIONS).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                {formData.tempCity && ( // Use formData.tempCity directly
                                    <div className="animate-fade-in-down">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ward Number</label>
                                        <select
                                            name="homeDepartment"
                                            className="input-gov"
                                            value={formData.homeDepartment}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Ward</option>
                                            {JURISDICTIONS[formData.tempCity].map(ward => ( // Use formData.tempCity directly
                                                <option key={ward} value={`${formData.tempCity} - ${ward}`}>{ward}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {role === "authority" && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                    <select
                                        name="tempCity"
                                        className="input-gov"
                                        onChange={handleChange}
                                        value={formData.tempCity} // Bind value
                                    >
                                        <option value="">Select City</option>
                                        {Object.keys(JURISDICTIONS).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                {formData.tempCity && (
                                    <div className="animate-fade-in-down">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Primary Jurisdiction</label>
                                        <select
                                            name="deptCode"
                                            className="input-gov"
                                            value={formData.deptCode}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Ward</option>
                                            {JURISDICTIONS[formData.tempCity].map(ward => (
                                                <option key={ward} value={`${formData.tempCity} - ${ward}`}>{ward}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1">This sets your official municipal oversight area.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Create Password</label>
                            <input name="password" type="password" className={`input-gov ${errors.password ? 'border-red-500' : ''}`} placeholder="••••••••" value={formData.password} onChange={handleChange} />
                            {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                            <input name="confirmPassword" type="password" className={`input-gov ${errors.confirmPassword ? 'border-red-500' : ''}`} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                            {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full btn-primary py-4 shadow-lg shadow-blue-900/10 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Processing...' : 'Verify & Register'}
                        </button>
                    </Form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-700 font-bold hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
