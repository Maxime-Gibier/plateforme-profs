"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      // Récupérer la session pour obtenir le rôle de l'utilisateur
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (session && session.user) {
        // Redirection basée sur le rôle réel de l'utilisateur
        if (session.user.role === "PROFESSOR") {
          router.push("/professor/dashboard");
          router.refresh();
        } else if (session.user.role === "CLIENT") {
          router.push("/client/dashboard");
          router.refresh();
        } else {
          router.push("/");
        }
      } else {
        // Fallback si pas de session
        if (role === "professor") {
          router.push("/professor/dashboard");
        } else if (role === "client") {
          router.push("/client/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (error) {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Plateforme Profs</span>
            </Link>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
              Connexion
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {role === "professor"
                ? "Accédez à votre espace professeur"
                : role === "client"
                ? "Accédez à votre espace élève"
                : "Connectez-vous à votre compte"}
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <div className="mt-2">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="vous@exemple.com"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="mt-2">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full"
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Nouveau sur la plateforme ?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/auth/signup"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image/Gradient */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="flex h-full items-center justify-center p-12">
            <div className="max-w-md text-white">
              <h3 className="text-3xl font-bold">
                Gérez vos cours en toute simplicité
              </h3>
              <p className="mt-4 text-lg text-blue-100">
                Planning, facturation, messagerie : tout est centralisé sur une seule plateforme.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-blue-50">Interface intuitive et moderne</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-blue-50">Sécurisé et confidentiel</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-blue-50">Support client réactif</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
