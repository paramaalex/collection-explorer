"use client";

import { useState } from "react";

type MuseumRecord = {
  id: string;
  title: string;
  artist: string;
  date: string;
  category: string;
  sourceUrl: string | null;
};

export default function LiveMuseumRecord() {
  const [item, setItem] = useState<MuseumRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadRecord() {
    setLoading(true);
    setError("");
    setItem(null);

    try {
      const response = await fetch("/api/met", {
        signal: AbortSignal.timeout(35000),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load the museum record.");
      }

      setItem(data.item);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Could not load the museum record.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="live-record-heading"
      aria-busy={loading}
      className="mt-12 rounded-xl border border-teal-300 bg-white p-6"
    >
      <h2 id="live-record-heading" className="text-2xl font-bold">
        Live museum record
      </h2>
      <p className="mt-3 text-slate-700">
        A real collection record from The Metropolitan Museum of Art.
        Loaded on request from its external API.
      </p>

      <button
        type="button"
        onClick={loadRecord}
        disabled={loading}
        className="mt-5 rounded-lg bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:opacity-60"
      >
        {loading ? "Loading museum record..." : "Load live museum record"}
      </button>

      <p role="status" className="mt-4">
        {loading ? "Contacting the museum..." : item ? "Museum record loaded." : ""}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-red-900">
          {error} Select Load live museum record to retry.
        </p>
      )}

      {item && (
        <div className="mt-5">
          <h3 className="text-xl font-bold">{item.title}</h3>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt className="font-semibold">Artist</dt>
            <dd>{item.artist}</dd>
            <dt className="font-semibold">Date</dt>
            <dd>{item.date}</dd>
            <dt className="font-semibold">Department</dt>
            <dd>{item.category}</dd>
          </dl>
          {item.sourceUrl?.startsWith("https://www.metmuseum.org/") && (
            <a
              href={item.sourceUrl}
              className="mt-5 inline-block font-semibold text-teal-800 underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              View original record at The Met
            </a>
          )}
        </div>
      )}
    </section>
  );
}
