import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";
config({ path: '.env' });
export default defineConfig({
  schema: "./configs/schema.tsx",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_ZcQR6fMmU1hv@ep-blue-dust-a5jgrpgl-pooler.us-east-2.aws.neon.tech/vidaify-ads-generator?sslmode=require',
  },
});