#!/usr/bin/env bash
# ec2-bootstrap.sh — menyiapkan backend Smart Campus Library di EC2 (Ubuntu 24.04 LTS)
# Bisa dipakai sebagai User Data (jalan sebagai root saat instance pertama kali boot)
# atau dijalankan manual: sudo bash ec2-bootstrap.sh
#
# GANTI nilai di bagian KONFIGURASI sebelum dipakai.

set -euo pipefail

### ===== KONFIGURASI =====
REPO_URL="https://github.com/<username>/<repo>.git"   # GANTI
BRANCH="main"
APP_DIR="/opt/smart-campus-library"
APP_USER="ubuntu"
BACKEND_PORT="8000"
CORS_ORIGIN="*"                       # ganti ke origin frontend setelah deploy
JWT_SECRET="$(openssl rand -hex 32)"  # dibuat acak per-instance; untuk multi-instance, samakan nilainya!
### =======================

log() { echo "[$(date '+%F %T')] $*"; }

log "Update paket & pasang dependensi dasar"
apt-get update -y
apt-get install -y curl git ca-certificates openssl

if ! command -v node >/dev/null 2>&1; then
  log "Memasang Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
log "Node: $(node -v) | npm: $(npm -v)"

log "Mengambil kode dari GitHub"
rm -rf "$APP_DIR"
git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

log "Memasang dependensi backend"
cd "$APP_DIR/backend"
sudo -u "$APP_USER" npm ci --omit=dev || sudo -u "$APP_USER" npm install --omit=dev

log "Menulis file .env"
cat > "$APP_DIR/backend/.env" <<EOF
PORT=$BACKEND_PORT
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=$CORS_ORIGIN
EOF
chown "$APP_USER":"$APP_USER" "$APP_DIR/backend/.env"
chmod 600 "$APP_DIR/backend/.env"

log "Membuat service systemd"
cat > /etc/systemd/system/smartlib-backend.service <<EOF
[Unit]
Description=Smart Campus Library Backend (Express)
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR/backend
EnvironmentFile=$APP_DIR/backend/.env
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=3
KillSignal=SIGTERM
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now smartlib-backend

log "Menunggu backend siap..."
for i in $(seq 1 20); do
  if curl -fs "http://localhost:${BACKEND_PORT}/health" >/dev/null; then
    log "Backend SEHAT: $(curl -s http://localhost:${BACKEND_PORT}/health)"
    exit 0
  fi
  sleep 2
done

log "PERINGATAN: backend belum merespons /health. Cek: journalctl -u smartlib-backend -n 50"
exit 1
