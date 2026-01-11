"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

type Plant = { id: string; label: string; state: string; created_at: string };
type Journal = { id: string; content: string; created_at: string };

const MAX_ACTIVE = 2;

export default function GardenPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);

    const plantsRes = await supabase
      .from("plants")
      .select("*")
      .order("created_at", { ascending: false });

    const journalsRes = await supabase
      .from("journals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (plantsRes.error) setError(plantsRes.error.message);
    if (journalsRes.error) setError(journalsRes.error.message);

    setPlants((plantsRes.data as Plant[]) ?? []);
    setJournals((journalsRes.data as Journal[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your garden</h1>
        <Link className="px-3 py-2 rounded-xl bg-green-700 text-white" href="/journal">
          Journal
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-sm text-gray-600">Loading…</p>}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Plants</h2>
        {plants.length === 0 ? (
          <p className="text-sm text-gray-600">No plants yet. That’s okay.</p>
        ) : (
          <div className="grid gap-3">
            {plants.map((p) => {
                const activeCount = plants.filter(pl => pl.state === "active").length;
                const canActivate = p.state !== "active" && activeCount < MAX_ACTIVE;

                async function toggle() {
                    const next =
                    p.state === "active"
                        ? "seed"
                        : canActivate
                        ? "active"
                        : p.state;

                    await supabase
                    .from("plants")
                    .update({ state: next })
                    .eq("id", p.id);

                    load();
                }

                return (
                    <div key={p.id} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <p className="font-medium">{p.label}</p>
                        <span className="text-xs px-2 py-1 rounded-full border">
                        {p.state}
                        </span>
                    </div>

                    <div className="flex gap-3 mt-3">
                        {p.state === "active" ? (
                        <button
                            onClick={toggle}
                            className="text-sm px-3 py-1 rounded-full border"
                        >
                            Let it rest
                        </button>
                        ) : (
                        <button
                            onClick={toggle}
                            disabled={!canActivate}
                            className="text-sm px-3 py-1 rounded-full border disabled:opacity-40"
                        >
                            Tend gently
                        </button>
                        )}
                    </div>

                    {!canActivate && p.state !== "active" && (
                        <p className="text-xs text-gray-500 mt-2">
                        Let's focus on {MAX_ACTIVE} plants at a time
                        </p>
                    )}
                    </div>
                );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Recent journal entries</h2>
        {journals.length === 0 ? (
          <p className="text-sm text-gray-600">No entries yet.</p>
        ) : (
          <div className="grid gap-3">
            {journals.map((j) => (
              <div key={j.id} className="border rounded-xl p-4">
                <p className="text-sm whitespace-pre-wrap">{j.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(j.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
