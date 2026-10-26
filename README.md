# Explain It Sideways

**Same concept. Different perspective.**

Explain It Sideways helps college students understand technical and academic concepts through distinct explanation styles — with enough depth for assignments, interviews, and exams.

## Problem

Engineering concepts are often taught once, fast, in notation-heavy language. When the first explanation does not click, students need **another angle**: analogy, humor, diagrams, or exam structure.

## Target users

College students studying computer science, software engineering, mathematics, and related engineering disciplines.

## Features

- Topic + subject + **learning depth** + **four explanation modes**
- **Exam Mode** with **2-mark**, **5-mark**, and **10-mark** answer lengths
- Sample topic chips plus **Surprise me** (populate the topic and subject)
- Copy the full explanation as structured Markdown, including Mermaid source
- **Still confused? Explain it simpler** — new model request, same context
- Responsive, themed Mermaid diagrams with zoom, SVG export, and a safe source fallback (`securityLevel: strict`)
- Server-side Gemma 4 via `@google/genai`

video link:- https://youtu.be/4osLIkxqwno

### Learning depth

| Depth | Behavior |
|-------|----------|
| **Quick Refresher** | Essential idea + concise example; concise notes |
| **Foundational** | Prerequisites, terminology, core concept |
| **Intermediate** | Default — how and why, with practical detail |
| **Advanced** | Mechanisms, edge cases, trade-offs |
| **In-Depth / Research-Oriented** | Comprehensive structure, limitations, alternatives |

### Modes

| Mode | Output |
|------|--------|
| **Everyday Analogy** | Definition, analogy, mapping, technical tie-in |
| **Meme Mode** | Humorous scenario + correct technical meaning |
| **Visual Thinking** | Mermaid diagram (when helpful) + walkthrough |
| **Exam Mode** | Structured answer sized to 2 / 5 / 10 marks |

## Architecture

```
client/ (React + Vite)  --proxy /api-->  server/ (Express)
                                              |
                                              v
                                    Gemini API (Gemma 4)
```

API keys stay on the server only.

## Stack

- **Frontend:** React, Vite, Mermaid, Lucide React
- **Backend:** Node.js, Express, dotenv, `@google/genai`
- **Model default:** `gemma-4-26b-a4b-it` (override with `GEMMA_MODEL`)

## Prerequisites

- Node.js 18+
- npm
- [Google AI Studio](https://aistudio.google.com/apikey) API key with Gemma 4 access

## Installation

```bash
cd D:\HackDay
npm install
npm install --prefix server
npm install --prefix client
```

## Configuration

```bash
copy server\.env.example server\.env
```

Edit `server/.env`:

```env
GEMINI_API_KEY=your_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
PORT=3001
```

Never commit `server/.env` or expose the key in `VITE_*` variables.

## Run

Development (client + server):

```bash
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:3001/api/health  

Production build:

```bash
npm run build
npm start
```

Serves the built client from Express on `PORT`.

## API

### `GET /api/health`

Returns `apiKeyConfigured` and `model`.

### `POST /api/explain`

Body:

```json
{
  "topic": "Deadlock and resource allocation",
  "subject": "Operating Systems",
  "learningDepth": "intermediate",
  "mode": "analogy",
  "answerLength": "5-mark",
  "simplify": false,
  "previousExplanation": ""
}
```

- `learningDepth`: `quick-refresher` | `foundational` | `intermediate` | `advanced` | `in-depth`
- `mode`: `analogy` | `meme` | `visual` | `exam`
- `answerLength`: required for `exam` mode only (`2-mark` | `5-mark` | `10-mark`)

## Demo walkthrough

1. Open the app — confirm tagline and two-column workspace.
2. Click **Deadlock and resource allocation** → **Everyday Analogy** → **Explain**.
3. Copy the result; try **Still confused? Explain it simpler**.
4. Switch to **Exam Mode**, pick **2-mark** vs **10-mark**, and compare structure.
5. Try **Visual Thinking** on **TCP vs UDP**.

## Privacy & security

- API key is read only from `server/.env`.
- Not logged, not sent to the browser, not stored in git.

## Known limitations

- JSON parsing depends on the model following instructions; retries may help.
- Invalid Mermaid shows source fallback.
- Exam answers are study aids, not official marking schemes.
- No auth or database in this MVP.

## Manual checks

```bash
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/explain -H "Content-Type: application/json" -d "{\"topic\":\"\"}"
npm run build --prefix client
```

Live Gemma calls require a configured `GEMINI_API_KEY`.
