/* eslint-disable */
let prismaInstance: any;

try {
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = global as unknown as { prisma: any };
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
} catch {
  // Prisma client not generated yet (build environment without DB).
  // API routes will return 503 gracefully rather than crashing at build time.
  prismaInstance = new Proxy(
    {},
    {
      get() {
        return new Proxy(
          {},
          {
            get() {
              return () =>
                Promise.reject(
                  new Error("Database not configured. Run `prisma generate` and set DATABASE_URL.")
                );
            },
          }
        );
      },
    }
  );
}
/* eslint-enable */

export const prisma = prismaInstance;
