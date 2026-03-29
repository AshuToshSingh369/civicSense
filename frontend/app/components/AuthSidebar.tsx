interface AuthSidebarProps {
    title1: string;
    title2: string;
    subtitle: string;
}

export default function AuthSidebar({ title1, title2, subtitle }: AuthSidebarProps) {
    return (
        <div className="hidden lg:flex w-1/2 relative overflow-hidden">
            
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/nepal-sidebar.png')" }}
            />

            
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/60 to-blue-900/40" />

            
            <div className="relative z-10 p-14 flex flex-col justify-between h-full text-white w-full">
                
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
                            <span className="material-symbols-outlined text-[18px]">radar</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight">CivicSense</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 mt-4">
                        <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="uppercase tracking-widest text-xs font-semibold text-white/90">Government of Nepal</span>
                    </div>
                </div>

                
                <div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-5 tracking-tight drop-shadow-lg">
                        {title1}<br />
                        <span className="text-blue-200">{title2}</span>
                    </h1>
                    <div className="w-16 h-1 bg-white/30 rounded-full mb-6" />
                    <p className="text-white/80 text-base xl:text-lg max-w-sm leading-relaxed font-medium">
                        {subtitle}
                    </p>

                    
                    <div className="mt-8 flex flex-col gap-3">
                        {[
                            { icon: "shield", text: "Secure & encrypted access" },
                            { icon: "location_on", text: "GPS-verified reporting" },
                            { icon: "notifications_active", text: "Real-time status updates" },
                        ].map(item => (
                            <div key={item.icon} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                                <span className="material-symbols-outlined text-blue-300 text-[18px]">{item.icon}</span>
                                <span className="text-sm font-medium text-white/90">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                
                <div className="flex gap-6 text-[11px] font-semibold text-white/50 uppercase tracking-widest pt-8 border-t border-white/10">
                    <span>Official Portal</span>
                    <span>·</span>
                    <span>Secure Access</span>
                    <span>·</span>
                    <span>Privacy Guaranteed</span>
                </div>
            </div>
        </div>
    );
}
