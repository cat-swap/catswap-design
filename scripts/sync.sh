#!/usr/bin/env bash
# 从 tokens.json 生成各端 token 文件。语义唯一正本=tokens/tokens.json。
set -euo pipefail
cd "$(dirname "$0")/.."
npx -y tsx scripts/gen.ts
