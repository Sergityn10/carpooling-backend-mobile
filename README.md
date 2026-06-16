# 🚗 YouConnext Backend

Backend para la aplicación de carpooling YouConnext, desarrollado con Node.js, Express y Prisma ORM.

## 🚀 Inicio Rápido con Docker

### Requisitos
- Docker
- Docker Compose

### 1. Iniciar con Docker

```bash
cd backend

# Copiar variables de entorno (si no existe .env)
cp .env.docker .env

# Iniciar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 2. Verificar que funciona

```bash
# Health check
curl http://localhost:3000/api/health

# Ver estado de contenedores
docker-compose ps
```

### 3. Acceder al servidor
```bash
ssh tu_usuario@tu_ip
ssh sergityn@192.168.0.47
```
### 4. Pasos en el servidor
1. Actualiza la lista de paquetes del sistema:

```bash
sudo apt update && sudo apt upgrade -y
```
2. Descarga e instala Docker automáticamente: Este es el script oficial de Docker que hace todo el trabajo pesado por ti.

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```
3. Dale permisos a tu usuario: Para no tener que escribir sudo cada vez que uses Docker, añade tu usuario al grupo de Docker:
```bash
sudo usermod -aG docker $USER
```

4. Aplica los permisos: Para que el cambio anterior surta efecto sin tener que reiniciar, ejecuta:

```bash
newgrp docker
```
### 5. Detener

```bash
docker-compose down
```

## 🐳 Gestión con Scripts

En Windows:
```powershell
.\docker.ps1 up       # Iniciar
.\docker.ps1 down     # Detener
.\docker.ps1 logs     # Ver logs
.\docker.ps1 rebuild  # Reconstruir
.\docker.ps1 status   # Ver estado
```

En Linux/Mac:
```bash
chmod +x docker.sh
./docker.sh up        # Iniciar
./docker.sh down      # Detener
./docker.sh logs      # Ver logs
./docker.sh rebuild   # Reconstruir
./docker.sh status    # Ver estado
```

## 📊 Base de Datos MySQL

El docker-compose incluye MySQL 8.0 con:
- **Host**: `localhost`
- **Puerto**: `3306`
- **Base de datos**: `youconnext_db`
- **Usuario**: `youconnext`
- **Contraseña**: `youconnext_pass_2024`

### Acceder a MySQL

```bash
# Desde Docker
docker exec -it youconnext-mysql mysql -u youconnext -p

# Con tu cliente favorito
mysql -h localhost -P 3306 -u youconnext -p youconnext_db
```

## 🔧 Desarrollo Local (Sin Docker)

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Aplicar migraciones
npm run prisma:migrate

# Iniciar servidor
npm run dev
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Usuarios
```
POST   /api/usuarios              - Crear usuario
GET    /api/usuarios              - Listar usuarios
GET    /api/usuarios/:id          - Obtener usuario por ID
GET    /api/usuarios/dni/:dni     - Obtener usuario por DNI
PUT    /api/usuarios/:id          - Actualizar usuario
```

### Viajes
```
POST   /api/viajes                - Crear viaje
GET    /api/viajes                - Listar todos los viajes
GET    /api/viajes/activos        - Listar viajes activos
GET    /api/viajes/:id            - Obtener viaje por ID
GET    /api/viajes/qr/:codigo      - Buscar viaje por QR
GET    /api/viajes/historial/:dni  - Historial de viajes de usuario
POST   /api/viajes/unirse         - Unirse a un viaje
PUT    /api/viajes/:id/iniciar     - Iniciar viaje
PUT    /api/viajes/:id/completar   - Completar viaje
PUT    /api/viajes/:id/cancelar    - Cancelar viaje
```

### Ubicaciones GPS
```
POST   /api/ubicaciones                    - Registrar ubicación
POST   /api/ubicaciones/batch              - Registrar múltiples ubicaciones
GET    /api/ubicaciones/viaje/:viajeId     - Obtener ubicaciones del viaje
GET    /api/ubicaciones/viaje/:viajeId/ultima - Última ubicación
GET    /api/ubicaciones/viaje/:viajeId/distancia - Calcular distancia
```

