#!/bin/bash

# Script de Despliegue para Producción - LeanMaker Backend
# Optimizado para 3000 estudiantes + 1000 empresas

set -e  # Salir en caso de error

echo "🚀 Iniciando despliegue de LeanMaker Backend para producción..."

# Variables de configuración
PROJECT_NAME="leanmaker"
PROJECT_PATH="/var/www/leanmaker"
VENV_PATH="/var/www/leanmaker/venv"
BACKUP_PATH="/var/backups/leanmaker"
LOG_PATH="/var/log/leanmaker"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar si se ejecuta como root
if [[ $EUID -eq 0 ]]; then
   error "Este script no debe ejecutarse como root"
fi

# Función para crear directorios necesarios
create_directories() {
    log "Creando directorios necesarios..."
    
    sudo mkdir -p $PROJECT_PATH
    sudo mkdir -p $BACKUP_PATH
    sudo mkdir -p $LOG_PATH
    sudo mkdir -p /var/log/nginx
    sudo mkdir -p /var/log/gunicorn
    sudo mkdir -p /var/log/redis
    sudo mkdir -p /etc/ssl/certs
    sudo mkdir -p /etc/ssl/private
    
    # Cambiar permisos
    sudo chown -R $USER:www-data $PROJECT_PATH
    sudo chown -R $USER:www-data $BACKUP_PATH
    sudo chown -R $USER:www-data $LOG_PATH
    sudo chmod -R 755 $PROJECT_PATH
    sudo chmod -R 755 $BACKUP_PATH
    sudo chmod -R 755 $LOG_PATH
}

# Función para instalar dependencias del sistema
install_system_dependencies() {
    log "Instalando dependencias del sistema..."
    
    # Actualizar sistema
    sudo apt update && sudo apt upgrade -y
    
    # Instalar dependencias básicas
    sudo apt install -y \
        python3.12 \
        python3.12-venv \
        python3.12-dev \
        python3-pip \
        nginx \
        redis-server \
        postgresql-client \
        unixodbc-dev \
        curl \
        git \
        htop \
        iotop \
        nethogs \
        fail2ban \
        ufw \
        certbot \
        python3-certbot-nginx \
        supervisor \
        logrotate \
        rsyslog \
        vim \
        wget \
        unzip \
        build-essential \
        libssl-dev \
        libffi-dev \
        libjpeg-dev \
        libpng-dev \
        libfreetype6-dev \
        libxml2-dev \
        libxslt1-dev \
        libpq-dev \
        libmariadb-dev \
        libsqlite3-dev \
        libldap2-dev \
        libsasl2-dev \
        libtiff5-dev \
        libwebp-dev \
        libopenjp2-7-dev \
        libcairo2-dev \
        libpango1.0-dev \
        libgdk-pixbuf2.0-dev \
        libffi-dev \
        libssl-dev \
        libreadline-dev \
        libsqlite3-dev \
        libbz2-dev \
        libncursesw5-dev \
        xz-utils \
        tk-dev \
        libxml2-dev \
        libxmlsec1-dev \
        libffi-dev \
        liblzma-dev \
        libgdbm-dev \
        libnss3-dev \
        libssl-dev \
        libreadline-dev \
        libsqlite3-dev \
        libbz2-dev \
        libncursesw5-dev \
        xz-utils \
        tk-dev \
        libxml2-dev \
        libxmlsec1-dev \
        libffi-dev \
        liblzma-dev \
        libgdbm-dev \
        libnss3-dev
}

# Función para configurar firewall
configure_firewall() {
    log "Configurando firewall..."
    
    # Habilitar UFW
    sudo ufw --force enable
    
    # Configurar reglas básicas
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Permitir SSH
    sudo ufw allow ssh
    
    # Permitir HTTP y HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Permitir puertos específicos para monitoreo
    sudo ufw allow 8080/tcp  # Nginx status
    
    # Denegar acceso a puertos sensibles
    sudo ufw deny 22/tcp  # SSH (si no se usa)
    sudo ufw deny 3306/tcp  # MySQL
    sudo ufw deny 5432/tcp  # PostgreSQL
    sudo ufw deny 6379/tcp  # Redis (solo local)
    
    log "Firewall configurado correctamente"
}

