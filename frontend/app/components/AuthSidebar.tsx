interface AuthSidebarProps {
    title1: string;
    title2: string;
    subtitle: string;
}



export default function AuthSidebar({ title1, title2, subtitle }: AuthSidebarProps) {
    return (
        <div className="hidden lg:flex w-1/2 relative bg-blue-900 overflow-hidden">
            <img
                src="/auth-sidebar.png"
                alt="Traditional Nepali Architecture"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-blue-900/50"></div>

            <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
                <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6">
                        <span className="text-xl">🇳🇵</span>
                        <span className="uppercase tracking-widest text-sm font-bold">Secure Portal</span>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-4">
                        {title1}<br />
                        <span className="text-blue-200">{title2}</span>
                    </h1>
                    <p className="text-blue-100 text-lg max-w-md">
                        {subtitle}
                    </p>
                </div>
                <div className="flex gap-4 opacity-60 text-sm">
                    <span>• Secure Encryption</span>
                    <span>• Government Verified</span>
                    <span>• 24/7 Support</span>
                </div>
            </div>
        </div>
    );
}
