#!/bin/bash
# Refactor project structure: Move Java/Spring to backend/ folder

set -e

cd "$(dirname "$0")/.."
ROOT=$(pwd)

echo "=== Refactoring project structure ==="
echo "Root: $ROOT"

# 1. Create backend folder
echo "Creating backend/ folder..."
mkdir -p backend

# 2. Move Java/Spring Boot files to backend/
echo "Moving Java/Spring files to backend/..."
mv src backend/ 2>/dev/null || true
mv build.gradle backend/ 2>/dev/null || true
mv settings.gradle backend/ 2>/dev/null || true
mv gradle backend/ 2>/dev/null || true
mv gradlew.bat backend/ 2>/dev/null || true
mv lombok.config backend/ 2>/dev/null || true
mv bin backend/ 2>/dev/null || true

# Move .gradle cache to backend
mv .gradle backend/ 2>/dev/null || true

# Move build output (can be regenerated)
rm -rf build 2>/dev/null || true

# 3. Move agent docs to docs/agents/
echo "Moving agent docs to docs/agents/..."
mkdir -p docs/agents
mv 00_SHARED_CONTRACT.md docs/agents/ 2>/dev/null || true
mv 01_DATABASE_AGENT.md docs/agents/ 2>/dev/null || true
mv 02_API_AGENT.md docs/agents/ 2>/dev/null || true
mv 03_ORCHESTRATOR.md docs/agents/ 2>/dev/null || true
mv AGENT_SPRING_EXPERT.md docs/agents/ 2>/dev/null || true
mv AGENT_TECH_LEAD.md docs/agents/ 2>/dev/null || true

# 4. Move dev script to scripts/
echo "Moving dev.ps1 to scripts/..."
mv dev.ps1 scripts/ 2>/dev/null || true

# 5. Move tailwind-components to docs (reference material)
echo "Moving tailwind-components to docs/..."
mv tailwind-components docs/ 2>/dev/null || true

# 6. Clean up logs (can be regenerated)
rm -rf logs 2>/dev/null || true

# 7. Clean up agent worktrees if empty
rmdir .agent-worktrees 2>/dev/null || true

echo ""
echo "=== New structure ==="
echo "Root files:"
ls -la "$ROOT" | grep -v "^d" | tail -n +2

echo ""
echo "Root folders:"
ls -d */ 2>/dev/null

echo ""
echo "Backend folder:"
ls backend/ 2>/dev/null || echo "(empty)"

echo ""
echo "=== Done! ==="
echo ""
echo "Next steps:"
echo "1. Update Makefile to reference backend/ paths"
echo "2. Update docker-compose.yml to reference backend/ paths"
echo "3. Update .github/ workflows if needed"
echo "4. Update CLAUDE.md with new structure"