## 🗄️ Modelo de Datos (MySQL)

### usuarios
| Campo      | Tipo         | Descripción         |
| ---------- | ------------ | ------------------- |
| id         | VARCHAR(36)  | UUID único          |
| dni        | VARCHAR(255) | DNI único           |
| nombre     | VARCHAR(255) | Nombre              |
| email      | VARCHAR(255) | Email               |
| telefono   | VARCHAR(255) | Teléfono            |
| created_at | DATETIME     | Fecha creación      |
| updated_at | DATETIME     | Fecha actualización |

### viajes
| Campo                 | Tipo         | Descripción                         |
| --------------------- | ------------ | ----------------------------------- |
| id                    | VARCHAR(36)  | UUID único                          |
| conductor_id          | VARCHAR(36)  | FK conductor                        |
| matricula             | VARCHAR(255) | Matrícula vehículo                  |
| punto_inicial_lat/lng | DOUBLE       | Coordenadas inicio                  |
| punto_final_lat/lng   | DOUBLE       | Coordenadas final                   |
| distancia_km          | DOUBLE       | Distancia recorrida                 |
| codigo_qr             | VARCHAR(255) | Código único QR                     |
| estado                | VARCHAR(255) | pending/activo/completado/cancelado |

### viaje_pasajeros
| Campo       | Tipo        | Descripción    |
| ----------- | ----------- | -------------- |
| id          | VARCHAR(36) | UUID único     |
| viaje_id    | VARCHAR(36) | FK viaje       |
| usuario_id  | VARCHAR(36) | FK usuario     |
| joined_at   | DATETIME    | Cuándo se unió |
| picked_up   | BOOLEAN     | ¿Fue recogido? |
| dropped_off | BOOLEAN     | ¿Fue dejado?   |

### ubicaciones_trayecto
| Campo      | Tipo        | Descripción    |
| ---------- | ----------- | -------------- |
| id         | VARCHAR(36) | UUID único     |
| viaje_id   | VARCHAR(36) | FK viaje       |
| usuario_id | VARCHAR(36) | FK usuario     |
| latitud    | DOUBLE      | Latitud GPS    |
| longitud   | DOUBLE      | Longitud GPS   |
| precision  | DOUBLE      | Precisión GPS  |
| velocidad  | DOUBLE      | Velocidad km/h |
| altitud    | DOUBLE      | Altitud metros |
| timestamp  | DATETIME    | Hora registro  |

## 🔒 Seguridad

- Contenedores corriendo como usuario no-root
- Health checks implementados
- Secrets via variables de entorno
- Red de Docker aislada

## 📁 Estructura

```
backend/
├── docker-compose.yml    # Orquestación Docker
├── Dockerfile            # Imagen del backend
├── .env                  # Variables de entorno
├── .env.docker           # Template para Docker
├── prisma/
│   └── schema.prisma     # Modelos de datos
├── mysql/
│   └── init.sql          # Script inicialización MySQL
├── src/
│   ├── docker-entry.js   # Entry point Docker
│   ├── index.js         # Entry point desarrollo
│   ├── app.js           # Configuración Express
│   ├── controllers/     # Lógica de negocio
│   └── routes/          # Rutas API
├── docker.ps1           # Script gestión (Windows)
└── docker.sh            # Script gestión (Linux/Mac)
```

## 🆘 Troubleshooting

### MySQL no inicia
```bash
# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar MySQL
docker-compose restart mysql
```

### Backend no puede conectar a MySQL
```bash
# Verificar que MySQL está listo
docker exec youconnext-mysql mysqladmin ping -h localhost

# Ver logs del backend
docker-compose logs backend
```

### Reiniciar todo desde cero
```bash
# Borrar volúmenes y recrear
docker-compose down -v
docker-compose up -d
```

## Licencia

MIT © YouConnext