"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SeedPage() {
  const params = useSearchParams();
  const journalId = params.get("journalId");
  const router = useRouter();

  const [journal, setJournal] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!journalId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("journals")
        .select("content")
        .eq("id", journalId)
        .single();

      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setJournal(data.content);
      // Prefill a gentle short label (user can edit)
      setLabel(data.content.split("\n")[0].slice(0, 60));
    }
    load();
  }, [journalId]);

  async function createPlant() {
    setError(null);
    const trimmed = label.trim();
    if (!trimmed) {
      considerSkip();
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("plants").insert({
      label: trimmed,
      state: "seed",
    });
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push("/garden");
  }

  function considerSkip() {
    router.push("/garden");
  }

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Plant a seed?</h1>
        <Link className="text-sm underline" href="/garden">
          Skip
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading…</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-3">
            If there’s a thought in your entry you want to give a place in your garden,
            name it gently. Or skip — either way is okay.
          </p>

          {journal && (
            <div className="border rounded-xl p-4 text-sm whitespace-pre-wrap mb-4">
              {journal}
            </div>
          )}

          <label className="block text-sm font-medium mb-2">Seed label</label>
          <input
            className="w-full border rounded-xl p-3"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Meals feel scary lately"
          />

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex gap-3 mt-4">
            <button
              onClick={createPlant}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-green-700 text-white disabled:opacity-60"
            >
              {saving ? "Planting…" : "Plant seed"}
            </button>

            <button
              onClick={considerSkip}
              className="px-4 py-2 rounded-xl border rounded-xl"
            >
              Not today
            </button>
          </div>
        </>
      )}
    </div>
  );
}
