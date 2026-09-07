import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assistant/:path*",
    "/forecast/:path*",
    "/alerts/:path*",
    "/advisories/:path*",
    "/climate/:path*",
    "/locations/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/maps/:path*",
    "/disaster/:path*",
    "/agriculture/:path*",
    "/route-planner/:path*",
    "/incidents/:path*",
    "/authority/:path*",
  ],
};