# Función para configurar Redis
configure_redis() {
    log "Configurando Redis..."
    
    # Crear configuración de Redis optimizada
    sudo tee /etc/redis/redis.conf > /dev/null <<EOF
# Configuración de Redis para LeanMaker - Alta Carga
bind 127.0.0.1
port 6379
timeout 0
tcp-keepalive 300
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
notify-keyspace-events ""
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
aof-rewrite-incremental-fsync yes
rdb-save-incremental-fsync yes
EOF

    # Reiniciar Redis
    sudo systemctl restart redis-server
    sudo systemctl enable redis-server
    
    log "Redis configurado correctamente"
}

# Función para configurar Nginx
configure_nginx() {
    log "Configurando Nginx..."
    
    # Copiar configuración de Nginx
    sudo cp $PROJECT_PATH/nginx/nginx.conf /etc/nginx/nginx.conf
    
    # Crear configuración de sitio
    sudo tee /etc/nginx/sites-available/leanmaker > /dev/null <<EOF
server {
    listen 80;
    server_name leanmaker.com www.leanmaker.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name leanmaker.com www.leanmaker.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/leanmaker.crt;
    ssl_certificate_key /etc/ssl/private/leanmaker.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Static Files
    location /static/ {
        alias $PROJECT_PATH/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    location /media/ {
        alias $PROJECT_PATH/media/;
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }
    
    # Health Check
    location /health/ {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # API with Rate Limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Main Application
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOF

    # Habilitar sitio
    sudo ln -sf /etc/nginx/sites-available/leanmaker /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Verificar configuración
    sudo nginx -t
    
    # Reiniciar Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log "Nginx configurado correctamente"
}

# Función para configurar Supervisor
configure_supervisor() {
    log "Configurando Supervisor..."
    
    # Crear configuración de Supervisor para Gunicorn
    sudo tee /etc/supervisor/conf.d/leanmaker.conf > /dev/null <<EOF
[program:leanmaker]
command=$VENV_PATH/bin/gunicorn --config $PROJECT_PATH/gunicorn.conf.py core.wsgi:application
directory=$PROJECT_PATH
user=$USER
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/gunicorn/access.log
stderr_logfile=/var/log/gunicorn/error.log
environment=DJANGO_SETTINGS_MODULE="core.settings",PYTHONPATH="$PROJECT_PATH"
EOF

    # Crear configuración para Celery
    sudo tee /etc/supervisor/conf.d/leanmaker-celery.conf > /dev/null <<EOF
[program:leanmaker-celery]
command=$VENV_PATH/bin/celery -A core worker --loglevel=info --concurrency=4
directory=$PROJECT_PATH
user=$USER
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/leanmaker/celery.log
stderr_logfile=/var/log/leanmaker/celery-error.log
environment=DJANGO_SETTINGS_MODULE="core.settings",PYTHONPATH="$PROJECT_PATH"
EOF

    # Crear configuración para Celery Beat
    sudo tee /etc/supervisor/conf.d/leanmaker-celerybeat.conf > /dev/null <<EOF
[program:leanmaker-celerybeat]
command=$VENV_PATH/bin/celery -A core beat --loglevel=info
directory=$PROJECT_PATH
user=$USER
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/leanmaker/celerybeat.log
stderr_logfile=/var/log/leanmaker/celerybeat-error.log
environment=DJANGO_SETTINGS_MODULE="core.settings",PYTHONPATH="$PROJECT_PATH"
EOF

    # Actualizar Supervisor
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl start leanmaker
    sudo supervisorctl start leanmaker-celery
    sudo supervisorctl start leanmaker-celerybeat
    
    log "Supervisor configurado correctamente"
}

# Función para configurar logrotate
configure_logrotate() {
    log "Configurando logrotate..."
    
    sudo tee /etc/logrotate.d/leanmaker > /dev/null <<EOF
/var/log/leanmaker/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER www-data
    postrotate
        supervisorctl restart leanmaker
    endscript
}

/var/log/gunicorn/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER www-data
    postrotate
        supervisorctl restart leanmaker
    endscript
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

    log "Logrotate configurado correctamente"
}

# Función para configurar monitoreo
configure_monitoring() {
    log "Configurando monitoreo..."
    
    # Instalar herramientas de monitoreo
    sudo apt install -y htop iotop nethogs nload iftop
    
    # Crear script de monitoreo
    sudo tee /usr/local/bin/monitor-leanmaker > /dev/null <<'EOF'
#!/bin/bash
echo "=== LeanMaker System Monitor ==="
echo "Date: $(date)"
echo ""
echo "=== CPU Usage ==="
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
echo ""
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Network Usage ==="
ss -tuln
echo ""
echo "=== Process Count ==="
ps aux | wc -l
echo ""
echo "=== Gunicorn Workers ==="
ps aux | grep gunicorn | grep -v grep | wc -l
echo ""
echo "=== Redis Memory ==="
redis-cli info memory | grep used_memory_human
echo ""
echo "=== Nginx Status ==="
curl -s http://localhost:8080/nginx_status
EOF

    sudo chmod +x /usr/local/bin/monitor-leanmaker
    
    log "Monitoreo configurado correctamente"
}

# Función para crear backup
create_backup() {
    log "Creando backup del sistema..."
    
    BACKUP_FILE="$BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Crear backup de la aplicación
    tar -czf $BACKUP_FILE \
        --exclude='venv' \
        --exclude='*.pyc' \
        --exclude='__pycache__' \
        --exclude='.git' \
        --exclude='logs/*.log' \
        $PROJECT_PATH
    
    # Crear backup de la base de datos (si es posible)
    if command -v pg_dump &> /dev/null; then
        pg_dump $DB_NAME > "$BACKUP_PATH/db-backup-$(date +%Y%m%d-%H%M%S).sql"
    fi
    
    # Limpiar backups antiguos (mantener solo los últimos 7 días)
    find $BACKUP_PATH -name "backup-*.tar.gz" -mtime +7 -delete
    find $BACKUP_PATH -name "db-backup-*.sql" -mtime +7 -delete
    
    log "Backup creado: $BACKUP_FILE"
}

# Función para verificar el despliegue
verify_deployment() {
    log "Verificando despliegue..."
    
    # Verificar servicios
    echo "Verificando servicios..."
    sudo systemctl is-active --quiet nginx && echo "✓ Nginx está activo" || echo "✗ Nginx no está activo"
    sudo systemctl is-active --quiet redis-server && echo "✓ Redis está activo" || echo "✗ Redis no está activo"
    sudo supervisorctl status leanmaker | grep -q RUNNING && echo "✓ Gunicorn está activo" || echo "✗ Gunicorn no está activo"
    
    # Verificar puertos
    echo "Verificando puertos..."
    netstat -tlnp | grep :80 && echo "✓ Puerto 80 abierto" || echo "✗ Puerto 80 cerrado"
    netstat -tlnp | grep :443 && echo "✓ Puerto 443 abierto" || echo "✗ Puerto 443 cerrado"
    netstat -tlnp | grep :8000 && echo "✓ Puerto 8000 abierto" || echo "✗ Puerto 8000 cerrado"
    
    # Verificar conectividad
    echo "Verificando conectividad..."
    curl -s -o /dev/null -w "%{http_code}" http://localhost/health/ | grep -q 200 && echo "✓ Health check OK" || echo "✗ Health check falló"
    
    log "Verificación completada"
}

# Función principal
main() {
    log "Iniciando despliegue completo de LeanMaker Backend..."
    
    # Crear directorios
    create_directories
    
    # Instalar dependencias
    install_system_dependencies
    
    # Configurar firewall
    configure_firewall
    
    # Configurar Redis
    configure_redis
    
    # Configurar Nginx
    configure_nginx
    
    # Configurar Supervisor
    configure_supervisor
    
    # Configurar logrotate
    configure_logrotate
    
    # Configurar monitoreo
    configure_monitoring
    
    # Crear backup
    create_backup
    
    # Verificar despliegue
    verify_deployment
    
    log "🎉 Despliegue completado exitosamente!"
    log "📊 Para monitorear el sistema: monitor-leanmaker"
    log "📝 Logs disponibles en: $LOG_PATH"
    log "💾 Backups en: $BACKUP_PATH"
    log "🌐 Aplicación disponible en: https://leanmaker.com"
}

# Ejecutar función principal
main "$@" 