import Link from "next/link";
import { GraduationCap, Users, Calendar, FileText, MessageSquare, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Plateforme Profs</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-5xl font-bold leading-tight text-gray-900 sm:text-6xl">
                La plateforme tout-en-un pour vos cours à domicile
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                Gérez votre activité de professeur particulier ou suivez vos cours en toute simplicité.
                Planning, facturation, messagerie : tout est centralisé.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/signup?role=professor"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
                >
                  Je suis professeur
                </Link>
                <Link
                  href="/auth/signup?role=client"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Je suis élève
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-8">
                <div className="grid h-full grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <p className="mt-2 text-sm font-semibold">Planning simplifié</p>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <FileText className="h-8 w-8 text-indigo-600" />
                    <p className="mt-2 text-sm font-semibold">Facturation auto</p>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <p className="mt-2 text-sm font-semibold">Messagerie intégrée</p>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <p className="mt-2 text-sm font-semibold">Suivi d'activité</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Une solution complète pour professionnels et élèves
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Gestion des clients
              </h3>
              <p className="mt-2 text-gray-600">
                Centralisez toutes les informations de vos élèves au même endroit.
                Historique, notes, et suivi personnalisé.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Planning intelligent
              </h3>
              <p className="mt-2 text-gray-600">
                Organisez vos cours facilement. Vue calendrier, notifications automatiques,
                et synchronisation possible.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Facturation simplifiée
              </h3>
              <p className="mt-2 text-gray-600">
                Créez des devis et factures professionnels en quelques clics.
                Exports PDF et suivi des paiements inclus.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Communication fluide
              </h3>
              <p className="mt-2 text-gray-600">
                Messagerie intégrée entre professeurs et élèves.
                Partagez documents et informations en toute sécurité.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Statistiques détaillées
              </h3>
              <p className="mt-2 text-gray-600">
                Suivez votre activité : revenus, nombre de cours, taux d'occupation.
                Tableaux de bord clairs et actionables.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <GraduationCap className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Prestations tierces
              </h3>
              <p className="mt-2 text-gray-600">
                Accédez à un réseau de services complémentaires :
                matériel pédagogique, assurances, et bien plus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Prêt à simplifier votre activité ?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Rejoignez des centaines de professeurs qui font confiance à notre plateforme
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2025 Plateforme Profs. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
