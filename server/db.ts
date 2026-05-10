import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// For frontend-only testing, allow running without database
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set - running in frontend-only mode");
}

export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = pool ? drizzle(pool, { schema }) : null;
