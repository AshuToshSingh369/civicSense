import os

filepath = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\report-issue.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    # Top container
    ('className="min-h-screen bg-background-light dark:bg-background-muted font-display text-slate-900 dark:text-text-main flex flex-col md:flex-row relative selection:bg-primary selection:text-white overflow-hidden"',
     'className="min-h-screen bg-background-muted font-sans text-text-main flex flex-col md:flex-row relative selection:bg-primary selection:text-white overflow-hidden"'),

    # Animated elements remove
    ('''{/* Background Animated Elements */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>''', ''),

    # Toast
    ('bg-white border border-border-muted shadow-sm border-primary/50 text-white font-mono text-sm px-6 py-3 rounded-full shadow-sm animate-fade-in-down flex items-center gap-3 backdrop-blur-xl',
     'bg-white border text-text-main font-bold text-sm px-6 py-3 rounded-full shadow-sm border-primary animate-fade-in-down flex items-center gap-3'),

    # Left Panel
    ('p-8 relative z-10 text-white h-full flex flex-col', 'p-8 relative z-10 text-text-main h-full flex flex-col'),
    ('text-text-muted hover:text-white font-mono text-sm uppercase', 'text-text-muted hover:text-text-main font-bold text-xs uppercase'),
    
    ('text-4xl font-bold mb-4 tracking-tight drop-shadow-[0_0_15px_#0d93f24d]', 'text-4xl font-extrabold text-[#003d7a] mb-4 tracking-tight'),
    ('text-text-muted text-sm font-mono leading-relaxed mb-8 border-l-2 border-primary/30 pl-4 bg-background-muted p-4 rounded-r-lg', 'text-text-muted text-sm font-bold leading-relaxed mb-8 border-l-4 border-primary pl-4 p-4 rounded-r-lg'),
    
    ('font-bold text-sm tracking-tight text-white flex', 'font-bold text-sm tracking-tight flex text-text-main'),
    ('hover:bg-white/10', 'hover:border-primary'),

    # Mobile Header
    ('bg-white border border-border-muted shadow-sm text-white p-4 flex justify-between items-center border-b border-border-muted sticky top-0 z-50 backdrop-blur-xl', 'bg-white text-text-main p-4 flex justify-between items-center border-b border-border-muted sticky top-0 z-50 shadow-sm'),
    ('hover:text-white', 'hover:text-text-main'),

    # Progress steps
    ('border-slate-700 bg-[#111518]', 'border-border-muted bg-white text-text-muted'),
    ('drop-shadow-[0_0_8px_#0d93f2cc]', 'font-extrabold'),
    ('shadow-[0_0_15px_#0d93f2cc]', ''),

    # Headings
    ('text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight', 'text-2xl sm:text-3xl font-extrabold text-[#003d7a] mb-2 tracking-tight'),
    ('shadow-[0_0_30px_#00000080]', 'shadow-md'),

    # Step 2 Visuals
    ('text-white text-lg block tracking-tight', 'text-text-main text-lg font-extrabold tracking-tight'),
    ('bg-background-muted border border-border-muted hover:border-primary/50 hover:bg-background-muted', 'bg-background-muted border-border-muted hover:border-primary'),
    ('group-hover:text-primary transition-colors', 'group-hover:text-primary transition-colors font-extrabold'),

    # Step 3 Details
    ('bg-primary/20 text-white shadow-sm', 'bg-primary text-white shadow-sm'),
    ('text-text-muted bg-background-muted hover:border-primary/50 hover:text-text-main hover:bg-background-muted', 'text-text-muted bg-white border-border-muted hover:border-primary hover:text-primary'),

    # Description background
    ('shadow-[0_0_10px_#ef444433]', 'shadow-sm'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
