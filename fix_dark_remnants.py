import re


report = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\report-issue.tsx"
with open(report, "r", encoding="utf-8") as f:
    c = f.read()


c = c.replace(">Coordinates<", ">Location<")
c = c.replace(">Visuals<", ">Photo<")
c = c.replace(">Data<", ">Details<")


c = c.replace("bg-gradient-to-t from-background-dark/80 to-transparent", "bg-gradient-to-t from-black/20 to-transparent")
c = c.replace("shadow-[0_0_20px_#00000080]", "shadow-sm")
c = c.replace("font-bold text-white text-lg block tracking-tight group-hover:text-primary transition-colors font-extrabold",
              "font-extrabold text-text-main text-lg block tracking-tight group-hover:text-primary transition-colors")
c = c.replace("text-2xl sm:text-3xl font-extrabold text-[#003d7a] mb-2 tracking-tight", "text-2xl sm:text-3xl font-extrabold text-[#003d7a] mb-2")

with open(report, "w", encoding="utf-8") as f:
    f.write(c)
print("report-issue.tsx step labels ✓")



track = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\track-report.tsx"
with open(track, "r", encoding="utf-8") as f:
    c = f.read()


c = c.replace(
    'className="min-h-screen bg-background-light dark:bg-background-muted font-display text-slate-900 dark:text-text-main flex flex-col md:flex-row relative selection:bg-primary selection:text-white overflow-hidden"',
    'className="min-h-screen bg-background-muted font-sans text-text-main flex flex-col md:flex-row relative selection:bg-primary selection:text-white overflow-hidden"'
)


c = c.replace(
    '''{/* Background Animated Elements */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>''', ''
)


c = c.replace("flex items-center gap-2 text-white font-bold text-xl uppercase tracking-wider hover:text-primary transition-colors group",
              "flex items-center gap-2 text-text-main font-bold text-xl hover:text-primary transition-colors group")


c = c.replace('text-3xl font-bold text-white mb-2 tracking-tight', 'text-3xl font-extrabold text-[#003d7a] mb-2 tracking-tight')


c = c.replace('<h2 className="text-3xl font-bold text-white leading-tight tracking-tight">',
              '<h2 className="text-3xl font-extrabold text-[#003d7a] leading-tight tracking-tight">')


c = c.replace('bg-[#111518] px-2 py-1 rounded border border-border-muted',
              'bg-background-muted px-2 py-1 rounded border border-border-muted')


c = c.replace('hover:text-white transition-colors flex items-center gap-1 font-mono',
              'hover:text-[#003d7a] transition-colors flex items-center gap-1')


c = c.replace("'bg-[#111518] border-border-muted text-text-muted'",
              "'bg-white border-border-muted text-text-muted'")


c = c.replace("event.completed ? 'text-white' : 'text-text-muted'",
              "event.completed ? 'text-[#003d7a]' : 'text-text-muted'")


c = c.replace("transition-colors ${event.completed ? 'text-text-muted' : 'text-text-muted'}",
              "transition-colors text-text-muted")


c = c.replace("bg-white/90 backdrop-blur text-[10px] text-white font-mono px-2 py-1 rounded border border-border-muted uppercase",
              "bg-white text-[10px] text-text-muted font-bold px-2 py-1 rounded border border-border-muted uppercase tracking-wider")


c = c.replace("bg-green-500 shadow-[0_0_10px_#22c55ecc]", "bg-green-500")
c = c.replace("bg-amber-500 shadow-[0_0_10px_#fbbf24cc]", "bg-amber-500")
c = c.replace("bg-primary shadow-[0_0_10px_#0d93f2cc]", "bg-primary")


c = c.replace('font-bold text-white mb-8 flex items-center gap-2 tracking-tight',
              'font-extrabold text-[#003d7a] mb-8 flex items-center gap-2 tracking-tight')


c = c.replace("absolute inset-0 bg-primary/20 z-10 mix-blend-overlay pointer-events-none",
              "absolute inset-0 bg-primary/5 z-10 pointer-events-none")
c = c.replace("absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent z-10",
              "absolute inset-0 bg-gradient-to-t from-[#003d7a]/60 via-[#003d7a]/20 to-transparent z-10")
c = c.replace("drop-shadow-[0_0_15px_#0d93f24d]", "")
c = c.replace("absolute inset-0 bg-grid-pattern opacity-20 z-10 pointer-events-none", "")
c = c.replace("scan-line z-20 opacity-50", "hidden")
c = c.replace("text-5xl font-bold mb-4 tracking-tight", "text-5xl font-extrabold text-white mb-4 tracking-tight")
c = c.replace("text-text-main text-lg max-w-xl font-mono leading-relaxed border-l-2 border-primary/50 pl-4 bg-background-muted backdrop-blur p-4 rounded-r-lg",
              "text-white/90 text-lg max-w-xl leading-relaxed")

with open(track, "w", encoding="utf-8") as f:
    f.write(c)
print("track-report.tsx ✓")



auth = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\authority-dashboard.tsx"
with open(auth, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("border-white/20 text-text-muted bg-white/5", "border-border-muted text-text-muted bg-background-muted")
c = c.replace("flex flex-wrap gap-4 text-text-muted text-sm font-medium", "flex flex-wrap gap-4 text-text-main text-sm font-medium")
c = c.replace('bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-main rounded-xl', 'bg-white hover:bg-background-muted text-text-muted hover:text-text-main rounded-lg')

with open(auth, "w", encoding="utf-8") as f:
    f.write(c)
print("authority-dashboard.tsx dark remnants ✓")



dash = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\dashboard.tsx"
with open(dash, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20", "hidden")
c = c.replace("bg-background-light dark:bg-background-dark/80 to-transparent", "bg-white to-transparent")

with open(dash, "w", encoding="utf-8") as f:
    f.write(c)
print("dashboard.tsx dark remnants ✓")
