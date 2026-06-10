-- YouConnext - MySQL Schema
-- Generado desde Prisma Schema
-- Ejecutar: mysql -u root -p youconnext_db < schema.sql

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` VARCHAR(36) NOT NULL,
    `dni` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `apellidos` VARCHAR(255),
    `email` VARCHAR(255),
    `telefono` VARCHAR(255),
    `foto_perfil` VARCHAR(255),
    `fecha_nacimiento` DATETIME,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `usuarios_dni_key` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: viajes
CREATE TABLE IF NOT EXISTS `viajes` (
    `id` VARCHAR(36) NOT NULL,
    `conductor_id` VARCHAR(36) NOT NULL,
    `matricula` VARCHAR(255) NOT NULL,
    `modelo_vehiculo` VARCHAR(255),
    `color_vehiculo` VARCHAR(255),
    `punto_inicial_lat` DOUBLE NOT NULL,
    `punto_inicial_lng` DOUBLE NOT NULL,
    `punto_inicial_direccion` VARCHAR(255),
    `punto_inicial_nombre` VARCHAR(255),
    `punto_final_lat` DOUBLE NOT NULL,
    `punto_final_lng` DOUBLE NOT NULL,
    `punto_final_direccion` VARCHAR(255),
    `punto_final_nombre` VARCHAR(255),
    `distancia_km` DOUBLE,
    `duracion_minutos` INT,
    `estado` VARCHAR(255) NOT NULL DEFAULT 'pendiente',
    `codigo_qr` VARCHAR(255) NOT NULL,
    `fecha_inicio` DATETIME,
    `fecha_fin` DATETIME,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `viajes_codigo_qr_key` (`codigo_qr`),
    INDEX `viajes_conductor_id_idx` (`conductor_id`),
    INDEX `viajes_estado_idx` (`estado`),
    INDEX `viajes_codigo_qr_idx` (`codigo_qr`),
    CONSTRAINT `viajes_conductor_id_fkey` FOREIGN KEY (`conductor_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: viaje_pasajeros
CREATE TABLE IF NOT EXISTS `viaje_pasajeros` (
    `id` VARCHAR(36) NOT NULL,
    `viaje_id` VARCHAR(36) NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `picked_up` BOOLEAN NOT NULL DEFAULT false,
    `dropped_off` BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `viaje_pasajeros_viaje_id_usuario_id_key` (`viaje_id`, `usuario_id`),
    INDEX `viaje_pasajeros_viaje_id_idx` (`viaje_id`),
    INDEX `viaje_pasajeros_usuario_id_idx` (`usuario_id`),
    CONSTRAINT `viaje_pasajeros_viaje_id_fkey` FOREIGN KEY (`viaje_id`) REFERENCES `viajes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `viaje_pasajeros_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: ubicaciones_trayecto
CREATE TABLE IF NOT EXISTS `ubicaciones_trayecto` (
    `id` VARCHAR(36) NOT NULL,
    `viaje_id` VARCHAR(36) NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `latitud` DOUBLE NOT NULL,
    `longitud` DOUBLE NOT NULL,
    `precision` DOUBLE,
    `velocidad` DOUBLE,
    `altitud` DOUBLE,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `ubicaciones_trayecto_viaje_id_timestamp_idx` (`viaje_id`, `timestamp`),
    INDEX `ubicaciones_trayecto_viaje_id_idx` (`viaje_id`),
    INDEX `ubicaciones_trayecto_usuario_id_idx` (`usuario_id`),
    CONSTRAINT `ubicaciones_trayecto_viaje_id_fkey` FOREIGN KEY (`viaje_id`) REFERENCES `viajes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ubicaciones_trayecto_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;