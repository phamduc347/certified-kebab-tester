#!/bin/bash
echo "--------------------------------------"
echo "🚀 Certified Kebab Tester - Unit Tests"
echo "--------------------------------------"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Try to add common macOS paths if npm is not found
if ! command -v npm &> /dev/null; then
    export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
fi

# Navigate to the tests directory
cd "$SCRIPT_DIR/tests" || { echo "❌ Fehler: Tests-Ordner nicht gefunden."; exit 1; }

# Run the tests
if command -v npm &> /dev/null; then
    npm test
else
    echo ""
    echo "❌ Fehler: 'npm' wurde nicht gefunden."
    echo "Tipp: Öffne dein Terminal neu oder installiere Node.js von https://nodejs.org/"
    echo "Installationspfade geprüft: /usr/local/bin, /opt/homebrew/bin"
    exit 1
fi
