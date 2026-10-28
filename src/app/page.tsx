"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type CollectionItem = {
  id: string;
  title: string;
  category: string;
  year: number;
};

export default function Home() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams({
      q: String(form.get("q") ?? ""),
      category: String(form.get("category") ?? "All"),
    });

    setLoading(true);
    setError("");
    setItems([]);
    setSearched(true);

    try {
      const response = await fetch(`/api/collection?${params}`, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Search failed (HTTP ${response.status}). Please retry.`);
      }

      const data = await response.json();
      setItems(data.items);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Could not load the collection. Please retry.",
      );
    } finally {
      setLoading(false);
    }
  }

  const control =
    "w-full rounded-lg border border-slate-500 bg-white px-4 py-3 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-800">
            Independent portfolio project
          </p>
          <h1 className="mt-3 text-4xl font-bold">Collection Explorer</h1>
          <p className="mt-4 text-slate-700">
            Search fictional collection records by title and category.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Demonstration data. Not affiliated with Te Papa.
          </p>
        </header>

        <form
          onSubmit={search}
          className="grid gap-5 rounded-xl border border-slate-300 bg-white p-6 sm:grid-cols-[1fr_200px_auto] sm:items-end"
        >
          <div>
            <label htmlFor="query" className="mb-2 block font-semibold">
              Search collection
            </label>
            <input
              id="query"
              name="q"
              type="search"
              maxLength={100}
              placeholder="Try landscape"
              className={control}
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-2 block font-semibold">
              Category
            </label>
            <select id="category" name="category" className={control}>
              <option>All</option>
              <option>Art</option>
              <option>Natural history</option>
              <option>Photography</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <section aria-labelledby="results-heading" aria-busy={loading} className="mt-10">
          <h2 id="results-heading" className="text-2xl font-bold">
            Collection results
          </h2>

          <p role="status" className="my-4 text-slate-700">
            {loading
              ? "Loading records..."
              : error
                ? "Search failed."
                : searched
                  ? `${items.length} results found.`
                  : "Select Search to view all six records."}
          </p>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-900">
              {error}
            </p>
          )}

          {searched && !loading && !error && items.length === 0 && (
            <p>No matches. Try another search or choose All categories.</p>
          )}

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <article className="h-full rounded-xl border border-slate-300 bg-white p-6">
                  <p className="text-sm font-semibold text-teal-800">
                    {item.category}
                  </p>
                  <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
                  <details className="mt-4">
                    <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">
                      Object details
                    </summary>
                    <dl className="mt-3 grid grid-cols-2 gap-2">
                      <dt>Record ID</dt>
                      <dd>{item.id}</dd>
                      <dt>Year</dt>
                      <dd>{item.year}</dd>
                    </dl>
                  </details>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
