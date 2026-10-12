# Research Publications Manager (Research Milestone)

A small full-stack app for a research group to track its publications. The user adds a paper (title, authors, year, topic, link). It's saved on the server, and the list can be searched by title or author and filtered by topic or year. A summary bar shows counts per topic.

Built as a sample project for the Task Forge capstone (a webapp for a USC mechanical engineering research group).

## Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React 18 + Vite | Component model and hooks (`useState`, `useEffect`); Vite gives fast dev reloads and a simple build |
| Backend | Node + Express | Minimal REST API, same language (JavaScript) on both ends |
| Storage | JSON file | Fine for a prototype; the real project would use a database such as Postgres or SQLite |
| Package manager | npm | `package.json` lists dependencies; `package-lock.json` pins exact versions so teammates get identical installs |

## Run it

Requires Node 18+.

```bash
# terminal 1 – API on http://localhost:3001
cd server
npm install
npm run dev

# terminal 2 – React app on http://localhost:5173
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to Express (see `client/vite.config.js`), so the React code calls `fetch("/api/...")` directly.

## API

| Method | Route | Description |
|---|---|---|
| GET | `/api/publications?q=&topic=&year=` | List publications, filtered server-side, newest first |
| GET | `/api/stats` | Total count and count per topic |
| POST | `/api/publications` | Add one (validates title, authors, year) |
| DELETE | `/api/publications/:id` | Remove one |

## What I learned

- **npm:** `dependencies` vs `devDependencies`, why `package-lock.json` should be committed and `node_modules/` shouldn't, and `npm ci` vs `npm install`
- **React:** lifting state up (`App` owns the list, while `PublicationForm` calls `onAdded` to trigger a refresh), controlled inputs, and re-fetching in `useEffect` when filters change
- **Express:** validating input on the server even when the client validates too, and returning proper status codes (201, 400, 404, 204)
- **Dev setup:** using a Vite proxy to avoid CORS issues during development

## Next steps for the team project

- Replace the JSON file with a real database
- Add authentication so only group members can edit
- Deploy (e.g. Render or Railway for the API, Vercel or Netlify for the frontend)
