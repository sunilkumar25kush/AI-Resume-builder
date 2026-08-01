# AI Resume Builder & Job Optimization Platform

Production-ready AI resume builder: resume/JD parsing, AI-driven optimization (ATS score, match %, missing skills), resume editor with templates, PDF/DOCX export, and content generators.

## Structure

```
├── client/   # React 18 + Vite + Tailwind + shadcn/ui SPA
└── server/   # Express + Mongoose REST API (clean architecture)
```

## Prerequisites

- Node.js >= 20.19
- MongoDB Atlas (connection string) — optional in dev; server runs degraded without it
- Ollama (default AI provider, local) or Gemini API key

## Setup

1. `npm install` (root — installs client + server workspaces)
2. `cp server/.env.example server/.env` → fill `MONGO_URI`, `JWT_SECRET`, etc.
3. `cp client/.env.example client/.env` → optional overrides
4. `npm run dev` → client on http://localhost:5173, server on http://localhost:5000

## Scripts

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `npm run dev`     | Run client + server (dev mode)  |
| `npm run build`   | Production build of client      |
| `npm run lint`    | ESLint on client                |
| `npm run start`   | Start server (production mode)  |

## AI Providers

Switchable via `AI_PROVIDER` in `server/.env`:
- `ollama` (default) — uses local Ollama at `OLLAMA_URL` with `OLLAMA_MODEL`
- `gemini` — uses `GEMINI_API_KEY`
