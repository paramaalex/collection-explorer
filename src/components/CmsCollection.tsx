"use client";

import { useState } from "react";

type CmsItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  year: number | null;
};

export default function CmsCollection() {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  async function loadRecords() {
    setLoading(true);
    setError("");
    setItems([]);
    setLoaded(false);

    try {
      const response = await fetch("/api/cms", {
        signal: AbortSignal.timeout(10000),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load CMS records.");
      }

      setItems(data.items);
      setLoaded(true);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Could not load CMS records.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="cms-heading"
      aria-busy={loading}
      className="mt-12 rounded-xl border border-slate-300 bg-white p-6"
    >
      <h2 id="cms-heading" className="text-2xl font-bold">
        CMS collection
      </h2>
      <p className="mt-3 text-slate-700">
        Fictional records edited and published in local Strapi,
        retrieved through GraphQL.
      </p>

      <button
        type="button"
        onClick={loadRecords}
        disabled={loading}
        className="mt-5 rounded-lg bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:opacity-60"
      >
        {loading ? "Loading CMS records..." : "Load CMS records"}
      </button>

      <p role="status" className="mt-4">
        {loading
          ? "Contacting the CMS..."
          : loaded
            ? `${items.length} CMS records loaded.`
            : ""}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-red-900">
          {error} Select Load CMS records to retry.
        </p>
      )}

      {loaded && items.length === 0 && (
        <p className="mt-4">No published CMS records are available.</p>
      )}

      <ul className="mt-5 grid gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <article className="rounded-lg border border-slate-300 p-5">
              <p className="text-sm font-semibold text-teal-800">
                {item.category}
              </p>
              <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-slate-700">{item.description}</p>
              <p className="mt-3">Year: {item.year ?? "Not recorded"}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
