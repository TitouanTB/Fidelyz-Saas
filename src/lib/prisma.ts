import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

// Lazy initialization using Proxy
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma.prisma) {
      try {
        globalForPrisma.prisma = prismaClientSingleton();
      } catch (error) {
        console.error("Failed to initialize Prisma Client:", error);
        // Throw a clearer error if accessed during build without config
        throw new Error(
          "Prisma Client accessed before initialization. " +
          "If this happened during 'next build', ensure the route is marked as 'force-dynamic'."
        );
      }
    }
    return (globalForPrisma.prisma as any)[prop];
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = globalForPrisma.prisma;
