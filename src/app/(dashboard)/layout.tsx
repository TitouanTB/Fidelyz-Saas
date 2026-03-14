import { getAuthContext } from "@/lib/auth";
export const dynamic = "force-dynamic";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await getAuthContext({ redirectIfNotFound: true });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}