# CivicSense - Municipal Issue Reporting Platform

CivicSense is an enterprise-grade civic issue reporting platform designed to bridge the gap between citizens and municipal authorities. It provides a seamless, real-time communication channel for reporting infrastructure issues, tracking their resolution status, and enabling data-driven decision-making for government bodies.

## System Overview

The platform operates on a three-tier architecture serving distinct user roles:
1.  **Citizens**: Can report issues with geolocation and image evidence, track status in real-time, and view community reports.
2.  **Municipal Authorities**: Access a dedicated dashboard for managing reported issues, updating statuses, and coordinating resolution efforts.
3.  **Administrators**: Oversee system-wide configurations, user management, and department allocations.

## Key Features

-   **Multi-Role Authentication**: Secure access control for Citizens, Authorities, and Administrators using JWT and two-factor verification.
-   **Real-Time Status Tracking**: Instant updates on report progress via WebSocket integration.
-   **Geospatial Reporting**: Accurate location capturing for reported issues to facilitate precise field responses.
-   **Interactive Dashboard**: Kanban-style workflow management for authorities to streamline issue resolution.
-   **Advanced User Interface**: A responsive, accessible design utilizing modern animation libraries for a premium user experience.

## Technology Stack

### Frontend
-   **Framework**: React 18 with TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **Animations**: GSAP (GreenSock) for complex sequences, Framer Motion for component transitions
-   **State Management**: React Context API
-   **Routing**: React Router

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB with Mongoose ODM
-   **Real-Time Communication**: Socket.io
-   **Authentication**: JSON Web Tokens (JWT) and bcryptjs
-   **File Storage**: Multer for image processing

## Installation and Setup

### Prerequisites
-   Node.js (Version 18 or higher)
-   MongoDB (Local instance or Atlas connection string)

### Database Configuration
Ensure a `.env` file is present in the `backend` directory with the following variables:
-   `PORT`
-   `MONGODB_URI`
-   `JWT_SECRET`
-   `JWT_EXPIRE`
-   `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (For OTP services)

### Running the Application

1.  **Backend Initialization**:
    Navigate to the server directory and install dependencies:
    ```bash
    cd backend
    npm install
    npm run dev
    ```

2.  **Frontend Initialization**:
    Navigate to the client directory and start the development server:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Access**:
    The application will be accessible at `http://localhost:5173`.

## Security Measures
-   **Data Encryption**: Passwords are hashed using bcryptjs before storage.
-   **Route Protection**: Middleware ensures strictly typed role-based access control.
-   **Input Validation**: Server-side validation prevents common injection attacks.

## Project Structure
-   `frontend/app`: Contains the React application source code, including components, routes, and contexts.
-   `backend/models`: Mongoose schema definitions for Users and Reports.
-   `backend/controllers`: Business logic for handling API requests.
-   `backend/routes`: API endpoint definitions.

---
*CivicSense is a digital initiative to promote transparency and efficiency in municipal governance.*
