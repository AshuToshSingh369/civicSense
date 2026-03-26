import os
import glob

directories = [
    r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes",
    r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\components"
]

files_to_process = []
for d in directories:
    files_to_process.extend(glob.glob(os.path.join(d, "**/*.tsx"), recursive=True))

replacements = [
    ('bg-[#0b0c10]/60', 'bg-white/80'),
    ('bg-[#0b0c10]', 'bg-background-muted'),
    ('bg-background-dark/80', 'bg-white/90'),
    ('bg-background-dark/50', 'bg-background-muted'),
    ('bg-background-dark', 'bg-background-muted'),
    
    ('text-slate-100', 'text-text-main'),
    ('text-slate-300', 'text-text-main'),
    ('text-slate-400', 'text-text-muted'),
    ('text-slate-500', 'text-text-muted'),
    ('text-slate-600', 'text-text-muted'),
    
    ('text-white placeholder-slate-600', 'text-text-main placeholder-text-muted'),
    ('text-white focus:outline-none', 'text-text-main focus:outline-none'),
    ('text-white hover:bg-white/5', 'text-text-main hover:bg-background-muted'),
    
    ('border-white/10', 'border-border-muted'),
    ('border-white/20', 'border-border-muted'),
    ('border-white/5', 'border-border-muted'),
    
    ('glass-card', 'bg-white border border-border-muted shadow-sm'),
    ('shadow-[0_0_50px_#00000080]', 'shadow-md'),
    ('shadow-[0_0_30px_#0d93f21a]', 'shadow-sm'),
    ('shadow-[0_0_50px_#0d93f21a]', 'shadow-sm'),
    ('shadow-[0_0_20px_#0d93f24d]', 'shadow-sm'),
    ('shadow-[0_0_30px_#0d93f24d]', 'shadow-sm'),
    ('shadow-[inset_0_2px_4px_#00000066]', 'shadow-inner'),
    ('bg-white/5', 'bg-background-muted'),
]

for filepath in files_to_process:
    # Skip dashboard files as they were already handled manually
    if any(x in filepath for x in ["dashboard.tsx", "home.tsx", "login.tsx", "signup.tsx", "verify-otp.tsx", "Navbar.tsx", "Footer.tsx", "app.css"]):
        continue

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements:
        content = content.replace(old, new)
            
    if content != original_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {os.path.basename(filepath)}")
