# YouTube Video AI Agent

An AI-powered workspace for exploring, understanding, and extracting insights from YouTube videos. Seamlessly syncs video playback with timestamped transcripts, supports contextual AI chat, generates interactive visual mind maps, and exports structured PDF summaries.

## Features

- ** Synchronized Video & Transcript**: Real-time YouTube player synchronized with auto-scrolling, timestamped transcripts. Click any transcript line to jump directly to that point in the video.
- ** Context-Aware AI Chatbot**: Chat directly with any video using Groq-accelerated LLMs. The bot dynamically retrieves relevant transcript segments and keyword hits based on your current playback position and query.
- ** Map-Reduce Video Summarization**: Efficiently summarizes long videos by chunking transcripts with LangChain's recursive splitters and synthesizing structured takeaways via concurrent map-reduce passes.
- ** Interactive Visual Mind Maps**: Automatically parses video topics into hierarchical nodes and edges rendered with React Flow and auto-arranged with Dagre. Includes persistent database caching.
- ** Downloadable PDF Summaries**: Generate and download professional PDF summaries and structured notes on demand using `@react-pdf/renderer`.
- ** Persistent Chat Sessions**: Save, rename, and manage chat history across multiple videos, backed by PostgreSQL.
- ** Authentication**: User management and authentication powered by Clerk.
- ** Modern Resizable UI**: Sleek, responsive layout built with Tailwind CSS v4, Lucide icons, and `react-resizable-panels`.

---

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [React Flow](https://reactflow.dev/)
- **API & State**: [tRPC v11](https://trpc.io/), [TanStack Query v5](https://tanstack.com/query)
- **AI & Processing**: [Groq SDK](https://console.groq.com/), [LangChain Text Splitters](https://js.langchain.com/), [Apify Client](https://apify.com/) (`starvibe/youtube-video-transcript`)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/), [Neon PostgreSQL](https://neon.tech/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Exporting & Media**: `@react-pdf/renderer`, `html2pdf.js`, `react-youtube`

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.18+ or v20+)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A PostgreSQL database (e.g., [Neon](https://neon.tech))
- API keys for [Groq](https://console.groq.com/), [Apify](https://apify.com/), and [Clerk](https://clerk.com/)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd youtube-video-ai-agent
npm install
```

### 3. Database Setup

Generate the Prisma client and push the schema to your database:

```bash
# Push schema changes to your database
npm run db:push

# (Optional) Launch Prisma Studio to inspect your database
npm run db:studio
```

### 4. Running the Application

Start the local development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```text
├── prisma/
│   └── schema.prisma              # Database schema (Chat, Message, MindMap, Todos)
├── src/
│   ├── components/
│   │   ├── chatbot UI/            # Chat interface, mind map viewer, PDF export & sidebar
│   │   ├── Landing Page UI/       # Landing page hero, features, and how-it-works sections
│   │   └── ui/                    # Reusable UI primitives (dialogs, tooltips, buttons)
│   ├── integrations/
│   │   └── trpc/                  # tRPC routers (youtube, chat, todos) and client setup
│   ├── lib/
│   │   ├── apify.ts               # Apify YouTube transcript fetcher
│   │   ├── groq.ts                # Groq AI completion client
│   │   └── mapReduce.ts           # Recursive text chunking and map-reduce summarization
│   ├── routes/
│   │   ├── __root.tsx             # Root layout with providers (Clerk, Query, tRPC)
│   │   ├── index.tsx              # Home / landing page
│   │   ├── video/$videoId.tsx     # Main video analysis and AI chat workspace
│   │   └── api.trpc.$.tsx         # tRPC API catch-all handler
│   └── server/
│       └── db.ts                  # Prisma client instance
└── package.json
```

---

## Available Scripts

| Command             | Description                                           |
| :------------------ | :---------------------------------------------------- |
| `npm run dev`       | Starts the Vite development server on port 3000       |
| `npm run build`     | Builds the application for production                 |
| `npm run start`     | Runs the production build with TanStack Start / Nitro |
| `npm run preview`   | Previews the production build locally                 |
| `npm run test`      | Runs tests using Vitest                               |
| `npm run check`     | Formats code with Prettier and runs ESLint auto-fixes |
| `npm run db:push`   | Pushes the Prisma schema to the database              |
| `npm run db:studio` | Opens Prisma Studio to view database records          |

---

## How It Works

1. **Input Video**: Paste any valid YouTube video URL or ID.
2. **Transcript Processing**: The backend queries Apify to fetch the video's timestamped transcript segments.
3. **AI Chat & Retrieval**: When you query the AI, it retrieves transcript segments corresponding to the current playback position and key topics, allowing the LLM to give grounded answers.
4. **Mind Map Generation**: The transcript is summarized and structured into a strict node-edge JSON tree, rendered interactively using React Flow.
5. **PDF Export**: Export structured key takeaways, notes, and full summaries directly into a formatted PDF document.
