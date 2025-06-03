-- CreateTable
CREATE TABLE `cajones` (
    `id_cajon` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `ubicacion` VARCHAR(191) NULL,
    `capacidad` VARCHAR(191) NULL,

    PRIMARY KEY (`id_cajon`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ordenes_servicios` (
    `id_orden` INTEGER NOT NULL,
    `id_servicio` INTEGER NOT NULL,

    PRIMARY KEY (`id_orden`, `id_servicio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ordenes` (
    `id_orden` INTEGER NOT NULL AUTO_INCREMENT,
    `id_vehiculo` INTEGER NOT NULL,
    `id_cajon` INTEGER NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_fin` DATETIME(3) NULL,
    `estado` ENUM('pendiente', 'confirmado', 'en_progreso', 'completado', 'cancelado') NULL DEFAULT 'pendiente',
    `notas` VARCHAR(191) NULL,

    INDEX `ordenes_id_cajon_idx`(`id_cajon`),
    INDEX `ordenes_id_vehiculo_idx`(`id_vehiculo`),
    PRIMARY KEY (`id_orden`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagos` (
    `id_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `id_orden` INTEGER NOT NULL,
    `monto` DECIMAL(65, 30) NOT NULL,
    `metodo` ENUM('efectivo', 'tarjeta', 'transferencia') NULL,
    `estado` ENUM('pendiente', 'completado', 'reembolsado', 'fallido') NULL DEFAULT 'pendiente',
    `fecha_pago` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pagos_id_orden_idx`(`id_orden`),
    PRIMARY KEY (`id_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios` (
    `id_servicio` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` ENUM('lavado', 'estacionamiento') NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `precio` DECIMAL(65, 30) NOT NULL,
    `duracion_estimada` INTEGER NULL,
    `activo` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id_servicio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tareas` (
    `id_tarea` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `id_asignado` INTEGER NOT NULL,
    `fecha_limite` DATETIME(3) NULL,
    `estado` ENUM('pendiente', 'en_progreso', 'completado') NULL DEFAULT 'pendiente',
    `prioridad` ENUM('baja', 'media', 'alta') NULL DEFAULT 'media',

    INDEX `tareas_id_asignado_idx`(`id_asignado`),
    PRIMARY KEY (`id_tarea`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NULL,
    `apellido_paterno` VARCHAR(191) NULL,
    `apellido_materno` VARCHAR(191) NULL,
    `rol` ENUM('cliente', 'admin') NULL DEFAULT 'cliente',
    `fecha_creacion` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehiculos` (
    `id_vehiculo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `anio` INTEGER NULL,
    `placa` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,

    UNIQUE INDEX `vehiculos_placa_key`(`placa`),
    INDEX `vehiculos_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_vehiculo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verificationtokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `newEmail` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `verificationtokens_token_key`(`token`),
    INDEX `verificationtokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ordenes_servicios` ADD CONSTRAINT `ordenes_servicios_id_orden_fkey` FOREIGN KEY (`id_orden`) REFERENCES `ordenes`(`id_orden`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_servicios` ADD CONSTRAINT `ordenes_servicios_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicios`(`id_servicio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes` ADD CONSTRAINT `ordenes_id_vehiculo_fkey` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos`(`id_vehiculo`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ordenes` ADD CONSTRAINT `ordenes_id_cajon_fkey` FOREIGN KEY (`id_cajon`) REFERENCES `cajones`(`id_cajon`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_id_orden_fkey` FOREIGN KEY (`id_orden`) REFERENCES `ordenes`(`id_orden`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tareas` ADD CONSTRAINT `tareas_id_asignado_fkey` FOREIGN KEY (`id_asignado`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `vehiculos` ADD CONSTRAINT `vehiculos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `verificationtokens` ADD CONSTRAINT `verificationtokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE RESTRICT;
