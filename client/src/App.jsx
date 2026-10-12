import { useEffect, useState } from "react";
import PublicationForm from "./PublicationForm.jsx";

import { TOPICS } from "./topics.js";

export default function App() {
  const [pubs, setPubs] = useState([]);
  const [stats, setStats] = useState({ total: 0, byTopic: {} });
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [year, setYear] = useState("");

  // Re-fetch whenever a filter changes; the server does the filtering.
  async function refresh() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (topic) params.set("topic", topic);
    if (year) params.set("year", year);
    const [pubRes, statRes] = await Promise.all([
      fetch(`/api/publications?${params}`),
      fetch("/api/stats"),
    ]);
    setPubs(await pubRes.json());
    setStats(await statRes.json());
  }

  useEffect(() => {
    refresh();
  }, [search, topic, year]);

  async function handleDelete(id) {
    await fetch(`/api/publications/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <main>
      <header>
        <h1>Research Group Publications</h1>
        <p className="stats">
          {stats.total} publication{stats.total === 1 ? "" : "s"}
          {Object.entries(stats.byTopic).map(([t, n]) => (
            <span key={t} className="chip">{t}: {n}</span>
          ))}
        </p>
      </header>

      <PublicationForm onAdded={refresh} />

      <section className="filters">
        <input
          placeholder="Search title or author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All topics</option>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </section>

      {pubs.length === 0 ? (
        <p className="empty">No publications match.</p>
      ) : (
        <ul className="pubs">
          {pubs.map((p) => (
            <li key={p.id}>
              <div>
                <strong>{p.link ? <a href={p.link} target="_blank" rel="noreferrer">{p.title}</a> : p.title}</strong>
                <div className="meta">{p.authors} · {p.year} · <span className="chip">{p.topic}</span></div>
              </div>
              <button className="delete" onClick={() => handleDelete(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
