import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import CitizenLocationPicker from "../components/map/CitizenLocationPicker";
import { JURISDICTIONS_DATA } from "../utils/jurisdictions";

export default function ReportIssue() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && (user.role === 'authority' || user.role === 'admin')) {
            navigate('/authority-dashboard');
        }
    }, [user, navigate]);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        imageFile: null as File | null,
        imagePreview: null as string | null,
        detectedLocation: "",
        category: "",
        contactNumber: "",
        coords: null as { lat: number; lng: number } | null
    });

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&email=support@civicsense.com`);
            if (!res.ok) return;
            const data = await res.json();
            if (!data || data.error) return;
            setFormData(prev => ({ ...prev, detectedLocation: data.display_name || "Unknown Location" }));
        } catch (error) {
            console.error("Geocoding failed", error);
        } finally {
            setIsDetecting(false);
        }
    };

    const handleLocationSelect = (coords: { lat: number, lng: number }) => {
        setFormData(prev => ({ ...prev, coords }));
        setIsDetecting(true);
        fetchAddress(coords.lat, coords.lng);
        showToast("📍 Location updated from map");
    };

    const validateStep = (currentStep: number) => {
        let isValid = true;
        let newErrors: any = {};
        if (currentStep === 1 && !formData.coords) { newErrors.coords = "Please select a location on the map."; isValid = false; }
        if (currentStep === 2 && !formData.imagePreview) { newErrors.image = "Please upload a photo of the issue."; isValid = false; }
        if (currentStep === 3) {
            if (!/^\d{10}$/.test(formData.contactNumber)) { newErrors.contactNumber = "Please enter a valid 10-digit contact number."; isValid = false; }
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => { if (validateStep(step)) setStep((prev) => prev + 1); };
    const handleBack = () => { if (step > 1) setStep((prev) => prev - 1); else navigate(-1); };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;
        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('title', `Report by Citizen`);
            submitData.append('contactNumber', formData.contactNumber);
            submitData.append('location', formData.detectedLocation || "Unknown Area");
            submitData.append('targetDepartment', user?.departmentCode || "Unknown Ward");
            submitData.append('coordinates', JSON.stringify(formData.coords));
            if (formData.imageFile) submitData.append('image', formData.imageFile);

            const response = await fetch('/api/reports', {
                method: 'POST',
                credentials: 'include',
                body: submitData,
            });
            if (!response.ok) throw new Error('Failed to submit report');
            navigate("/dashboard");
        } catch (error: any) {
            alert(error.message || "Failed to submit report.");
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

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-primary selection:text-white flex flex-col relative overflow-x-hidden">
            
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none -z-10" />
            <div className="fixed -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Toast */}
            {toastMsg && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] bg-white border border-primary/20 text-slate-900 font-bold text-sm px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-slide-up">
                    <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
                    {toastMsg}
                </div>
            )}

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[24px]">radar</span>
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none mb-1">Report Issue</h1>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Civic Action Portal</span>
                        </div>
                    </div>
                    <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                        <span className="hidden sm:inline">Cancel</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col max-w-5xl mx-auto w-full px-6 py-12 lg:py-20">
                
                {/* Stepper Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-center max-w-md mx-auto relative mb-4">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
                        <div 
                            className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -z-10 -translate-y-1/2" 
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                        
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex flex-col items-center gap-3">
                                <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${step >= num ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    {step > num ? <span className="material-symbols-outlined text-[18px]">check</span> : num}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest -mb-10 sm:mb-0 ${step === num ? 'text-primary' : 'text-slate-400'}`}>
                                    {num === 1 ? 'Location' : num === 2 ? 'Evidence' : 'Details'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wizard Container */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative">
                    
                    {/* Step 1: Location */}
                    {step === 1 && (
                        <div className="fadeIn">
                            <div className="p-8 sm:p-12 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Where is the issue?</h2>
                                <p className="text-slate-500 text-lg">Pin the exact location on the map to help us find it.</p>
                            </div>
                            <div className="p-8 sm:p-12 space-y-8">
                                <div className="h-[400px] sm:h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative group">
                                    <CitizenLocationPicker initialLocation={formData.coords || undefined} onLocationSelect={handleLocationSelect} />
                                    {isDetecting && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                            <span className="text-primary font-bold text-xs uppercase tracking-widest animate-pulse">Detecting address...</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 z-[100] flex flex-col gap-2">
                                        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                                            Live GPS Active
                                        </div>
                                    </div>
                                </div>

                                {errors.coords && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                                        <span className="material-symbols-outlined text-[20px]">error</span>
                                        {errors.coords}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Verified Address</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-4 transition-all hover:bg-slate-100">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">location_on</span>
                                        </div>
                                        <p className="text-slate-700 font-medium leading-relaxed pt-1 flex-1">
                                            {formData.detectedLocation || "Tap the map to set location..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Evidence */}
                    {step === 2 && (
                        <div className="fadeIn">
                            <div className="p-8 sm:p-12 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Upload Evidence</h2>
                                <p className="text-slate-500 text-lg">A clear photo helps the authorities assess the situation quickly.</p>
                            </div>
                            <div className="p-8 sm:p-12 flex flex-col items-center">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full max-w-2xl h-[400px] rounded-3xl border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-6 group overflow-hidden relative ${formData.imagePreview ? 'border-primary/50 bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:border-primary/30 hover:bg-slate-100'}`}
                                >
                                    {formData.imagePreview ? (
                                        <>
                                            <img src={formData.imagePreview} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Preview" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm">
                                                <div className="size-16 rounded-full bg-white text-primary flex items-center justify-center shadow-xl">
                                                    <span className="material-symbols-outlined text-[32px]">published_with_changes</span>
                                                </div>
                                                <span className="text-white font-bold mt-4 uppercase tracking-widest text-xs">Tap to change photo</span>
                                            </div>
                                            <div className="absolute bottom-6 right-6 z-10">
                                               <div className="bg-white/90 backdrop-blur rounded-full px-4 py-2 border border-slate-200 shadow-lg text-primary text-xs font-bold flex items-center gap-2">
                                                   <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                   Photo Captured
                                               </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="size-24 rounded-full bg-white shadow-xl shadow-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all">
                                                <span className="material-symbols-outlined text-[40px]">add_a_photo</span>
                                            </div>
                                            <div className="text-center px-6">
                                                <h3 className="text-xl font-extrabold text-slate-900 mb-1">Click to browse or take photo</h3>
                                                <p className="text-slate-500 text-sm">Accepted formats: JPG, PNG, WEBP (Max 10MB)</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {errors.image && (
                                    <div className="mt-8 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 text-sm font-semibold animate-shake">
                                        <span className="material-symbols-outlined text-[20px]">error_outline</span>
                                        {errors.image}
                                    </div>
                                )}
                                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                                    {[
                                        { title: "Point & Shoot", icon: "center_focus_strong" },
                                        { title: "Stay Close", icon: "photo_camera" },
                                        { title: "Full Detail", icon: "zoom_in" }
                                    ].map(tip => (
                                        <div key={tip.title} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 text-center">
                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">{tip.icon}</span>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{tip.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {step === 3 && (
                        <div className="fadeIn">
                            <div className="p-8 sm:p-12 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Customer Details</h2>
                                <p className="text-slate-500 text-lg">Please provide your contact number. Our AI will automatically detect the issue from your photo.</p>
                            </div>
                            <div className="p-8 sm:p-12 space-y-12">

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-medium leading-relaxed ${errors.contactNumber ? 'border-red-400' : ''}`}
                                        placeholder="Enter 10-digit phone number..."
                                        value={formData.contactNumber}
                                        onChange={(e) => { 
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, contactNumber: val }); 
                                            if (errors.contactNumber) setErrors({ ...errors, contactNumber: null }); 
                                        }}
                                    />
                                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">error</span> {errors.contactNumber}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Footer */}
                    <div className="p-8 sm:p-12 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                        {step > 1 ? (
                             <button onClick={handleBack} className="flex-1 sm:flex-none px-8 py-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Previous Step
                             </button>
                        ) : (
                            <Link to="/dashboard" className="flex-1 sm:flex-none px-8 py-4 rounded-xl border border-slate-200 bg-white text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                Dashboard
                            </Link>
                        )}
                        
                        {step < 3 ? (
                            <button onClick={handleNext} className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                Continue Verification
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        ) : (
                            <button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className={`flex-1 py-4 rounded-2xl bg-green-600 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-green-200 hover:shadow-green-300 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 relative overflow-hidden ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined text-[20px]">sync</span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                                        Dispatch Report
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 px-4">
                    <div className="flex items-center gap-6">
                        {[
                            { text: "Privacy Protected", icon: "lock" },
                            { text: "Legal Protection", icon: "gavel" }
                        ].map(item => (
                            <div key={item.text} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase text-center sm:text-right">
                        CivicSense Portal V2.4 · Real-time Reporting Engine
                    </p>
                </div>
            </main>
        </div>
    );
}
