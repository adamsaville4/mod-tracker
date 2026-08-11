"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ModResult = {
  id: string;
  name: string;
  brand: string | null;
  mod_categories: { name: string } | null;
};

export function ModTypeahead({
  vehicleModelId,
  onSelect,
}: {
  vehicleModelId: string;
  onSelect: (mod: { id: string; name: string; brand: string | null }) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ModResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      // Brand and name are separate columns (e.g. brand "Milltek Sport",
      // name "Cat-Back Exhaust") — search both, since users naturally
      // search by brand as often as by part name.
      const term = query.trim().replace(/[,()]/g, "");
      // !inner turns mod_fitment into a filterable inner join, restricting
      // results to mods that actually fit this vehicle's model.
      const { data } = await supabase
        .from("mods")
        .select("id, name, brand, mod_categories(name), mod_fitment!inner(vehicle_model_id)")
        .eq("mod_fitment.vehicle_model_id", vehicleModelId)
        .or(`name.ilike.%${term}%,brand.ilike.%${term}%`)
        .order("name")
        .limit(10);

      setResults((data as unknown as ModResult[]) ?? []);
      setOpen(true);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, vehicleModelId]);

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor="mod-search" className="text-sm font-medium">
        Mod
      </label>
      <input
        id="mod-search"
        type="text"
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          if (value.trim().length < 2) {
            setResults([]);
            setOpen(false);
          }
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search the catalogue…"
        autoComplete="off"
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      {open && (
        <ul className="absolute top-full z-10 mt-1 w-full rounded border border-zinc-300 bg-white shadow-sm">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-500">No matches.</li>
          ) : (
            results.map((mod) => (
              <li key={mod.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(mod);
                    setQuery("");
                    setResults([]);
                    setOpen(false);
                  }}
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-zinc-50"
                >
                  <span className="font-medium">
                    {mod.brand ? `${mod.brand} ` : ""}
                    {mod.name}
                  </span>
                  {mod.mod_categories?.name && (
                    <span className="text-xs text-zinc-500">
                      {mod.mod_categories.name}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
