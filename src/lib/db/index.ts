import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

declare global {
	var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export type JsonArray = Prisma.JsonArray;
export type JsonObject = Prisma.JsonObject;

export { Prisma };
export type { Site, Page } from '@prisma/client';
export type { JsonValue } from '@prisma/client/runtime/library';

export default prisma;
