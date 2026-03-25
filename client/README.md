# Kroolla Dashboard Client

Next.js client MVP for submitting a video URL, tracking transcription jobs, and viewing transcripts.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set your Supabase and worker values:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WORKER_API_URL`
   - `WORKER_API_KEY` (optional)

## Run

```bash
npm install
npm run dev
```

## Routes

- `/submit` - submit a URL and create a transcription job
- `/jobs/:id` - poll and display job status
- `/transcripts/:jobId` - view transcript full text and segments

## API

- `POST /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/jobs/:id/transcript`

## Test and quality checks

```bash
npm run lint
npm run test
npm run build
```

## Manual E2E checklist

- Submit valid URL -> job created and redirected to `/jobs/:id`
- Status transitions visible: `queued/processing/completed/failed`
- Completed job opens `/transcripts/:jobId`
- Failed job shows an error message

## Deploy (Vercel)

1. Import the `client` project into Vercel.
2. Add environment variables from `.env.example`.
3. Run deploy using default Next.js build settings.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
