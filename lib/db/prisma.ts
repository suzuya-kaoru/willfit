import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma + MariaDBアダプターのシングルトン管理
 *
 * 設計方針:
 * - 開発・本番ともにシングルトンで接続プールを再利用
 * - 接続プール枯渇を防ぐため、グローバル変数で管理
 * - シンプルさを優先
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function parseDatabaseUrl(): {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
} {
  const rawUrl = process.env.PRISMA_DATABASE_URL;
  if (!rawUrl) {
    throw new Error("PRISMA_DATABASE_URL is not set.");
  }

  const url = new URL(rawUrl);

  return {
    host: url.hostname || "localhost",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    port: url.port ? Number(url.port) : 3306,
  };
}

function createPrismaClient(): PrismaClient {
  const config = parseDatabaseUrl();

  const adapter = new PrismaMariaDb({
    ...config,
    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    idleTimeout: 60000,
    // MySQL 8のcaching_sha2_password認証対応
    allowPublicKeyRetrieval: true,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// シングルトン: 既存インスタンスがあれば再利用、なければ作成
if (!globalThis.__prisma) {
  globalThis.__prisma = createPrismaClient();
}

export const prisma = globalThis.__prisma;
