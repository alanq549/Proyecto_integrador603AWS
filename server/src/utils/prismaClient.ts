// src/utils/prismaClient.ts

import { PrismaClient as PrismaLocal } from '../../prisma/generated/local-client';
import { PrismaClient as PrismaAWS } from '../../prisma/generated/aws-client';


const local = new PrismaLocal();
const aws = new PrismaAWS();

const checkConnection = async (client: PrismaLocal | PrismaAWS) => {
  try {
    await client.$connect();
    await client.$disconnect(); // solo testea conexión
    return true;
  } catch (e) {
    return false;
  }
};

async function getPrismaClient() {
  if (process.env.NODE_ENV === 'production') {
    if (await checkConnection(aws)) {
      console.log("✅ Usando Prisma AWS");
      return aws;
    } else if (await checkConnection(local)) {
      console.warn("⚠️ AWS falló, usando Prisma LOCAL");
      return local;
    }
  } else {
    if (await checkConnection(local)) {
      console.log("✅ Usando Prisma LOCAL");
      return local;
    } else if (await checkConnection(aws)) {
      console.warn("⚠️ Local falló, usando Prisma AWS");
      return aws;
    }
  }

  throw new Error("❌ No se pudo conectar ni a la base de datos local ni a la de AWS");
}

export const getPrisma = getPrismaClient;
