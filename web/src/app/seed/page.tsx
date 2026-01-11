import { Suspense } from "react";
import SeedClient from "./seedClient";

export default function SeedPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SeedClient />
    </Suspense>
  );
}
