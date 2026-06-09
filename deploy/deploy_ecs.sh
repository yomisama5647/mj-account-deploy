#!/usr/bin/env bash

# Usage:
#   SERVER_IP=your.server.ip SERVER_USER=root REMOTE_DIR=/var/www/mj-account ./deploy/deploy_ecs.sh
#
# Assumptions:
#   1. You have already run: npm run build
#   2. dist/ exists locally.
#   3. SSH access to SERVER_USER@SERVER_IP is configured.

set -euo pipefail

SERVER_IP="${SERVER_IP:-}"
SERVER_USER="${SERVER_USER:-root}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/mj-account}"

if [[ -z "$SERVER_IP" ]]; then
  echo "FAIL SERVER_IP is required."
  echo "Example: SERVER_IP=203.0.113.10 SERVER_USER=root REMOTE_DIR=/var/www/mj-account ./deploy/deploy_ecs.sh"
  exit 1
fi

if [[ ! -d "dist" ]]; then
  echo "FAIL dist/ does not exist. Run npm run build first."
  exit 1
fi

if command -v rsync >/dev/null 2>&1; then
  ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p '${REMOTE_DIR}'"
  rsync -avz --delete dist/ "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/"
else
  tmp_name="mj-account-dist-$(date +%Y%m%d%H%M%S).tar.gz"
  tar -czf "$tmp_name" -C dist .
  ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p '${REMOTE_DIR}'"
  scp "$tmp_name" "${SERVER_USER}@${SERVER_IP}:/tmp/${tmp_name}"
  ssh "${SERVER_USER}@${SERVER_IP}" "tar -xzf '/tmp/${tmp_name}' -C '${REMOTE_DIR}' && rm -f '/tmp/${tmp_name}'"
  rm -f "$tmp_name"
fi

echo "PASS Uploaded dist/ to ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}"
