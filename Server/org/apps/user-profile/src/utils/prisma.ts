let PrismaClient: any;
try {
  // Use the shared generated client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClient = require("../../../../generated/prisma").PrismaClient;
} catch (e) {
  // Fallback to package import
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClient = require("@prisma/client").PrismaClient;
}

const prisma = new PrismaClient();

export default prisma;