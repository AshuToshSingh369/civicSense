import { Link } from "react-router";

export default function Footer() {
    return (
        <footer className="relative bg-[#0b0f19] text-white pt-24 pb-12 overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    
                    
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined">radar</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter">CivicSense</h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            Nepal's leading civic engagement platform. Empowering citizens to build cleaner, safer, and better local communities through real-time technology.
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                                <a key={social} href="#" className="size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary transition-all">
                                    <span className="material-symbols-outlined text-[20px]">link</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-primary/80">Platform</h4>
                        <ul className="flex flex-col gap-4 text-sm font-medium text-slate-400">
                            <li><Link className="hover:text-white transition-colors flex items-center gap-2" to="/login"><span className="size-1 rounded-full bg-primary/40" /> Citizen Login</Link></li>
                            <li><Link className="hover:text-white transition-colors flex items-center gap-2" to="/signup"><span className="size-1 rounded-full bg-primary/40" /> Register Account</Link></li>
                            <li><Link className="hover:text-white transition-colors flex items-center gap-2" to="/track-report"><span className="size-1 rounded-full bg-primary/40" /> Track Issue Status</Link></li>
                            <li><Link className="hover:text-white transition-colors flex items-center gap-2" to="/authority-dashboard"><span className="size-1 rounded-full bg-primary/40" /> Staff Portal</Link></li>
                        </ul>
                    </div>

                    
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-primary/80">Active Zones</h4>
                        <ul className="flex flex-col gap-4 text-sm font-medium text-slate-400">
                            <li><span className="flex items-center gap-2"><span className="size-1 rounded-full bg-green-500" /> Kathmandu Metro</span></li>
                            <li><span className="flex items-center gap-2"><span className="size-1 rounded-full bg-green-500" /> Lalitpur Metro</span></li>
                            <li><span className="flex items-center gap-2"><span className="size-1 rounded-full bg-green-500" /> Pokhara Metro</span></li>
                            <li><span className="flex items-center gap-2"><span className="size-1 rounded-full bg-amber-500" /> Bharatpur (Beta)</span></li>
                        </ul>
                    </div>

                    
                    <div className="flex flex-col gap-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 text-primary/80">Support</h4>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Emergency Helpdesk</p>
                            <p className="text-lg font-bold text-white mb-4">support@civicsense.np</p>
                            <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Send Feedback</button>
                        </div>
                    </div>
                </div>

                
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="#" className="hover:text-white transition-colors">Security</Link>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>© 2026 CivicSense Nepal</span>
                        <span className="size-1 rounded-full bg-slate-800" />
                        <span className="flex items-center gap-2 text-white/50">Made in Nepal <span className="material-symbols-outlined text-[14px] text-red-500">favorite</span></span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
