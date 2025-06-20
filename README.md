# SeamlessPhotoProject

## Environment Setup

Add the following environment variables to your `.env.local` file:

```bash
# Replicate API for background removal (851-labs/background-remover)
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Other existing environment variables...
# CLERK_SECRET_KEY=your_clerk_secret_key
# DATABASE_URL=your_database_url
# etc...
```

## Background Removal Integration

This project uses the cost-effective [851-labs/background-remover](https://replicate.com/851-labs/background-remover) model from Replicate:

- **Cost**: $0.00052 per run (1923 runs per $1)
- **Speed**: ~3 seconds completion time
- **Hardware**: Nvidia T4 GPU
- **Quality**: High-quality transparent background removal

### Getting Replicate API Token

1. Sign up at [replicate.com](https://replicate.com)
2. Go to your account settings
3. Create an API token
4. Add it to your `.env.local` file as `REPLICATE_API_TOKEN`

## API Endpoints

- `POST /api/remove-background` - Remove background from uploaded images
- `POST /api/enhance-image` - AI-powered image enhancement with prompts

## Development

```bash
npm run dev
```

## Database

```bash
npm run db:push
npm run db:studio
```

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
# SeamlessPhoto
