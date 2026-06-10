# YouConnext - Docker Management Script (Windows)
# Uso: .\docker.ps1 [comando]

param(
    [Parameter(Position=0)]
    [ValidateSet('up', 'down', 'logs', 'rebuild', 'shell', 'status', 'reset', 'help')]
    [string]$Command = 'help'
)

# Función para mostrar ayuda
function Show-Help {
    Write-Host ""
    Write-Host "YouConnext Docker Management" -ForegroundColor Green
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  up       - Iniciar los contenedores"
    Write-Host "  down     - Detener los contenedores"
    Write-Host "  logs     - Ver logs de los contenedores"
    Write-Host "  rebuild  - Reconstruir y reiniciar"
    Write-Host "  shell    - Abrir terminal en el contenedor backend"
    Write-Host "  status   - Ver estado de los contenedores"
    Write-Host "  reset    - Reiniciar todo (borra datos)"
    Write-Host "  help     - Mostrar esta ayuda"
    Write-Host ""
}

# Función para iniciar
function Start-Containers {
    Write-Host "Iniciando YouConnext..." -ForegroundColor Green
    docker-compose up -d
    Write-Host "Contenedores iniciados" -ForegroundColor Green
    Write-Host ""
    Write-Host "API disponible en: http://localhost:3000" -ForegroundColor Yellow
    Write-Host "Health check: http://localhost:3000/api/health" -ForegroundColor Yellow
}

# Función para detener
function Stop-Containers {
    Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "Contenedores detenidos" -ForegroundColor Green
}

# Función para ver logs
function Show-Logs {
    docker-compose logs -f
}

# Función para reconstruir
function Rebuild-Containers {
    Write-Host "Reconstruyendo contenedores..." -ForegroundColor Green
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Write-Host "Reconstrucción completada" -ForegroundColor Green
}

# Función para abrir shell
function Open-Shell {
    Write-Host "Abriendo shell en backend..." -ForegroundColor Green
    docker exec -it youconnext-backend powershell
}

# Función para ver estado
function Show-Status {
    docker-compose ps
}

# Función para resetear todo
function Reset-All {
    Write-Host "ADVERTENCIA: Esto borrará todos los datos!" -ForegroundColor Red
    $confirm = Read-Host "Escribe 'yes' para confirmar"
    if ($confirm -eq 'yes') {
        Write-Host "Reseteando..." -ForegroundColor Yellow
        docker-compose down -v
        docker-compose up -d
        Write-Host "Reseteo completado" -ForegroundColor Green
    } else {
        Write-Host "Cancelado"
    }
}

# Ejecutar comando
switch ($Command) {
    'up' { Start-Containers }
    'down' { Stop-Containers }
    'logs' { Show-Logs }
    'rebuild' { Rebuild-Containers }
    'shell' { Open-Shell }
    'status' { Show-Status }
    'reset' { Reset-All }
    'help' { Show-Help }
}