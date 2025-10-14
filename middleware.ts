export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/professor/:path*", "/client/:path*", "/api/courses/:path*", "/api/invoices/:path*"],
};
