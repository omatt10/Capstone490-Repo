import { useState } from "react";
import { TOPICS } from "./topics.js";

const EMPTY = { title: "", authors: "", year: "", topic: TOPICS[0], link: "" };

export default function PublicationForm({ onAdded }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  // One change handler for every field, keyed by the input's name attribute
  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/publications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Something went wrong.");
      return;
    }
    setForm(EMPTY);
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Add a publication</h2>
      <input name="title" placeholder="Title" value={form.title} onChange={update} />
      <input name="authors" placeholder="Authors (e.g. Smith, J.; Lee, K.)" value={form.authors} onChange={update} />
      <div className="row">
        <input name="year" type="number" placeholder="Year" value={form.year} onChange={update} />
        <select name="topic" value={form.topic} onChange={update}>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <input name="link" placeholder="Link (optional)" value={form.link} onChange={update} />
      {error && <p className="error">{error}</p>}
      <button type="submit">Add</button>
    </form>
  );
}
