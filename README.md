# StreamFlow AI

A real-time, token-by-token streaming AI chat interface built with Next.js and the
Vercel AI SDK. This is the core AI interaction for my FE-06 assignment (Frontend AI
Engineering internship track) — designed to be extended into a full capstone feature.

## Features

- **Live token streaming** — assistant replies render word-by-word as they're generated, not all at once
- **Thinking indicator** — a smooth handoff from a "thinking" state into streamed text, no flicker
- **Stop generation** — cancel a response mid-stream; the partial reply is kept and you can send another message immediately
- **Smart auto-scroll** — pins to the latest message only while you're already at the bottom, and gives you a "Jump to latest" button the moment you scroll up to read something earlier
- **Multi-turn memory** — the assistant remembers earlier messages in the conversation
- **Mobile-friendly** — usable and legible down to phone widths
- **Server-side API key** — the provider key never touches the client

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, Turbopack)
- [Vercel AI SDK](https://ai-sdk.dev) (`ai`, `@ai-sdk/react`)
- AI provider: [Groq](https://groq.com) (swappable — see [Switching providers](#switching-providers))
- Tailwind CSS

## Project Structure

```
├── app/
│   ├── api/chat/route.js   # Server route handler — streams model responses
│   ├── layout.js           # App metadata (title, description)
│   └── page.js             # Renders the Chat component
├── components/
│   └── Chat.jsx            # Client chat UI (streaming, stop button, auto-scroll)
├── lib/
│   └── ai-config.js        # Model name, system prompt, and config in one place
└── .env.local              # API key (never committed)
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set your API key
Create a `.env.local` file in the project root:
```
GROQ_API_KEY=your_key_here
```
Get a free key at [console.groq.com/keys](https://console.groq.com/keys).

> This project currently uses Groq instead of Anthropic's Claude API. The
> architecture (`streamText`, route handler, client hook) is provider-agnostic —
> swapping back to Claude only requires changing the provider package and API key,
> see below.

### 3. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Switching Providers

To use Anthropic's Claude instead of Groq:

1. `npm install @ai-sdk/anthropic`
2. In `app/api/chat/route.js`, replace `createGroq` with `createAnthropic` (from `@ai-sdk/anthropic`)
3. Set `ANTHROPIC_API_KEY` in `.env.local` instead of `GROQ_API_KEY`
4. Update `MODEL_CONFIG.model` in `lib/ai-config.js` to a valid Claude model name

## Configuration

All model behavior lives in `lib/ai-config.js`:

```js
export const MODEL_CONFIG = {
  model: "openai/gpt-oss-120b", // provider's model identifier
  maxTokens: 1000,                  // response length cap
};

export const SYSTEM_PROMPT = `...`; // assistant's persona/instructions
```

Edit this file to change the assistant's behavior without touching the route
handler or UI code.

## Deployment

Deploy on [Vercel](https://vercel.com/new):

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Add your API key (`GROQ_API_KEY` or `ANTHROPIC_API_KEY`) under **Project Settings → Environment Variables**
4. Deploy

The key stays server-side in Vercel's environment — it's never exposed to the browser.

## Learn More

- [Vercel AI SDK docs](https://ai-sdk.dev/docs/introduction)
- [Next.js documentation](https://nextjs.org/docs)