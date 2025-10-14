"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({
  children,
  requiredRole
}: {
  children: React.ReactNode;
  requiredRole?: "PROFESSOR" | "CLIENT";
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Attendre le chargement

    if (!session) {
      // Pas de session, rediriger vers la connexion
      router.push("/auth/signin");
      return;
    }

    // Vérifier si le rôle correspond
    if (requiredRole && session.user.role !== requiredRole) {
      // Mauvais rôle, rediriger vers le bon dashboard
      if (session.user.role === "PROFESSOR") {
        router.push("/professor/dashboard");
      } else if (session.user.role === "CLIENT") {
        router.push("/client/dashboard");
      }
    }
  }, [session, status, router, requiredRole]);

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

  if (!session) {
    return null; // Redirection en cours
  }

  return <>{children}</>;
}
