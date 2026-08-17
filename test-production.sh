#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
npm run lint
npm run build

log_file="/tmp/ikey-vat-production-test.log"
rm -f "$log_file"
NODE_ENV=production PORT=3200 npm run start >"$log_file" 2>&1 &
pid=$!
cleanup() {
  kill "$pid" 2>/dev/null || true
}
trap cleanup EXIT

for attempt in 1 2 3 4 5; do
  if curl --fail --silent http://127.0.0.1:3200/api/health >/dev/null; then
    break
  fi
  sleep 1
done

curl --fail --silent --show-error http://127.0.0.1:3200/api/health >/dev/null

printf '%s\n' '--- HTML FIRST REQUEST ---'
curl -sS -H 'Accept-Encoding: gzip' -o /dev/null -D /tmp/ikey-vat-home-first.headers \
  -w 'http=%{http_code} ttfb=%{time_starttransfer}s total=%{time_total}s bytes=%{size_download}\n' \
  http://127.0.0.1:3200/
grep -Ei '^(cache-control|content-encoding|vary|content-type):' /tmp/ikey-vat-home-first.headers

printf '%s\n' '--- HTML CACHED REQUEST ---'
curl -sS -H 'Accept-Encoding: gzip' -o /dev/null -D /tmp/ikey-vat-home-cached.headers \
  -w 'http=%{http_code} ttfb=%{time_starttransfer}s total=%{time_total}s bytes=%{size_download}\n' \
  http://127.0.0.1:3200/
grep -Ei '^(cache-control|content-encoding|vary|content-type):' /tmp/ikey-vat-home-cached.headers

asset_path="$(grep -Eo '/assets/index-[A-Za-z0-9_-]+\.js' dist/index.html | head -1)"
printf '%s\n' '--- HASHED JAVASCRIPT ASSET ---'
curl -sS -H 'Accept-Encoding: gzip' -o /dev/null -D /tmp/ikey-vat-asset.headers \
  -w 'path=%{url_effective} http=%{http_code} ttfb=%{time_starttransfer}s total=%{time_total}s bytes=%{size_download}\n' \
  "http://127.0.0.1:3200${asset_path}"
grep -Ei '^(cache-control|content-encoding|vary|content-type):' /tmp/ikey-vat-asset.headers
