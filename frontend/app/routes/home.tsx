import { Link, useNavigate } from "react-router";
import { useState, useRef } from "react";
import type { Route } from "./+types/home";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CivicSense - Nepal's Digital Nagarpalika" },
    { name: "description", content: "Official government platform for reporting civic issues directly to municipal authorities in Nepal." },
  ];
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const containerRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroImageRef = useRef(null);
  const statsRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Hero Text Sequence
    tl.from(".hero-badge", {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out"
    })
      .from(".hero-title", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.4")
      .from(".hero-desc", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6")
      .from(".hero-btns", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.4");

    // Hero Image Entrance
    gsap.from(heroImageRef.current, {
      x: 100,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.2
    });

    // Stats Strip
    gsap.from(".stat-item", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      scrollTrigger: {
        trigger: statsRef.current,
        start: "top 80%"
      }
    });

  }, { scope: containerRef });

  const handleReportClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-stone-50 font-sans text-gray-900 leading-relaxed selection:bg-amber-200 selection:text-amber-900 bg-noise relative overflow-hidden">

      {/* Background Animated Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-100/30 to-transparent blur-3xl pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-50/40 to-transparent blur-3xl pointer-events-none z-0"
      />

      <Navbar />

      {/* 3. HERO SECTION (Asymmetrical & Human) */}
      <main className="relative z-10">
        <section className="relative pt-12 pb-24 lg:pt-24 lg:pb-32">

          <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">

            {/* Text Content (Cols 7) */}
            <div ref={heroTextRef} className="lg:col-span-7 pt-8">
              <div className="hero-badge inline-block bg-amber-100 border border-amber-200 rounded-full px-4 py-1.5 mb-8">
                <span className="text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                  Official Public Beta
                </span>
              </div>

              <h1 className="hero-title text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tight mb-8 font-serif">
                A Better City <br />
                Starts With <span className="text-blue-800 relative inline-block">
                  You.
                  <img src="/bg-pattern.png" className="absolute bottom-0 left-0 w-full h-3 opacity-20" />
                </span>
              </h1>

              <p className="hero-desc text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                Skip the government office lines. Directly report infrastructure issues to your <span className="font-bold text-gray-900 border-b-2 border-amber-300">Ward Office</span> from your phone.
              </p>

              <div className="hero-btns flex flex-wrap gap-4 items-center">
                <Link
                  to="/report-issue"
                  onClick={handleReportClick}
                  className="btn-primary flex items-center gap-3 px-8 text-lg"
                >
                  <span>📷</span> Report an Issue
                </Link>
                <Link to="/track-report" className="px-8 py-3.5 font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors shadow-sm">
                  Track Status
                </Link>
              </div>

              <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest fade-in">
                Trusted by Kathmandu, Lalitpur, & Pokhara Metropolitans
              </p>
            </div>

            {/* Imagery (Cols 5) - Magazine Style Layout */}
            <div ref={heroImageRef} className="lg:col-span-5 relative h-[600px] hidden lg:block">
              {/* Main Image */}
              <div className="absolute top-0 right-0 w-[90%] h-[85%] bg-gray-200 rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700 ease-out border-4 border-white">
                <img src="/hero-nepal.png" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Kathmandu Street" />
              </div>

              {/* Floating Card - "Paper" feel */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute bottom-20 left-0 w-72 bg-white p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-t-4 border-amber-500"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">✓</div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Just Resolved</div>
                    <div className="font-bold text-gray-900">Pothole Fixed</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-mono">ID: #9823-KTM - 2h ago</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. STATISTICS STRIP (Paper Texture) */}
        <section ref={statsRef} className="bg-blue-900 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-10 mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div className="stat-item">
              <div className="text-4xl lg:text-5xl font-bold font-serif mb-2">12k+</div>
              <div className="text-blue-200 text-sm font-bold uppercase tracking-widest">Issues Fixed</div>
            </div>
            <div className="stat-item">
              <div className="text-4xl lg:text-5xl font-bold font-serif mb-2">45</div>
              <div className="text-blue-200 text-sm font-bold uppercase tracking-widest">Wards Active</div>
            </div>
            <div className="stat-item">
              <div className="text-4xl lg:text-5xl font-bold font-serif mb-2">24h</div>
              <div className="text-blue-200 text-sm font-bold uppercase tracking-widest">Avg. Response</div>
            </div>
            <div className="stat-item">
              <div className="text-4xl lg:text-5xl font-bold font-serif mb-2">4.8</div>
              <div className="text-blue-200 text-sm font-bold uppercase tracking-widest">Citizen Rating</div>
            </div>
          </div>
        </section>

        {/* 5. SERVICES GRID (Official Cards) */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-3 block">Digital Services</span>
            <h2 className="text-4xl font-bold text-gray-900 font-serif mb-6">What We Handle</h2>
            <p className="text-lg text-gray-600">The government is committed to maintaining public infrastructure. Report these issues directly.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                t: "Road Maintenance",
                d: "Potholes, broken pavement, footpath damage.",
                img: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80"
              },
              {
                t: "Waste Management",
                d: "Uncollected garbage, street litter, dumping.",
                img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80"
              },
              {
                t: "Water Utility",
                d: "Pipe leakage, shortage, water main bursts.",
                img: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80"
              },
              {
                t: "Street Lighting",
                d: "Broken lamps, dark zones, electrical hazards.",
                img: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&w=800&q=80"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={item.img} alt={item.t} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{item.t}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.d}</p>
                  <Link to="/report-issue" onClick={handleReportClick} className="text-blue-700 font-bold text-xs uppercase tracking-widest hover:text-blue-900 flex items-center gap-2">
                    Report Now <span>→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

        </section>

        {/* 6. CTA (Banner) */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto bg-gray-900 rounded-3xl p-12 lg:p-20 relative overflow-hidden flex flex-col items-center text-center">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white font-serif mb-6">Ready to make a change?</h2>
              <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">Join the Digital Nagarpalika movement. Registration takes less than 2 minutes.</p>
              <Link to="/signup" className="inline-flex items-center justify-center px-10 py-4 text-xl font-bold text-blue-900 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                Create Citizen Account
              </Link>
            </div>
            {/* Abstract Circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-600 rounded-full blur-[100px] opacity-20 translate-x-1/2 translate-y-1/2"></div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Authentication Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="bg-blue-900 p-8 text-center relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-white">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Authentication Required</h3>
              <p className="text-blue-100 text-sm">To ensure accountability and track your report, please sign in to your Citizen ID.</p>
            </div>
            <div className="p-8 space-y-4">
              <Link
                to="/login"
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                <span>🔑</span> Secure Login
              </Link>
              <Link
                to="/signup"
                className="w-full py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                Create New Citizen ID
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-center text-gray-400 text-xs font-bold uppercase tracking-widest pt-2 hover:text-gray-600 transition-colors"
              >
                Continue as Guest (Read Only)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
