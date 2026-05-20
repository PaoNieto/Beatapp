"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Option = { value: string; label: string };

export default function SortSelect({
  options,
  paramName = "sort",
  defaultValue,
}: {
  options: Option[];
  paramName?: string;
  defaultValue: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) || defaultValue;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) params.delete(paramName);
    else params.set(paramName, value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-gray-600">Ordenar por:</span>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:border-[var(--color-beat-yellow)] outline-none text-sm cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
