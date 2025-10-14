"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // L'utilisateur est connecté, rediriger vers son dashboard
      if (session.user.role === "PROFESSOR") {
        router.push("/professor/dashboard");
      } else if (session.user.role === "CLIENT") {
        router.push("/client/dashboard");
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, ne pas afficher le contenu (redirection en cours)
  if (session) {
    return null;
  }

  return <>{children}</>;
}
