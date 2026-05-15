"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/dashboard/proyectos", label: "Proyectos", icon: "📋" },
  { href: "/dashboard/clientes", label: "Clientes", icon: "👥" },
  { href: "/dashboard/cotizaciones", label: "Cotizaciones", icon: "💰" },
  { href: "/dashboard/proveedores", label: "Proveedores", icon: "🏭" },
  { href: "/dashboard/reuniones", label: "Reuniones", icon: "📝" },
];

const STORAGE_KEY = "beat:sidebar:collapsed";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} shrink-0 bg-[var(--color-beat-black)] text-white flex flex-col transition-[width] duration-200`}
    >
      <div className={`relative ${collapsed ? "p-3 pt-12" : "p-6"} border-b border-white/10`}>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir barra lateral" : "Comprimir barra lateral"}
          title={collapsed ? "Expandir" : "Comprimir"}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-[var(--color-beat-yellow)] transition text-base leading-none"
        >
          {collapsed ? "»" : "«"}
        </button>

        {collapsed ? (
          <h1 className="text-2xl font-display text-center">
            <span className="text-[var(--color-beat-yellow)]">B</span>
          </h1>
        ) : (
          <>
            <h1 className="text-2xl font-display">
              <span className="text-[var(--color-beat-yellow)]">Beat</span>
            </h1>
            <p className="text-xs text-white/60 mt-1">Producciones Beat</p>
          </>
        )}
      </div>

      <nav className={`flex-1 ${collapsed ? "p-2" : "p-4"} space-y-1`}>
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg transition text-sm hover:bg-white/10 hover:text-[var(--color-beat-yellow)] ${active ? "bg-white/10 text-[var(--color-beat-yellow)]" : ""}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-white/10 text-xs text-white/60">
          Sistema interno · v1
        </div>
      )}
    </aside>
  );
}
