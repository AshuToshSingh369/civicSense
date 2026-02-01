# 🏔️ CivicSense: Building a Smarter, Closer Nepal

**CivicSense** isn't just another reporting tool—it's a bridge. In many parts of Nepal, the distance between a citizen seeing a broken road and an official fixing it is miles of red tape and missed phone calls. We built CivicSense to close that gap with a single click.

Whether it’s a pothole in Pokhara or a street light out in Kathmandu, this platform turns your phone into a tool for national progress.

---

## 💡 The Vision
We believe that transparency breeds trust. By giving every citizen a **unique Reference ID** and a real-time **Progress Bar**, we’ve removed the guessing game. You don't just "report and hope"; you "report and watch" as your issue moves from a Ward Commissioner's desk to the field technicians.

---

## 🚀 Human-Centric Features

*   **🏡 Jurisdiction-First Design**: Unlike generic apps, CivicSense knows your Ward. When you report an issue, it doesn't go into a global "void"—it goes directly to your local Ward Office.
*   **📊 Transparency Progress Bars**: We’ve implemented a 30-70-100% roadmap. You’ll know when your report has been *Received*, when it’s *In Progress*, and exactly when it's *Resolved*.
*   **📸 Visual Evidence**: A picture is worth a thousand forms. Citizens upload live photos, and authorities use them to triage effectively.
*   **🏢 Command Centre**: A dedicated dashboard for municipal authorities to manage their ward’s tasks, update statuses, and keep their citizens informed.
*   **🔐 Seamless Access**: No redundant codes. Log in with your email, and the system automatically remembers your jurisdiction and role.

---

## 🛠️ The Engine Room (Tech Stack)

We chose technologies that are fast, modern, and reliable:
- **Frontend**: Vite + React + Tailwind CSS (For a blazing fast, "Government Blue" premium feel).
- **Backend / API**: Node.js + Express (Robust and scalable for thousands of reports).
- **Database**: MongoDB (Flexible enough to handle photos, locations, and real-time logs).
- **Security**: JWT-based Authentication (Your data and identity are protected).

---

## 🏁 Getting Started

If you want to run this locally and join the movement, follow these steps:

### 1. Set up the Environment
Create a `.env` file in the `backend/` folder with:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```

### 2. Launch the Platform
```bash
# Install everything
npm install

# Start the heart (Backend)
cd backend && npm run dev

# Start the eyes (Frontend)
cd .. && npm run dev
```

Visit the app at: [http://localhost:5173](http://localhost:5173)

---

## 🤝 Join the Development
This project is for the people, by the people. If you’re a developer who wants to contribute to Nepal’s digital transformation, feel free to fork the repo and send a PR. 

**Current Focus**: We are currently polishing the Real-time Map Visualization and improving AI-based image triage.

---

Built with ❤️ and a vision for a Digital Nepal. 🇳🇵
**Creator**: [AshuToshSingh369](https://github.com/AshuToshSingh369)
