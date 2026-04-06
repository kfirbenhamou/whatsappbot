#!/usr/bin/env bash
# Run this after `npm run auth` to export the session as a base64 string
# ready to paste into a GitHub Actions secret.
#
# Usage:
#   bash scripts/export_session.sh
#
# The base64 string is printed to stdout AND copied to your clipboard (macOS).

set -euo pipefail

SESSION_DIR=".wwebjs_auth"

if [ ! -d "$SESSION_DIR" ]; then
  echo "❌ Session directory '$SESSION_DIR' not found."
  echo "   Run 'npm run auth' first and scan the QR code."
  exit 1
fi

ARCHIVE="session.tar.gz"
tar -czf "$ARCHIVE" "$SESSION_DIR"
B64=$(base64 -i "$ARCHIVE")
rm "$ARCHIVE"

echo ""
echo "✅ Session exported. Copy the string below into the GitHub secret WA_SESSION_B64:"
echo ""
echo "$B64"
echo ""

# Copy to clipboard on macOS
if command -v pbcopy &>/dev/null; then
  echo "$B64" | pbcopy
  echo "📋 Also copied to your clipboard."
fi
