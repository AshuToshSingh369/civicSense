# CivicSense

**CivicSense** is a government-grade platform for reporting and tracking civic infrastructure issues in real-time. Citizens can report problems like potholes, water leaks, garbage overflow, or broken streetlights, and municipal authorities can manage, prioritize, and resolve them efficiently.

---

## Features

* 📸 Upload images for reported issues
* 🌍 Automatic GPS-based location tracking
* ⚡ AI-assisted priority detection (High / Medium / Low)
* 🔄 Track issue status and verify resolutions
* 🛠 Role-based access: Citizen, Technician, Admin
* 🎨 Tailwind CSS for responsive and accessible UI
* 🐳 Docker-ready for production deployments
* 💻 TypeScript-based, modern React + React Router full-stack setup

---

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AshuToshSingh369/civicSense.git
cd civicSense
npm install
```

---

### Development

Start the development server with hot module reloading:

```bash
npm run dev
```

Visit your application at: [http://localhost:5173](http://localhost:5173)

---

### Building for Production

Create a production build:

```bash
npm run build
```

---

## Deployment

### Docker Deployment

Build and run using Docker:

```bash
docker build -t civicsense-app .
docker run -p 3000:3000 civicsense-app
```

The container can be deployed to platforms like:

* AWS ECS / Fargate
* Google Cloud Run
* Azure Container Apps
* Digital Ocean App Platform
* Fly.io
* Railway

---

### Manual Deployment

If you prefer deploying Node.js applications without Docker:

1. Build the app with `npm run build`
2. Serve the `build/` folder with a production-ready Node server or static hosting

---

## Project Structure

```text
civicSense/
├── app/                # React app source code
├── public/             # Static assets
├── node_modules/       # Dependencies
├── Dockerfile          # Docker container configuration
├── package.json        # Project metadata & scripts
├── package-lock.json   # Dependency lock file
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

---

## Contributing

We welcome contributions from developers or civic-minded citizens. Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit changes with meaningful messages
4. Submit a pull request

---

## Accessibility & Responsiveness

CivicSense is designed to be usable by all citizens, including senior citizens and non-technical users. Features include:

* Large readable fonts
* High contrast colors
* Mobile-first responsive layout
* Keyboard and screen-reader friendly

---

## Learn More

* Tailwind CSS: [https://tailwindcss.com/](https://tailwindcss.com/)
* React Router: [https://reactrouter.com/](https://reactrouter.com/)

---

Built with ❤️ by AshuToshSingh369
