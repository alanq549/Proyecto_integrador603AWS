// src/services/syncService.ts
import { PrismaClient as PrismaLocal } from '../../prisma/generated/local-client';
import { PrismaClient as PrismaAWS } from '../../prisma/generated/aws-client';

const local = new PrismaLocal();
const aws = new PrismaAWS();

const PK_MAP: Record<string, string[]> = {
  ordenes_servicios: ["id_orden", "id_servicio"],
  ordenes: ["id_orden"],
  cajones: ["id_cajon"],
  pagos: ["id_pago"],
  servicios: ["id_servicio"],
  tareas: ["id_tarea"],
  usuarios: ["id_usuario"],
  vehiculos: ["id_vehiculo"],
  verificationtokens: ["id"],
};

// Tiempo para sincronizar: últimos 10 minutos
const MINUTOS_SYNC = 10;

async function syncModelo(modelo: string, desde: "local" | "aws") {
  const ahora = new Date();
  const haceXMin = new Date(ahora.getTime() - MINUTOS_SYNC * 60 * 1000);

  const origen = desde === "local" ? local : aws;
  const destino = desde === "local" ? aws : local;

  const registros = await (origen as any)[modelo].findMany({
    where: { updatedAt: { gte: haceXMin } },
  });

  for (const registro of registros) {
    const keys = PK_MAP[modelo];
    if (!keys) {
      console.warn(`No se definieron claves primarias para modelo ${modelo}`);
      continue;
    }

    let where: any;
    if (keys.length === 1) {
      // Clave primaria simple
      where = { [keys[0]]: registro[keys[0]] };
    } else {
      // Clave primaria compuesta: Prisma espera un objeto con nombre unido por guiones bajos
      const compositeKey = keys.join('_'); // ej: "id_orden_id_servicio"
      const compositeWhere: any = {};
      for (const key of keys) {
        compositeWhere[key] = registro[key];
      }
      where = { [compositeKey]: compositeWhere };
    }

    const destinoRegistro = await (destino as any)[modelo].findUnique({ where });

    if (!destinoRegistro) {
      await (destino as any)[modelo].create({ data: registro });
    } else if (new Date(destinoRegistro.updatedAt) < registro.updatedAt) {
      await (destino as any)[modelo].update({ where, data: registro });
    }
  }
}


// Esta es la función que vas a importar en tu cron
export async function syncBidireccional() {
  const modelosPadres = [
    "usuarios",    // primero los usuarios
    "vehiculos",   // después vehículos (depende de usuarios)
    "ordenes",     // después ordenes (depende de vehiculos)
    "servicios",
    "cajones",
    "pagos",
    "tareas",
    "verificationtokens",
  ];

  const modelosHijos = ["ordenes_servicios"];

  // Sincronizar padres en orden correcto
  for (const modelo of modelosPadres) {
    await syncModelo(modelo, "local");
    await syncModelo(modelo, "aws");
  }

  // Luego sincronizar hijos
  for (const modelo of modelosHijos) {
    await syncModelo(modelo, "local");
    await syncModelo(modelo, "aws");
  }
}

export async function syncInicialDesdeAWS() {
  const modelosPadres = [
    "usuarios",
    "vehiculos",
    "ordenes",
    "servicios",
    "cajones",
    "pagos",
    "tareas",
    "verificationtokens",
  ];

  const modelosHijos = ["ordenes_servicios"];

  // Para copiar todos los registros sin filtro de fecha
  for (const modelo of [...modelosPadres, ...modelosHijos]) {
    const registros = await (aws as any)[modelo].findMany();

    for (const registro of registros) {
      const keys = PK_MAP[modelo];
      if (!keys) {
        console.warn(`No se definieron claves primarias para modelo ${modelo}`);
        continue;
      }

      let where: any;
      if (keys.length === 1) {
        where = { [keys[0]]: registro[keys[0]] };
      } else {
        const compositeKey = keys.join('_');
        const compositeWhere: any = {};
        for (const key of keys) {
          compositeWhere[key] = registro[key];
        }
        where = { [compositeKey]: compositeWhere };
      }

      const existe = await (local as any)[modelo].findUnique({ where });

      if (!existe) {
        await (local as any)[modelo].create({ data: registro });
      } else {
        // Si quieres también actualizar registros existentes con datos de AWS, puedes:
        // await (local as any)[modelo].update({ where, data: registro });
      }
    }
  }

  console.log("✅ Sincronización inicial desde AWS a Local completada.");
}
