import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Cloudflare Workers only exposes WebSocketPair as a global; Node 20+ defines
 * WebSocket but never this constructor.
 */
function isWorkersRuntime() {
  return typeof (globalThis as { WebSocketPair?: unknown }).WebSocketPair !== "undefined";
}

function localDatabaseUrl() {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  const path = raw.replace(/^file:/, "");
  if (path.startsWith("/")) return `file:${path}`;
  return `file:${process.cwd()}/prisma/${path}`;
}

function createClient(): PrismaClient {
  if (isWorkersRuntime()) {
    const { env } = getCloudflareContext();
    const database = (env as unknown as { DB: ConstructorParameters<typeof PrismaD1>[0] }).DB;
    return new PrismaClient({ adapter: new PrismaD1(database) });
  }

  return new PrismaClient({
    adapter: new PrismaBetterSQLite3({ url: localDatabaseUrl() }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function createLazyClient(): PrismaClient {
  let client: PrismaClient | undefined;

  return new Proxy({} as PrismaClient, {
    get(_target, property) {
      client ??= createClient();
      const value = Reflect.get(client, property, client);
      return typeof value === "function" ? value.bind(client) : value;
    },
    set(_target, property, value) {
      client ??= createClient();
      return Reflect.set(client, property, value, client);
    },
  });
}

// The Cloudflare binding is only reachable inside a request, so the client is
// created on first use instead of at module scope.
export const prisma = globalForPrisma.prisma ?? createLazyClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
