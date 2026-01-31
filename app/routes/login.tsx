import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import AuthSidebar from "../components/AuthSidebar";

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            // Mock Success
            if (role === "citizen") navigate("/dashboard");
            else navigate("/authority/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans text-gray-900">

            {/* Reusable Sidebar */}
            <AuthSidebar
                title1="Welcome Back,"
                title2="Citizen."
                subtitle="Log in to check the status of your reports and stay connected with your local government."
            />

            {/* Right Panel - Professional Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-40 pointer-events-none"></div>

                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative z-10">
                    <div className="mb-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 bg-blue-700 text-white rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.75 3c1.995 0 3.529.902 4.25 2.522C12.721 3.902 14.255 3 16.25 3c3.036 0 5.5 2.322 5.5 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                            </div>
                            <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">CivicSense</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Namaste! 🙏</h2>
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
                                {role === "citizen" ? "Mobile Number / Email" : "Department ID"}
                            </label>
                            <input
                                type="text"
                                className={`input-gov ${errors.identifier ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                                placeholder={role === "citizen" ? "e.g., 9841XXXXXX" : "e.g., KTM-WARD-04-ADMIN"}
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

                        <button type="submit" className="w-full btn-primary py-4 shadow-lg shadow-blue-900/10">
                            Secure Login
                        </button>
                    </Form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        New to CivicSense?{' '}
                        <Link to="/signup" className="text-blue-700 font-bold hover:underline font-lg">
                            Create Citizenship ID
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
