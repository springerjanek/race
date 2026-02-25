"use client";

import { ReactNode, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { useRouter, usePathname } from "next/navigation";

type Props = { children: ReactNode };

const protectedRoutes = ["/races", "/scoreboard", "/faq", "/race/"];

export const AuthProviderWrapper = ({ children }: Props) => {
  return (
    <AuthProvider>
      <InnerWrapper>{children}</InnerWrapper>
    </AuthProvider>
  );
};

const InnerWrapper = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  useEffect(() => {
    if (loading) setLoading(false);

    if (!user && !loading && isProtectedRoute) {
      router.replace("/");
    }

    if (user && pathname === "/") {
      router.replace("/races"); // redirect to a default logged-in page
    }
  }, [user, pathname, router, loading, isProtectedRoute]);

  if ((isProtectedRoute && !user) || loading) return null;

  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
};
