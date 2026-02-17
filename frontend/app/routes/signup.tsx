import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/signup";
import AuthSidebar from "../components/AuthSidebar";
import { useAuth } from "../context/AuthContext";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Register - CivicSense Nepal" },
        { name: "description", content: "Create a new CivicSense account" },
    ];
}

const JURISDICTIONS_DATA = {
    "Kathmandu": [
        { label: "Ward 1 - Central", value: "KTM-W01" },
        { label: "Ward 2 - Thamel", value: "KTM-W02" },
        { label: "Ward 3 - Maharajgunj", value: "KTM-W03" }
    ],
    "Pokhara": [
        { label: "Ward 5 - Lakeside", value: "PKR-W05" },
        { label: "Ward 6 - Baidam", value: "PKR-W06" }
    ],
    "Lalitpur": [
        { label: "Ward 3 - Pulchowk", value: "LAL-W03" },
        { label: "Ward 4 - Jhamsikhel", value: "LAL-W04" }
    ]
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

            // Redirect to OTP Verification
            navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
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
                                        {Object.keys(JURISDICTIONS_DATA).map(city => (
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
                                            {JURISDICTIONS_DATA[formData.tempCity as keyof typeof JURISDICTIONS_DATA].map((ward: any) => ( // Use formData.tempCity directly
                                                <option key={ward.value} value={ward.value}>{ward.label}</option>
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
                                        {Object.keys(JURISDICTIONS_DATA).map(city => (
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
                                            {JURISDICTIONS_DATA[formData.tempCity as keyof typeof JURISDICTIONS_DATA].map((ward: any) => (
                                                <option key={ward.value} value={ward.value}>{ward.label}</option>
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
                </motion.div>
            </div>
        </div>
    );
}
