import os

filepath = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\authority-dashboard.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    
    ('className="min-h-screen bg-[#0b0c10] font-display text-slate-100 selection:bg-primary selection:text-white relative overflow-x-hidden"',
     'className="min-h-screen bg-background-muted font-sans text-text-main selection:bg-primary selection:text-white relative overflow-x-hidden"'),

    
    ('''{/* Background Animated Elements */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0d93f21a] rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#a855f71a] rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>''', ''),

    
    ('glass-card border-2 flex items-center gap-4 bg-red-900/90 border-red-500 shadow-[0_0_30px_#ef444466] backdrop-blur-xl',
     'bg-white border flex items-center gap-4 border-red-500 shadow-sm rounded-xl'),
    ('glass-card border-2 flex items-center gap-4 bg-primary/20 border-primary shadow-[0_0_30px_#0d93f266] backdrop-blur-xl',
     'bg-white border flex items-center gap-4 border-primary shadow-sm rounded-xl'),
    ('bg-white/10 rounded-full flex items-center justify-center text-2xl animate-pulse border border-white/20',
     'bg-background-muted rounded-full flex items-center justify-center text-2xl animate-pulse border border-border-muted'),
    ('text-white', 'text-text-main'),
    ('font-bold text-lg tracking-tight', 'font-extrabold text-lg text-[#003d7a] tracking-tight'),
    ('text-white/60 hover:text-white transition-colors', 'text-text-muted hover:text-text-main transition-colors'),

    
    ('bg-[#0b0c10]/95 border-primary/30 rounded-2xl shadow-[0_0_50px_#00000080]', 'bg-white border-border-muted rounded-2xl shadow-lg'),
    ('bg-grid-pattern opacity-5', ''),
    ('bg-primary/10 p-6 border-b border-primary/20', 'bg-background-muted p-6 border-b border-border-muted'),
    ('text-xl font-bold text-white tracking-tight', 'text-xl font-extrabold text-[#003d7a] tracking-tight'),
    ('text-slate-400 hover:text-white', 'text-text-muted hover:text-text-main'),

    ('text-xs font-mono font-bold text-primary/80 uppercase tracking-widest', 'text-xs font-bold text-text-main uppercase tracking-widest'),
    ('input-gov text-sm', 'input-gov text-sm text-text-main bg-white border-border-muted'),
    ('bg-background-dark', 'bg-background-light text-text-main'),
    ('px-6 py-2 text-slate-400 font-bold hover:text-white', 'px-6 py-2 text-text-muted font-bold hover:text-text-main'),

    
    ('glass-card sticky top-0 z-50 border-b border-white/10 backdrop-blur-md', 'bg-white sticky top-0 z-50 border-b border-border-muted shadow-sm'),
    ('bg-primary/20 text-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_#0d93f24d] group-hover:bg-primary/30 transition-all border border-primary/40', 'bg-background-muted text-primary rounded-lg flex items-center justify-center border border-border-muted group-hover:bg-primary group-hover:text-white transition-all'),
    ('font-bold text-lg block text-white group-hover:text-primary transition-colors tracking-tight', 'font-extrabold text-lg block text-[#003d7a] group-hover:text-primary transition-colors tracking-tight'),
    ('text-[10px] text-primary/80 uppercase tracking-widest font-mono font-bold', 'text-[10px] text-text-muted uppercase tracking-widest font-bold'),
    ('text-white/10', 'border-border-muted'),
    ('text-xs font-mono text-primary/60 uppercase', 'text-[10px] font-bold text-text-muted uppercase'),
    ('text-sm font-bold text-white uppercase', 'text-sm font-extrabold text-[#003d7a] uppercase'),
    ('text-slate-300', 'text-text-main'),
    ('text-red-400/80 hover:text-red-400', 'text-red-600 hover:text-red-700'),

    
    ('bg-primary/5 pt-12 pb-24 px-6 relative border-b border-white/10', 'bg-white pt-12 pb-24 px-6 relative border-b border-border-muted'),
    ('w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen opacity-30', 'hidden'),
    ('bg-primary/10 border border-primary/30', 'bg-background-muted border border-border-muted'),
    ('text-primary text-xs font-mono font-bold', 'text-primary text-[10px] font-bold'),
    ('text-4xl xl:text-5xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_#0d93f24d]', 'text-4xl xl:text-5xl font-extrabold text-[#003d7a] tracking-tight'),
    ('text-slate-400 font-mono text-sm mt-2 max-w-xl border-l-2 border-primary/20 pl-4', 'text-text-muted text-sm mt-3 max-w-xl border-l-4 border-primary pl-4 font-medium'),
    ('text-primary font-bold uppercase', 'text-[#003d7a] font-bold uppercase'),

    ('btn-secondary py-3 px-8 flex items-center gap-2 group relative overflow-hidden backdrop-blur-xl border-primary/20 hover:border-primary/50 text-base', 'btn-gov-secondary py-3 px-8 flex items-center gap-2 group text-base'),

    
    ('border-white/10 bg-white/5', 'bg-white border-border-muted shadow-sm hover:border-primary'),
    ('border-red-500/30 bg-red-500/5 text-rose-500', 'bg-red-50 border-red-200 text-red-700 shadow-sm'),
    ('shadow-[0_0_20px_#f43f5e1a]', ''),
    ('border-primary/30 bg-primary/5 text-primary', 'bg-blue-50 border-blue-200 text-primary shadow-sm'),
    ('shadow-[0_0_20px_#0d93f21a]', ''),
    ('border-green-500/30 bg-green-500/5 text-green-500', 'bg-green-50 border-green-200 text-green-700 shadow-sm'),
    ('shadow-[0_0_20px_#22c55e1a]', ''),
    ('text-4xl font-bold text-white tracking-tighter drop-shadow-[0_0_8px_#ffffff33] font-mono', 'text-4xl font-extrabold tracking-tighter'),
    ('className={`glass-card p-6 rounded-2xl border ${stat.color} ${stat.glow || ''} group transition-all`}', 'className={`p-6 rounded-xl border ${stat.color} group transition-all`}'),
    
    
    ('font-mono font-bold uppercase tracking-[0.2em] opacity-60', 'font-bold uppercase tracking-widest text-[#003d7a]'),

    
    ('glass-card border-white/5 rounded-3xl overflow-hidden shadow-[0_20px_50px_#00000080]', 'bg-white border border-border-muted rounded-xl shadow-sm overflow-hidden'),
    ('bg-white/[0.02]', 'bg-background-muted/50'),
    ('text-2xl font-bold tracking-tight', 'text-2xl font-extrabold text-[#003d7a] tracking-tight'),
    ('bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest border border-white/10 transition-all', 'bg-white hover:bg-background-muted text-text-main font-bold rounded border border-border-muted transition-all'),

    ('text-primary uppercase tracking-widest animate-pulse', 'text-primary uppercase font-bold tracking-widest animate-pulse'),

    
    ('glass-card bg-white/[0.02] border-white/10 rounded-2xl p-6 hover:border-primary/40 hover:bg-white/[0.04]', 'bg-white border border-border-muted rounded-xl p-6 hover:border-primary shadow-sm'),
    ('w-1 bg-white/10 group-hover:bg-primary', 'w-1 bg-border-muted group-hover:bg-primary'),
    ('font-mono text-xs text-primary/70 font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20', 'text-[10px] text-primary font-bold bg-background-muted px-2 py-0.5 rounded border border-border-muted tracking-widest uppercase'),
    ('border-white/10', 'border-border-muted'),
    ('text-[10px] text-slate-500 font-mono uppercase', 'text-[10px] text-text-muted font-bold uppercase tracking-widest'),
    ('font-bold text-xl text-white group-hover:text-primary tracking-tight', 'font-extrabold text-xl text-[#003d7a] group-hover:text-primary tracking-tight'),
    ('bg-white/5 border border-white/10', 'bg-background-muted border border-border-muted'),
    ('bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-xs shadow-[0_0_15px_#a855f733]', 'bg-purple-50 border border-purple-200 text-purple-700 font-bold tracking-widest text-[10px]'),

    ('border border-purple-500/30 bg-purple-500/5 rounded-xl text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em]', 'border border-purple-200 bg-purple-50 rounded-xl text-purple-700 font-bold text-[10px] uppercase tracking-widest'),
    
    
    ('bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-xs font-bold border border-primary/40', 'bg-blue-50 hover:bg-blue-100 text-primary rounded-lg text-xs font-bold border border-blue-200'),
    ('shadow-[0_0_15px_#0d93f233]', 'shadow-sm'),
    ('bg-green-500 text-white rounded-xl text-xs font-bold hover:shadow-[0_0_20px_#22c55e66]', 'bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm'),
    
    ('border border-green-500/30 bg-green-500/10 rounded-xl text-green-500', 'border border-green-200 bg-green-50 rounded-lg text-green-700'),
    ('bg-primary/10 hover:bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/30 hover:border-primary/50', 'bg-blue-50 hover:bg-blue-100 text-primary rounded-lg flex items-center justify-center border border-blue-200'),
    ('bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl flex items-center justify-center border border-white/10 hover:border-primary/50', 'bg-white hover:bg-background-muted text-text-muted hover:text-primary rounded-lg flex items-center justify-center border border-border-muted hover:border-primary'),

    
    ('text-lg font-bold text-white tracking-tight uppercase', 'text-lg font-extrabold text-[#003d7a] tracking-tight uppercase'),
    ('border border-primary/20 bg-primary/5 font-mono text-[8px] text-primary font-bold', 'border border-primary bg-primary/10 text-[10px] text-primary font-bold'),
    ('glass-card w-full h-[400px] lg:h-[550px] rounded-3xl overflow-hidden border-primary/30 shadow-[0_0_50px_#00000080]', 'bg-white border border-border-muted w-full h-[400px] lg:h-[550px] rounded-xl overflow-hidden shadow-sm'),

    ('glass-card p-4 rounded-xl border-white/5 bg-white/[0.02]', 'bg-white p-4 rounded-xl border border-border-muted shadow-sm'),
    ('text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest', 'text-[10px] font-bold text-text-muted uppercase tracking-widest'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("authority-dashboard.tsx updated successfully.")
