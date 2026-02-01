import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("verify-otp", "routes/verify-otp.tsx"),
    route("track-report", "routes/track-report.tsx"),

    // Protected Routes
    layout("components/ProtectedRoute.tsx", [
        route("dashboard", "routes/dashboard.tsx"),
        route("report-issue", "routes/report-issue.tsx"),
        route("authority-dashboard", "routes/authority-dashboard.tsx"),
    ]),
] satisfies RouteConfig;
