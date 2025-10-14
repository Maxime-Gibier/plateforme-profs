"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Il y a un problème avec la configuration du serveur.";
      case "AccessDenied":
        return "Vous n'avez pas l'autorisation d'accéder à cette ressource.";
      case "Verification":
        return "Le lien de vérification a expiré ou a déjà été utilisé.";
      default:
        return "Une erreur est survenue lors de l'authentification.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Erreur d'authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{getErrorMessage(error)}</p>
          <div className="space-y-2">
            <Link href="/auth/signin">
              <Button className="w-full">Retour à la connexion</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
