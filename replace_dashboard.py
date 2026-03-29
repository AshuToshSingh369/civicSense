import os

filepath = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\dashboard.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()


replacements = [
    
    ('className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-20 relative selection:bg-primary selection:text-white"', 
     'className="min-h-screen bg-background-muted font-sans text-text-main pb-20 relative selection:bg-primary selection:text-white"'),
    
    
    ('''{/* Background Animated Elements */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>''', ''),

    
    ('glass-card text-white shadow-[0_0_30px_#0d93f24d] border border-primary/50', 
     'bg-white text-text-main shadow-sm border border-border-muted'),

    
    ('glass-card sticky top-0 z-50 border-b border-white/10 backdrop-blur-md', 
     'bg-white sticky top-0 z-50 border-b border-border-muted'),

    
    ('bg-primary/20 text-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_#0d93f24d] group-hover:bg-primary/30 transition-all border border-primary/40',
     'bg-background-muted text-primary rounded-lg flex items-center justify-center border border-border-muted group-hover:bg-primary group-hover:text-white transition-all'),

    ('text-white group-hover:text-primary transition-colors tracking-tight',
     'text-[#003d7a] group-hover:text-primary transition-colors tracking-tight'),
     
    ('text-[10px] text-primary/80 uppercase tracking-widest font-mono font-bold',
     'text-[10px] text-text-muted uppercase tracking-widest font-bold'),

    ('text-slate-300 hidden sm:flex', 'text-text-main hidden sm:flex'),
    ('text-slate-400 hover:text-white font-bold', 'text-text-muted hover:text-text-main font-bold'),

    
    ('relative h-64 overflow-hidden border-b border-white/10 z-10', 'relative h-64 overflow-hidden border-b border-border-muted z-10 bg-white'),
    ('bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent', 'bg-gradient-to-t from-background-light to-transparent'),
    ('size-24 bg-background-dark rounded-2xl border border-primary/40 shadow-[0_0_20px_#0d93f233]', 'size-24 bg-background-muted rounded-2xl border border-border-muted shadow-sm'),
    ('text-5xl text-primary/80 relative z-10', 'text-5xl text-primary relative z-10'),
    ('text-3xl font-bold text-white tracking-tight flex items-center gap-3', 'text-3xl font-extrabold text-[#003d7a] tracking-tight flex items-center gap-3'),
    ('text-slate-400 font-mono text-sm mt-1', 'text-text-muted text-sm mt-1 font-bold'),
    ('text-purple-400 uppercase', 'text-primary uppercase'),

    
    ('glass-card p-6 rounded-2xl border-white/10 hover:border-primary/30', 'card-gov hover:border-primary max-sm:p-4'),
    ('glass-card p-6 rounded-2xl border-white/10 hover:border-green-500/30', 'card-gov hover:border-green-500 max-sm:p-4'),
    ('glass-card p-6 rounded-2xl border-white/10 hover:border-amber-500/30', 'card-gov hover:border-amber-500 max-sm:p-4'),
    ('neon-card p-6 rounded-2xl border-primary/30 transition-all group relative overflow-hidden', 'card-gov hover:border-primary max-sm:p-4 transition-all group relative overflow-hidden'),
    
    ('text-slate-400 text-xs font-mono uppercase', 'text-text-muted text-xs font-bold uppercase'),
    ('text-green-400 text-xs font-mono uppercase', 'text-green-700 text-xs font-bold uppercase'),
    ('text-amber-400 text-xs font-mono uppercase', 'text-amber-700 text-xs font-bold uppercase'),
    ('text-primary text-xs font-mono uppercase', 'text-primary text-xs font-bold uppercase'),

    ('text-4xl font-bold text-white drop-shadow-[0_0_8px_#ffffff33]', 'text-4xl font-extrabold text-[#003d7a]'),
    ('text-4xl font-bold text-green-400 drop-shadow-[0_0_8px_#22c55e4d]', 'text-4xl font-extrabold text-green-600'),
    ('text-4xl font-bold text-amber-400 drop-shadow-[0_0_8px_#fbbf244d]', 'text-4xl font-extrabold text-amber-600'),
    ('text-4xl font-bold text-white drop-shadow-[0_0_8px_#0d93f280]', 'text-4xl font-extrabold text-primary'),
    ('absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30', 'absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20'),

    
    ('border-b border-white/10 pb-6', 'border-b border-border-muted pb-6'),
    ('text-2xl font-bold text-white tracking-tight', 'text-2xl font-extrabold text-[#003d7a] tracking-tight'),
    ('btn-primary flex items-center', 'btn-gov-primary flex items-center'),
    ('text-primary uppercase tracking-widest animate-pulse', 'text-primary uppercase tracking-widest font-bold animate-pulse'),

    
    ('glass-card border-white/10 rounded-xl p-6 hover:border-primary/40', 'card-gov hover:border-primary px-6 py-4'),
    ('absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-primary', 'absolute left-0 top-0 bottom-0 w-1 bg-border-muted group-hover:bg-primary'),
    ('font-mono text-xs text-primary/70 font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20', 'text-[10px] text-primary font-bold bg-background-muted px-2 py-0.5 rounded border border-border-muted tracking-widest uppercase'),
    ('px-2 py-0.5 rounded text-[10px] font-bold border', 'px-2 py-0.5 rounded text-[10px] font-bold border'),
    ('bg-background-dark/50 rounded-full overflow-hidden border border-white/5', 'bg-border-muted rounded-full overflow-hidden'),
    
    ('font-bold text-lg text-white group-hover:text-primary tracking-tight', 'font-extrabold text-lg text-[#003d7a] group-hover:text-primary tracking-tight'),
    ('text-slate-400 text-sm flex', 'text-text-muted text-sm font-bold flex'),
    ('text-primary/80 font-mono text-xs border border-primary/20 bg-primary/5', 'text-primary text-[10px] uppercase border border-primary/20 bg-background-muted font-bold tracking-widest'),
    ('border border-white/10 w-32 h-20 opacity-80', 'border border-border-muted w-32 h-20 opacity-90'),
    ('text-xs text-slate-500 font-mono uppercase flex items-center gap-1', 'text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1'),
    ('btn-secondary py-2 px-6', 'btn-gov-secondary py-2 px-6'),

    
    ('glass-card rounded-2xl border-white/5 border-dashed', 'bg-white rounded-lg border-2 border-border-muted border-dashed'),
    ('absolute inset-0 bg-grid-pattern opacity-5', ''),
    ('bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10', 'bg-background-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border-muted'),
    ('text-slate-500', 'text-primary'),
    ('text-slate-400 font-medium font-mono uppercase tracking-widest text-sm', 'text-text-muted font-bold uppercase tracking-widest text-xs')
]

for old, new in replacements:
    content = content.replace(old, new)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("dashboard.tsx updated successfully.")
