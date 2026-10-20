#!/usr/bin/env bash
# ==============================================================================
# Manjunatha Towing Service — Hostinger Deploy Script
# Domain: https://manjunathatowingservice.in
# ==============================================================================
set -euo pipefail

SERVER="u887832393@46.28.45.124"
PORT="65002"
REMOTE="/home/u887832393/domains/manjunathatowingservice.in/public_html"
SSHPASS_BIN="/Users/karthik/bin/bin/sshpass"
PASS="${HOSTINGER_PASS:-APEX@010725.host}"

echo "=============================================================="
echo "  Deploying Manjunatha Towing Service to Hostinger"
echo "  Target: $SERVER:$REMOTE"
echo "=============================================================="

if [ -f "$SSHPASS_BIN" ]; then
  SSHPASS="$PASS" "$SSHPASS_BIN" -e ssh -p "$PORT" -o StrictHostKeyChecking=accept-new "$SERVER" "cd $REMOTE && git fetch origin main && git reset --hard origin/main"
else
  ssh -p "$PORT" -o StrictHostKeyChecking=accept-new "$SERVER" "cd $REMOTE && git fetch origin main && git reset --hard origin/main"
fi

echo ""
echo "✅ Deployment successful! Latest commit is live on Hostinger."
