import { useState, useEffect, useRef } from "react";
import { Form, Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

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

export default function ReportIssue() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Authorities and Admins should not be reporting issues
        if (user && (user.role === 'authority' || user.role === 'admin')) {
            navigate('/authority-dashboard');
        }
    }, [user, navigate]);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        imageFile: null as File | null,
        imagePreview: null as string | null,
        location: "",
        landmark: "",
        category: "",
        description: "",
        tempCity: "",
        targetDepartment: "",
        coords: { lat: 27.7172, lng: 85.3240 } // Default Kathmandu
    });
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.homeDepartment && !formData.targetDepartment) {
            setFormData(prev => ({ ...prev, targetDepartment: user.homeDepartment! }));
        }

        // Capture Real Geolocation
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        coords: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }));
                },
                (error) => {
                    console.warn("Geolocation permission denied or error:", error);
                }
            );
        }
    }, [user]);

    const validateStep = (currentStep: number) => {
        let isValid = true;
        let newErrors: any = {};

        if (currentStep === 1) {
            if (!formData.imagePreview) {
                newErrors.image = "Please capture or upload an image first.";
                isValid = false;
            }
        }

        if (currentStep === 2) {
            if (!formData.landmark.trim()) {
                newErrors.landmark = "Please enter a landmark or Tole name.";
                isValid = false;
            }
            if (!formData.targetDepartment) {
                newErrors.targetDepartment = "Please select a department.";
                isValid = false;
            }
        }

        if (currentStep === 3) {
            if (!formData.category) {
                newErrors.category = "Please select a category.";
                isValid = false;
            }
            if (!formData.description.trim()) {
                newErrors.description = "Please provide a description.";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep((prev) => prev - 1);
        else navigate(-1);
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setIsSubmitting(true);
        try {
            // Use FormData for Multer (file upload)
            const submitData = new FormData();
            submitData.append('title', `${formData.category} at ${formData.landmark}`);
            submitData.append('description', formData.description);
            submitData.append('location', formData.landmark);
            submitData.append('category', formData.category);
            submitData.append('targetDepartment', formData.targetDepartment);
            submitData.append('coordinates', JSON.stringify(formData.coords));

            if (formData.imageFile) {
                submitData.append('image', formData.imageFile);
            }

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                    // Note: Browser sets Content-Type to multipart/form-data automatically with FormData
                },
                body: submitData,
            });

            if (!response.ok) {
                throw new Error('Failed to submit report');
            }

            // Success
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, imageFile: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imagePreview: reader.result as string }));
                if (errors.image) setErrors({ ...errors, image: null });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };


    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col md:flex-row">

            {/* Left Panel - Visual Guidance (Hidden on Mobile) */}
            <div className="hidden md:block w-1/3 lg:w-1/4 bg-blue-900 relative">
                <img
                    src="/auth-sidebar.png"
                    alt="Community Service"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="p-8 relative z-10 text-white h-full flex flex-col">
                    <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white font-bold mb-12 flex items-center gap-2 w-fit">
                        <span>←</span> Back
                    </button>

                    <div className="mt-auto mb-12">
                        <h2 className="text-3xl font-bold mb-4">Make a Difference</h2>
                        <p className="text-blue-100 text-sm leading-relaxed mb-6">
                            Your report directly alerts the Ward Office. Please ensure photos are clear and locations are precise.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-white/10 backdrop-blur rounded p-4 border-l-4 border-green-400">
                                <h3 className="font-bold text-sm">Valid Evidence</h3>
                                <p className="text-xs text-blue-200">Clear daylight photos of potholes, garbage, or damage.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded p-4 border-l-4 border-red-400">
                                <h3 className="font-bold text-sm">Invalid Reports</h3>
                                <p className="text-xs text-blue-200">Personal disputes, blurry images, or non-civic issues.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Wizard Content */}
            <div className="flex-grow flex flex-col relative bg-[url('/bg-pattern.png')] bg-fixed bg-cover">

                {/* Mobile Header */}
                <header className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg">
                    <span className="font-bold">Report Issue</span>
                    <Link to="/" className="text-sm opacity-80">Cancel</Link>
                </header>

                <main className="flex-grow flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">

                    {/* Progress Bar */}
                    <div className="w-full max-w-2xl mb-8">
                        <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-3 px-1">
                            <span className={step >= 1 ? "text-blue-700" : ""}>Step 1: Evidence</span>
                            <span className={step >= 2 ? "text-blue-700" : ""}>Step 2: Location</span>
                            <span className={step >= 3 ? "text-blue-700" : ""}>Step 3: Details</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                style={{ width: `${(step / 3) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Wizard Card */}
                    <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl border border-gray-100 p-8 md:p-12 relative animate-fade-in-up">

                        {/* Step 1: Evidence */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Capture Evidence</h2>
                                <p className="text-gray-500 mb-8 text-lg">Take a photo of the issue for verification.</p>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />

                                <div
                                    onClick={handleImageUpload}
                                    className={`border-2 border-dashed ${formData.imagePreview ? 'border-green-500 bg-green-50' : 'border-blue-300 bg-blue-50'} rounded-2xl h-80 flex flex-col items-center justify-center gap-6 hover:bg-white transition-all cursor-pointer group shadow-inner relative overflow-hidden`}
                                >
                                    {formData.imagePreview ? (
                                        <>
                                            <img src={formData.imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Preview" />
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce-slow relative z-10">
                                                <span className="text-3xl">✓</span>
                                            </div>
                                            <div className="text-center relative z-10">
                                                <span className="font-bold text-green-700 text-xl block">Photo Captured</span>
                                                <span className="text-sm text-gray-500">Tap to retake</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                                                <span className="text-3xl">📷</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="font-bold text-blue-700 text-xl block">Tap to Camera</span>
                                                <span className="text-sm text-gray-500">or upload from gallery</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {errors.image && <p className="text-red-600 text-sm mt-3 font-bold text-center animate-pulse">{errors.image}</p>}

                                <div className="mt-10 flex justify-end">
                                    <button onClick={handleNext} className="btn-primary w-full md:w-auto px-10 py-4 text-lg shadow-xl shadow-blue-900/20">
                                        Next Step →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Location</h2>
                                <p className="text-gray-500 mb-8 text-lg">We've Auto-detected your location.</p>

                                <div className="bg-gray-100 rounded-2xl h-56 mb-8 flex items-center justify-center relative overflow-hidden border border-gray-300 shadow-inner">
                                    <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-30"></div>
                                    <div className="text-center z-10 p-6 bg-white/80 backdrop-blur rounded-xl shadow-sm">
                                        <span className="text-5xl block mb-2">📍</span>
                                        <p className="font-bold text-gray-800 text-xl">{formData.landmark || 'Current Location'}</p>
                                        <p className="text-sm font-mono text-gray-500 mt-1">LAT: {formData.coords.lat.toFixed(4)} • LONG: {formData.coords.lng.toFixed(4)}</p>
                                    </div>
                                </div>


                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nearby Landmark / Tole</label>
                                    <input
                                        type="text"
                                        className={`input-gov text-lg py-4 ${errors.landmark ? 'border-red-500' : ''}`}
                                        placeholder="e.g., Behind Krishna Mandir"
                                        value={formData.landmark}
                                        onChange={(e) => {
                                            setFormData({ ...formData, landmark: e.target.value });
                                            if (errors.landmark) setErrors({ ...errors, landmark: null });
                                        }}
                                    />
                                    {errors.landmark && <p className="text-red-600 text-xs mt-1 font-bold">{errors.landmark}</p>}
                                </div>

                                <div className="mb-8 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                        <select
                                            className="input-gov text-lg py-4"
                                            value={formData.tempCity}
                                            onChange={(e) => setFormData({ ...formData, tempCity: e.target.value, targetDepartment: "" })}
                                        >
                                            <option value="">Select City</option>
                                            {Object.keys(JURISDICTIONS_DATA).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.tempCity && (
                                        <div className="animate-fade-in-down">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Target Ward</label>
                                            <select
                                                className={`input-gov text-lg py-4 ${errors.targetDepartment ? 'border-red-500' : ''}`}
                                                value={formData.targetDepartment}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, targetDepartment: e.target.value });
                                                    if (errors.targetDepartment) setErrors({ ...errors, targetDepartment: null });
                                                }}
                                            >
                                                <option value="">Select Ward</option>
                                                {JURISDICTIONS_DATA[formData.tempCity as keyof typeof JURISDICTIONS_DATA].map((ward: any) => (
                                                    <option key={ward.value} value={ward.value}>{ward.label}</option>
                                                ))}
                                            </select>
                                            {errors.targetDepartment && <p className="text-red-600 text-xs mt-1 font-bold">{errors.targetDepartment}</p>}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-gray-400 mt-1 italic">
                                        Defaults to your home jurisdiction. Change this if reporting from a different city or ward.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={handleBack} className="btn-secondary flex-1 py-4">Back</button>
                                    <button onClick={handleNext} className="btn-primary flex-[2] py-4 shadow-xl shadow-blue-900/20">Confirm & Next</button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Details */}
                        {step === 3 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Final Details</h2>
                                <p className="text-gray-500 mb-8 text-lg">Help us categorize this issue.</p>

                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {["Pothole", "Garbage", "Water", "Light", "Pollution", "Other"].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setFormData({ ...formData, category: cat });
                                                    if (errors.category) setErrors({ ...errors, category: null });
                                                }}
                                                className={`p-4 rounded-xl border-2 font-bold transition-all text-center ${formData.category === cat ? 'border-blue-600 bg-blue-600 text-white shadow-lg transform scale-105' : 'border-gray-200 hover:border-blue-300 text-gray-600 bg-gray-50'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.category && <p className="text-red-600 text-xs mt-2 font-bold">{errors.category}</p>}
                                </div>

                                <div className="mb-10">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        className={`input-gov h-40 resize-none text-lg ${errors.description ? 'border-red-500' : ''}`}
                                        placeholder="Please describe the issue..."
                                        value={formData.description}
                                        onChange={(e) => {
                                            setFormData({ ...formData, description: e.target.value });
                                            if (errors.description) setErrors({ ...errors, description: null });
                                        }}
                                    ></textarea>
                                    {errors.description && <p className="text-red-600 text-xs mt-1 font-bold">{errors.description}</p>}
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={handleBack} className="btn-secondary flex-1 py-4">Back</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`btn-primary flex-[2] bg-green-600 hover:bg-green-700 border-green-600 shadow-xl shadow-green-900/20 py-4 text-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
