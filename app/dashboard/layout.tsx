import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[var(--color-beat-gray)]/30 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
