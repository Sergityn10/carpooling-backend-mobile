#!/bin/bash

# YouConnext - Docker Management Script
# Uso: ./docker.sh [up|down|logs|rebuild|shell]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${GREEN}YouConnext Docker Management${NC}"
    echo ""
    echo "Uso: ./docker.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  up       - Iniciar los contenedores"
    echo "  down     - Detener los contenedores"
    echo "  logs     - Ver logs de los contenedores"
    echo "  rebuild  - Reconstruir y reiniciar"
    echo "  shell    - Abrir terminal en el contenedor backend"
    echo "  status   - Ver estado de los contenedores"
    echo "  reset    - Reiniciar todo (borra datos)"
    echo "  help     - Mostrar esta ayuda"
    echo ""
}

# Función para iniciar
cmd_up() {
    echo -e "${GREEN}🚀 Iniciando YouConnext...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Contenedores iniciados${NC}"
    echo ""
    echo -e "${YELLOW}API disponible en: http://localhost:3000${NC}"
    echo -e "${YELLOW}Health check: http://localhost:3000/api/health${NC}"
}

# Función para detener
cmd_down() {
    echo -e "${YELLOW}⏹️  Deteniendo contenedores...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Contenedores detenidos${NC}"
}

# Función para ver logs
cmd_logs() {
    docker-compose logs -f
}

# Función para reconstruir
cmd_rebuild() {
    echo -e "${GREEN}🔨 Reconstruyendo contenedores...${NC}"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo -e "${GREEN}✅ Reconstrucción completada${NC}"
}

# Función para abrir shell
cmd_shell() {
    echo -e "${GREEN}🐚 Abriendo shell en backend...${NC}"
    docker exec -it youconnext-backend sh
}

# Función para ver estado
cmd_status() {
    docker-compose ps
}

# Función para resetear todo
cmd_reset() {
    echo -e "${RED}⚠️  ¿Estás seguro de que quieres borrar todos los datos?${NC}"
    read -p "Escribe 'yes' para confirmar: " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}🗑️  Reseteando...${NC}"
        docker-compose down -v
        docker-compose up -d
        echo -e "${GREEN}✅ Reseteo completado${NC}"
    else
        echo "Cancelado"
    fi
}

# Main
case "${1:-help}" in
    up)
        cmd_up
        ;;
    down)
        cmd_down
        ;;
    logs)
        cmd_logs
        ;;
    rebuild)
        cmd_rebuild
        ;;
    shell)
        cmd_shell
        ;;
    status)
        cmd_status
        ;;
    reset)
        cmd_reset
        ;;
    help|*)
        show_help
        ;;
esac