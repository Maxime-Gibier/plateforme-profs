import { SessionProvider } from "@/components/providers/session-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileSidebar } from "@/components/sidebar/mobile-sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthGuard requiredRole="CLIENT">
        <div className="flex h-screen bg-gray-50">
        {/* Sidebar desktop */}
        <div className="hidden lg:block">
          <Sidebar userRole="CLIENT" />
        </div>

        {/* Mobile sidebar */}
        <MobileSidebar userRole="CLIENT" />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto lg:ml-64">
          {/* Top bar for mobile */}
          <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-4 lg:hidden">
            <div className="ml-12">
              <h2 className="text-lg font-semibold text-gray-900">Plateforme Profs</h2>
            </div>
          </div>

          {/* Page content */}
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      </AuthGuard>
    </SessionProvider>
  );
}
