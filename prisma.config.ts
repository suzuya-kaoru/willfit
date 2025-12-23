import { defineConfig, env } from "prisma/config";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env");
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      // Ignore missing .env and rely on injected env vars.
    } else {
      throw error;
    }
  }
}

const shadowDatabaseUrl = process.env.PRISMA_SHADOW_DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("PRISMA_DATABASE_URL"),
    shadowDatabaseUrl,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
});
