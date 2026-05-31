#!/bin/bash
echo "--- Bắt đầu Deploy ---"
git pull origin main
npm install
npm run build
pm2 restart ikey-vat
echo "--- Hoàn tất! Website đã cập nhật ---"