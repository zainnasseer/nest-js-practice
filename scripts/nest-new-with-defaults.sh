#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <project-name> [nest-new-args...]"
  exit 1
fi

NEST_CMD="${NEST_CMD:-nest}"
if ! command -v "$NEST_CMD" >/dev/null 2>&1; then
  echo "Nest CLI not found. Install @nestjs/cli or set NEST_CMD."
  exit 1
fi

project="$1"
shift

"$NEST_CMD" new "$project" "$@"
node "$(dirname "$0")/apply-nest-defaults.mjs" "$project"
