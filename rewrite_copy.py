import os

# ─── Report Issue Page ───────────────────────────────────────────────────────
report = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\report-issue.tsx"
with open(report, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("Active Contribution", "Submit a Report")
c = c.replace("Deploy Anomaly Report", "Report a Local Issue")
c = c.replace(
    "Your submission directly interfaces with the municipal network. Ensure visual data is high-fidelity and spatial coordinates are exact.",
    "Your report goes straight to your local municipality. The more detail you provide, the quicker it gets resolved."
)
c = c.replace("Valid Evidence", "Good Photo Tips")
c = c.replace(
    "High-resolution imagery of infrastructural defects, sanitation breaches, or utility failures.",
    "Clear photos of potholes, garbage piles, broken streetlights, or leaking pipes work best."
)
c = c.replace("Invalid Submissions", "What to Avoid")
c = c.replace(
    "Interpersonal conflicts, low-fidelity captures, or non-municipal concerns will be filtered.",
    "Personal disputes, blurry photos, or issues outside your municipality will be returned."
)
c = c.replace("Abort Protocol", "← Go Back")
c = c.replace("Report Anomaly", "Report an Issue")
c = c.replace("Abort", "Cancel")
c = c.replace("Establish Coordinates", "Pin the Location")
c = c.replace(
    "Interface with the map to pinpoint the anomaly. Reverse-geocoding protocol will initialize automatically.",
    "Tap the map or let us detect your location automatically."
)
c = c.replace("Extracted Location String", "Detected Location")
c = c.replace("Awaiting coordinate input...", "Waiting for location...")
c = c.replace("Resolving Spatial Data...", "Getting address...")
c = c.replace("Proceed to Visuals", "Next: Add Photo")
c = c.replace("Upload Visual Evidence", "Add a Photo")
c = c.replace("Provide photographic data for verification algorithms.", "A clear photo helps authorities understand and resolve the issue faster.")
c = c.replace("Data Acquired", "Photo Added")
c = c.replace("Click to recalibrate", "Tap to change")
c = c.replace("Initialize Camera", "Take or Upload a Photo")
c = c.replace("or select local file", "tap to browse your files")
c = c.replace("Proceed to Data", "Next: Add Details")
c = c.replace("Finalize Report Data", "Describe the Issue")
c = c.replace("Classify the anomaly for optimal routing.", "Choose a category and describe what you saw.")
c = c.replace("Designation Category", "Category")
c = c.replace("Detailed Observation", "Description")
c = c.replace("Input detailed parameters of the anomaly...", "Tell us what you saw — the more detail, the better.")
c = c.replace("Revise", "← Back")
c = c.replace("Transmitting...", "Submitting...")
c = c.replace("Transmit Report", "Submit Report")

with open(report, "w", encoding="utf-8") as f:
    f.write(c)
print("report-issue.tsx ✓")


# ─── Dashboard Page ───────────────────────────────────────────────────────────
dash = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\dashboard.tsx"
with open(dash, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("Citizen Portal", "My Dashboard")
c = c.replace("Secure Access", "Citizen")
c = c.replace("'s Terminal", "'s Reports")
c = c.replace("Clearance Level:", "Role:")
c = c.replace("Establishing Connection...", "Loading reports...")
c = c.replace("Activity Log", "My Reports")
c = c.replace("Access File", "View Details")
c = c.replace("Initiate Protocol", "File your first report")
c = c.replace("No records found.", "No reports yet.")
c = c.replace("Impact Score", "Impact Score")
c = c.replace("Total Reports", "Total Reports")
c = c.replace("military_tech", "military_tech")

with open(dash, "w", encoding="utf-8") as f:
    f.write(c)
print("dashboard.tsx ✓")


# ─── Authority Dashboard ──────────────────────────────────────────────────────
auth = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\authority-dashboard.tsx"
with open(auth, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("Command Centre", "Authority Dashboard")
c = c.replace("Authority Level Access", "Staff Portal")
c = c.replace("Active Jurisdiction", "Jurisdiction")
c = c.replace("Protocol Active", "Live")
c = c.replace("Node Registry", "Issue Registry")
c = c.replace(
    "Managing infrastructure anomalies and citizen reporting vectors across",
    "Reviewing and managing citizen-reported issues in"
)
c = c.replace("Signal processing established.", "")
c = c.replace("Expand Authority Network", "Add Staff Account")
c = c.replace("Provision Account", "Add Staff Account")
c = c.replace("Expand Authority Network", "Add Staff Account")
c = c.replace("Syncing Registry...", "Loading reports...")
c = c.replace("Active Operation Queue", "Issue Queue")
c = c.replace("Export Registry", "Export")
c = c.replace("Total Load", "Total")
c = c.replace("Pending Scan", "Pending")
c = c.replace("In Operation", "In Progress")
c = c.replace("Neutralized", "Resolved")
c = c.replace("Issue Designation", "Issue Category")
c = c.replace("Engage Team", "Start Work")
c = c.replace("Neutralize Anomaly", "Mark Resolved")
c = c.replace("Task Finalized", "Resolved")
c = c.replace("Municipal Queue Clear", "Queue Empty")
c = c.replace(
    "No active anomalies detected in current jurisdiction frequency. Continuous monitoring active.",
    "No open reports right now. New reports will show up here automatically."
)
c = c.replace("Re-Sync Registry", "Refresh")
c = c.replace("Tactical Map", "Live Map")
c = c.replace("City Focused", "Your area")
c = c.replace("Signal Legend", "Legend")
c = c.replace("Global Read-Only Mode", "View only — chairman account")
c = c.replace("Deep Dive", "View Details")
c = c.replace("GLOBAL OVERSIGHT", "Global View")
c = c.replace("Authorization Password", "Password")
c = c.replace("Full Name", "Full Name")
c = c.replace("Create Identity", "Create Account")

with open(auth, "w", encoding="utf-8") as f:
    f.write(c)
print("authority-dashboard.tsx ✓")


# ─── Track Report Page ────────────────────────────────────────────────────────
track = r"c:\Users\ashut\OneDrive\Desktop\A\civicsense\frontend\app\routes\track-report.tsx"
with open(track, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("Tracking Node", "Track Status")
c = c.replace("Trace Protocol", "Track Your Report")
c = c.replace("Input Reference ID for real-time status.", "Enter your report ID to see the latest status and updates.")
c = c.replace("Reference ID", "Report ID")
c = c.replace("Establishing Connection...", "Looking up report...")
c = c.replace("System Event Log", "Progress Timeline")
c = c.replace("Issue Designation", "Issue")
c = c.replace("Completion Status", "Progress")
c = c.replace("Visual Evidence", "Photo")
c = c.replace("Live Surveillance Feed", "Real-time Updates")
c = c.replace("Real-time Node Tracking", "Track Your Report")
c = c.replace(
    "Monitor the trajectory of anomalous reports. Encrypted data streams directly from municipal field operatives to this interface.",
    "See exactly where your report stands — from submission to resolution."
)
c = c.replace("© 2026 CivicSense Protocol", "© 2026 CivicSense Nepal")
c = c.replace("New Query", "Search Again")
c = c.replace("Return", "← Back")

with open(track, "w", encoding="utf-8") as f:
    f.write(c)
print("track-report.tsx ✓")
