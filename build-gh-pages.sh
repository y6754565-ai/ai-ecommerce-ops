#!/bin/bash
set -e
mv src/app/api src/app/api.bak 2>/dev/null || true
GITHUB_PAGES=true npm run build
mv src/app/api.bak src/app/api 2>/dev/null || true
