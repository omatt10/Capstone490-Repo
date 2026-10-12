// Simple REST API for a research group's publication list.
// Data is stored in a JSON file so it survives server restarts.
import express from "express";
import cors from "cors";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = new URL("./publications.json", import.meta.url);

app.use(cors());
app.use(express.json());

async function loadPubs() {
  if (!existsSync(DATA_FILE)) return [];
  return JSON.parse(await readFile(DATA_FILE, "utf8"));
}

async function savePubs(pubs) {
  await writeFile(DATA_FILE, JSON.stringify(pubs, null, 2));
}

// GET /api/publications?q=text&year=2024&topic=Composites
app.get("/api/publications", async (req, res) => {
  const { q = "", year, topic } = req.query;
  const needle = q.toLowerCase();
  let pubs = await loadPubs();

  if (needle) {
    pubs = pubs.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.authors.toLowerCase().includes(needle)
    );
  }
  if (year) pubs = pubs.filter((p) => String(p.year) === String(year));
  if (topic) pubs = pubs.filter((p) => p.topic === topic);

  // newest first: publications are appended on add, so reverse to get LIFO order
  pubs.reverse();
  res.json(pubs);
});

// GET /api/stats -> counts per topic, used for the summary bar
app.get("/api/stats", async (_req, res) => {
  const pubs = await loadPubs();
  const byTopic = {};
  for (const p of pubs) byTopic[p.topic] = (byTopic[p.topic] || 0) + 1;
  res.json({ total: pubs.length, byTopic });
});

app.post("/api/publications", async (req, res) => {
  const { title, authors, year, topic, link } = req.body;
  const y = Number(year);
  const thisYear = new Date().getFullYear();

  // Server-side validation: never trust the client
  if (!title?.trim() || !authors?.trim()) {
    return res.status(400).json({ error: "Title and authors are required." });
  }
  if (!Number.isInteger(y) || y < 1950 || y > thisYear + 1) {
    return res.status(400).json({ error: `Year must be between 1950 and ${thisYear + 1}.` });
  }

  const pub = {
    id: randomUUID(),
    title: title.trim(),
    authors: authors.trim(),
    year: y,
    topic: topic || "Other",
    link: link?.trim() || "",
  };
  const pubs = await loadPubs();
  pubs.push(pub);
  await savePubs(pubs);
  res.status(201).json(pub);
});

app.delete("/api/publications/:id", async (req, res) => {
  const pubs = await loadPubs();
  const remaining = pubs.filter((p) => p.id !== req.params.id);
  if (remaining.length === pubs.length) {
    return res.status(404).json({ error: "Not found" });
  }
  await savePubs(remaining);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
