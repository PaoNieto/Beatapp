import Link from "next/link";

const nav = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/dashboard/proyectos", label: "Proyectos", icon: "📋" },
  { href: "/dashboard/clientes", label: "Clientes", icon: "👥" },
  { href: "/dashboard/cotizaciones", label: "Cotizaciones", icon: "💰" },
  { href: "/dashboard/proveedores", label: "Proveedores", icon: "🏭" },
  { href: "/dashboard/reuniones", label: "Reuniones", icon: "📝" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[var(--color-beat-black)] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-display">
            <span className="text-[var(--color-beat-yellow)]">Beat</span>
          </h1>
          <p className="text-xs text-white/60 mt-1">Producciones Beat</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 hover:text-[var(--color-beat-yellow)] transition text-sm"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs text-white/60">
          Sistema interno · v1
        </div>
      </aside>

      <main className="flex-1 bg-[var(--color-beat-gray)]/30 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
