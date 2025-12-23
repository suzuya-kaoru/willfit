import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function getDatabaseUrl(): string {
  const url = process.env.PRISMA_DATABASE_URL;
  if (!url) {
    throw new Error("PRISMA_DATABASE_URL is not set.");
  }
  return url;
}

function buildMariaDbConfig() {
  const url = new URL(getDatabaseUrl());
  const host = url.hostname;
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = url.pathname.replace(/^\//, "");
  const port = url.port ? Number(url.port) : undefined;

  if (!host) {
    throw new Error("Database host is not set.");
  }
  if (!user) {
    throw new Error("Database user is not set.");
  }
  if (!database) {
    throw new Error("Database name is not set.");
  }
  if (url.port && Number.isNaN(port)) {
    throw new Error("Database port is invalid.");
  }

  return {
    host,
    user,
    password,
    database,
    port,
  };
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaMariaDb(buildMariaDbConfig());
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export { prisma };
