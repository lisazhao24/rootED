"use client";

"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function JournalPage() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSave() {
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Write anything, even one word");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("journals")
      .insert({ content: trimmed })
      .select("id")
      .single();
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/seed?journalId=${data.id}`);
  }

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Write anything</h1>
      <p className="text-sm text-gray-600 mb-4">
        No judgment, no fixing, just a place to put what’s here.
      </p>

      <textarea
        className="w-full h-56 border rounded-xl p-4 focus:outline-none focus:ring"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What’s on your mind today?"
      />

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <button
        onClick={onSave}
        disabled={saving}
        className="mt-4 px-4 py-2 rounded-xl bg-green-700 text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
