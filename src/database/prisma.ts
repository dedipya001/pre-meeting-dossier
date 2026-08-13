export async function createPrismaClient() {
  const clientModule = await import("@prisma/client");
  const PrismaClient = (clientModule as unknown as { PrismaClient: new () => unknown }).PrismaClient;
  if (!PrismaClient) {
    throw new Error("PrismaClient is unavailable. Run npm run prisma:generate after configuring DATABASE_URL.");
  }
  return new PrismaClient();
}
