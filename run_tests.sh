#!/usr/bin/env bash

set -e

echo "--------------------------------------"
echo "🚀 Certified Kebab Tester - Unit Tests"
echo "--------------------------------------"

# Resolve repository root from script location.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
TEST_DIR="$SCRIPT_DIR/tests"

if [ ! -d "$TEST_DIR" ]; then
    echo "❌ Fehler: Tests-Ordner nicht gefunden: $TEST_DIR"
    exit 1
fi

# Add common macOS Homebrew/npm paths if needed.
if ! command -v npm >/dev/null 2>&1; then
    export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
fi

NPM_CMD=""
if command -v npm >/dev/null 2>&1; then
    NPM_CMD="npm"
elif command -v npm.cmd >/dev/null 2>&1; then
    # Git Bash on Windows often exposes npm via npm.cmd.
    NPM_CMD="npm.cmd"
fi

if [ -z "$NPM_CMD" ]; then
    echo ""
    echo "❌ Fehler: npm wurde nicht gefunden."
    echo "Tipp: Node.js installieren: https://nodejs.org/"
    echo "Geprüfte Pfade: /usr/local/bin, /opt/homebrew/bin"
    exit 1
fi

cd "$TEST_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 node_modules nicht gefunden. Installiere Abhängigkeiten..."
    "$NPM_CMD" install
    echo "✅ Installation abgeschlossen."
    echo ""
fi

echo "🔄 Synchronisiere Utilities aus script.js..."
node helpers/sync-utils.cjs

# Force a stable, non-TTY reporter so output is visible in all terminals.
"$NPM_CMD" test
