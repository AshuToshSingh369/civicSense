import os

# auth.complete-profile.tsx
auth_cp = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\auth.complete-profile.tsx"
with open(auth_cp, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("Connectivity anomaly detected. Please try again.", "Something went wrong. Please try again.")
c = c.replace(
    "Complete your registration to access the grid. We need your operational sector to route reports to the correct municipal anomaly neutralization teams.",
    "Almost there! Tell us your location so we can route your reports to the right municipality."
)

with open(auth_cp, "w", encoding="utf-8") as f:
    f.write(c)
print("auth.complete-profile.tsx ✓")

# verify-otp.tsx
otp = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\verify-otp.tsx"
with open(otp, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("Security Protocol", "Verification")
with open(otp, "w", encoding="utf-8") as f:
    f.write(c)
print("verify-otp.tsx ✓")

# track-report.tsx footer
track = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\track-report.tsx"
with open(track, "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("© 2026 CivicSense Protocol", "© 2026 CivicSense Nepal")
with open(track, "w", encoding="utf-8") as f:
    f.write(c)
print("track-report footer ✓")

# terms-of-service.tsx
tos = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\terms-of-service.tsx"
with open(tos, "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("Civic Engagement Protocol • Last Updated: Feb 2026", "Last Updated: February 2026")
with open(tos, "w", encoding="utf-8") as f:
    f.write(c)
print("terms-of-service.tsx ✓")

# privacy-policy.tsx
pp = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\privacy-policy.tsx"
with open(pp, "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("Digital Identity Protection Protocol • Last Updated: Feb 2026", "Last Updated: February 2026")
with open(pp, "w", encoding="utf-8") as f:
    f.write(c)
print("privacy-policy.tsx ✓")
