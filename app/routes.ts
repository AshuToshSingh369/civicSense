import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("verify-otp", "routes/verify-otp.tsx"),
    route("report-issue", "routes/report-issue.tsx"),
    route("track-report", "routes/track-report.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
