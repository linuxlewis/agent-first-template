#!/usr/bin/env bash
# Boot an isolated app instance for the current git worktree.
#
# Usage: pnpm worktree:boot
#
# Each worktree gets its own:
# - Database (via Docker Compose with unique project name)
# - App server on a unique port
# - Observability stack (Pino logs to stdout)
#
# This enables agents to work on multiple tasks in parallel
# without interference.

set -euo pipefail

WORKTREE_NAME=$(basename "$(git rev-parse --show-toplevel)")
PROJECT_NAME="aft-${WORKTREE_NAME}"

echo "🚀 Booting isolated instance for worktree: ${WORKTREE_NAME}"
echo "   Project name: ${PROJECT_NAME}"

# Start database
if [ -f docker-compose.yml ]; then
  docker compose -p "${PROJECT_NAME}" up -d db 2>/dev/null || echo "⚠️  Docker not available, skipping DB"
fi

# Install deps if needed
if [ ! -d node_modules ]; then
  pnpm install --frozen-lockfile
fi

echo "✅ Worktree ready. Run 'pnpm dev' to start the app."
