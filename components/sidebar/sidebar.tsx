"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  FileBarChart,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  userRole: "PROFESSOR" | "CLIENT";
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const professorLinks = [
    { href: "/professor/dashboard", label: "Dashboard", icon: Home },
    { href: "/professor/clients", label: "Clients", icon: Users },
    { href: "/professor/courses", label: "Cours", icon: Calendar },
    { href: "/professor/invoices", label: "Factures", icon: FileText },
    { href: "/professor/quotes", label: "Devis", icon: FileBarChart },
    { href: "/professor/messages", label: "Messages", icon: MessageSquare },
  ];

  const clientLinks = [
    { href: "/client/dashboard", label: "Dashboard", icon: Home },
    { href: "/client/courses", label: "Mes Cours", icon: Calendar },
    { href: "/client/invoices", label: "Factures", icon: FileText },
    { href: "/client/messages", label: "Messages", icon: MessageSquare },
  ];

  const links = userRole === "PROFESSOR" ? professorLinks : clientLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6 bg-white">
          <Link href={userRole === "PROFESSOR" ? "/professor/dashboard" : "/client/dashboard"} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Plateforme Profs
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-3 bg-white">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-blue-600 group"
          >
            <Settings className="h-5 w-5 transition-transform group-hover:rotate-45" />
            Paramètres
          </Link>
          <Separator className="my-2" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:shadow-sm"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
