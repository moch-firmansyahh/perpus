#!/usr/bin/env bash
# healthcheck.sh — script bash sederhana untuk Soal 3 (dijalankan di EC2 Linux)
#
# Fungsi: memantau endpoint /health backend dan mencatat
#   - waktu, HTTP status, response time (latency)
#   - load average, pemakaian memori, pemakaian disk
# Hasil ditulis ke terminal dan ke file log (CSV) untuk bahan analisis.
#
# Pemakaian:
#   chmod +x healthcheck.sh
#   ./healthcheck.sh [URL] [INTERVAL_DETIK] [JUMLAH_SAMPEL]
# Contoh:
#   ./healthcheck.sh http://localhost:8000/health 5 24     # 24 sampel tiap 5 detik

set -u

URL="${1:-http://localhost:8000/health}"
INTERVAL="${2:-5}"
SAMPLES="${3:-12}"
LOG="${LOG:-$HOME/healthcheck.csv}"

[ -f "$LOG" ] || echo "timestamp,http_status,response_ms,load_1m,mem_used_pct,disk_used_pct" > "$LOG"

echo "Memantau $URL setiap ${INTERVAL}s sebanyak ${SAMPLES}x → $LOG"
printf "%-20s %-6s %-12s %-8s %-8s %-8s\n" WAKTU STATUS RESP_MS LOAD1 MEM% DISK%

ok=0; fail=0; total_ms=0

for i in $(seq 1 "$SAMPLES"); do
  ts="$(date '+%F %T')"

  # curl: kode HTTP dan total waktu (detik) → ms
  out="$(curl -s -o /dev/null -m 5 -w '%{http_code} %{time_total}' "$URL" 2>/dev/null)"
  code="${out%% *}"; secs="${out##* }"
  [ -z "$code" ] && code="000"
  ms="$(awk -v s="${secs:-0}" 'BEGIN{printf "%.0f", s*1000}')"

  load="$(cut -d' ' -f1 /proc/loadavg)"
  mem="$(free | awk '/Mem:/ {printf "%.0f", $3/$2*100}')"
  disk="$(df / | awk 'NR==2 {gsub("%","",$5); print $5}')"

  printf "%-20s %-6s %-12s %-8s %-8s %-8s\n" "$ts" "$code" "$ms" "$load" "$mem" "$disk"
  echo "$ts,$code,$ms,$load,$mem,$disk" >> "$LOG"

  if [ "$code" = "200" ]; then ok=$((ok+1)); total_ms=$((total_ms+ms)); else fail=$((fail+1)); fi
  [ "$i" -lt "$SAMPLES" ] && sleep "$INTERVAL"
done

echo "----- RINGKASAN -----"
echo "Sukses : $ok"
echo "Gagal  : $fail"
if [ "$ok" -gt 0 ]; then
  echo "Rata-rata latency (sukses): $((total_ms / ok)) ms"
fi
echo "Uptime server: $(uptime -p)"
echo "Log lengkap  : $LOG"

[ "$fail" -eq 0 ]
