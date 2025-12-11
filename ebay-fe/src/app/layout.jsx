"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import "./globals.scss";
import NextTopLoader from "nextjs-toploader";
import Loading from "@/components/shared/Loading";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideHeaderFooterRoutes = [
    "/login",
    "/login/forgot-password",
    "/login/verify-email",
    "/register",
    "/register/verify-email",
    "/login/google",
    "/checkout",
  ];

  const shouldHideHeaderFooter = hideHeaderFooterRoutes.includes(pathname);

  return (
    <html lang="vi">
      <body>
        {!shouldHideHeaderFooter && <Header />}
        <NextTopLoader />
        <main>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>

        {!shouldHideHeaderFooter && <Footer />}
      </body>
    </html>
  );
}
