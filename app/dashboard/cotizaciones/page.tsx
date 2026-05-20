import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import SortSelect from "@/components/sort-select";

type SortKey = "recientes" | "antiguas" | "az" | "za";
type TabKey = "beat" | "recibidos";

const SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes primero" },
  { value: "antiguas", label: "Más antiguas primero" },
  { value: "az", label: "Alfabético (A → Z)" },
  { value: "za", label: "Alfabético (Z → A)" },
];

function applySort(query: any, sort: SortKey) {
  switch (sort) {
    case "antiguas": return query.order("created_at", { ascending: true });
    case "az": return query.order("nombre", { ascending: true });
    case "za": return query.order("nombre", { ascending: false });
    case "recientes":
    default: return query.order("created_at", { ascending: false });
  }
}

const SELECT_NUEVO = "id, nombre, descripcion, created_at, tipo";
const SELECT_VIEJO = "id, nombre, descripcion, created_at";

async function fetchBuckets(supabase: any, sort: SortKey): Promise<any[]> {
  let resp = await applySort(supabase.from("cotizaciones").select(SELECT_NUEVO), sort);
  if (resp.error && /tipo/.test(resp.error.message)) {
    resp = await applySort(supabase.from("cotizaciones").select(SELECT_VIEJO), sort);
  }
  return resp.data ?? [];
}

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tab?: string }>;
}) {
  const sp = await searchParams;
  const sort: SortKey = (["recientes","antiguas","az","za"] as const).includes(sp.sort as SortKey)
    ? (sp.sort as SortKey) : "recientes";
  const tab: TabKey = sp.tab === "recibidos" ? "recibidos" : "beat";

  const supabase = await createClient();
  const allBuckets = await fetchBuckets(supabase, sort);

  // Beat tab: tipo='beat' + tipo NULL (carpetas viejas sin tipo) por compat.
  // Recibidos: solo tipo='recibidos'.
  const filtered = allBuckets.filter((b: any) =>
    tab === "beat" ? (b.tipo === "beat" || b.tipo == null) : b.tipo === "recibidos"
  );
  const countBeat = allBuckets.filter((b: any) => b.tipo === "beat" || b.tipo == null).length;
  const countRecibidos = allBuckets.filter((b: any) => b.tipo === "recibidos").length;

  const ids = filtered.map((b: any) => b.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: archs } = await supabase
      .from("archivos").select("entidad_id")
      .eq("entidad_tipo", "cotizacion").in("entidad_id", ids);
    (archs ?? []).forEach((a: any) => {
      counts.set(a.entidad_id, (counts.get(a.entidad_id) || 0) + 1);
    });
  }

  const nuevoHref = `/dashboard/cotizaciones/nuevo?tipo=${tab}`;
  const sortQS = sp.sort ? `&sort=${sort}` : "";

  return (
    <div className="max-w-7xl">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl">Cotizaciones</h1>
          <p className="text-sm text-gray-600 mt-1">Carpetas personalizadas con archivos adentro</p>
        </div>
        <Link href={nuevoHref}
          className="px-5 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition">
          + Nueva carpeta
        </Link>
      </header>

      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        <TabLink
          href={`/dashboard/cotizaciones?tab=beat${sortQS}`}
          active={tab === "beat"}
          label="Beat"
          sublabel="Propias / emitidas"
          count={countBeat}
        />
        <TabLink
          href={`/dashboard/cotizaciones?tab=recibidos${sortQS}`}
          active={tab === "recibidos"}
          label="Recibidos"
          sublabel="De proveedores"
          count={countRecibidos}
        />
      </div>

      {filtered.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <SortSelect options={SORT_OPTIONS} defaultValue="recientes" />
          <span className="text-xs text-gray-500">
            {filtered.length} carpeta{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
          {tab === "beat"
            ? "No hay carpetas de Beat todavía."
            : "No hay carpetas de cotizaciones recibidas todavía."}{" "}
          <Link href={nuevoHref} className="text-[var(--color-beat-yellow-hover)] hover:underline">
            Crear la primera
          </Link>.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b: any) => (
            <Link
              key={b.id}
              href={`/dashboard/cotizaciones/${b.id}`}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition border-l-4 border-[var(--color-beat-yellow)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg">{b.nombre}</h3>
                <span className="text-xs bg-[var(--color-beat-yellow)]/20 px-2 py-1 rounded shrink-0">
                  {counts.get(b.id) || 0} archivos
                </span>
              </div>
              {b.descripcion && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{b.descripcion}</p>}
              <p className="text-xs text-gray-400 mt-2">Creada {formatDate(b.created_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TabLink({
  href, active, label, sublabel, count,
}: {
  href: string; active: boolean; label: string; sublabel: string; count: number;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-3 -mb-px border-b-2 transition flex items-baseline gap-2 ${
        active
          ? "border-[var(--color-beat-yellow)] text-[var(--color-beat-black)]"
          : "border-transparent text-gray-500 hover:text-[var(--color-beat-black)] hover:border-gray-300"
      }`}
    >
      <span className="font-semibold">{label}</span>
      <span className="text-xs text-gray-500">{sublabel}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        active ? "bg-[var(--color-beat-yellow)]/30" : "bg-gray-100"
      }`}>{count}</span>
    </Link>
  );
}
