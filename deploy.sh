#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$APP_DIR"

echo "--- Cập nhật mã nguồn ---"
git pull --ff-only origin main

echo "--- Cài đặt phụ thuộc và kiểm tra kiểu ---"
npm ci --no-audit --no-fund
npm run lint

echo "--- Build bản production ---"
npm run build

echo "--- Khởi chạy bản production qua PM2 ---"
pm2 startOrReload ecosystem.config.cjs --only ikey-vat --update-env
pm2 save

echo "--- Kiểm tra sức khỏe ứng dụng ---"
for attempt in 1 2 3 4 5; do
  if curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null; then
    echo "Deploy hoàn tất: ứng dụng đang phản hồi trên cổng 3000."
    exit 0
  fi
  sleep 1
done

echo "Triển khai thất bại: ứng dụng không phản hồi health check." >&2
exit 1
