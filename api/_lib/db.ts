import { PrismaClient } from '@prisma/client';

// Evitar crear múltiples instancias de PrismaClient en desarrollo
declare global {
  var prisma: PrismaClient | undefined;
}

export const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}

export default db;
