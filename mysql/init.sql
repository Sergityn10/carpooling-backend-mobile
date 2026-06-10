-- YouConnext - MySQL Init Script
-- Este archivo se ejecuta automáticamente al crear el contenedor MySQL

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS youconnext_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE youconnext_db;

-- Crear tablas iniciales (Prisma las creará, pero esto es por seguridad)
-- Las tablas se crean automáticamente via Prisma migrate

-- Insertar datos de prueba (opcional, descomentar si se necesita)
-- INSERT INTO usuarios (id, dni, nombre, created_at) VALUES
--     (UUID(), '12345678A', 'Usuario Test', NOW());