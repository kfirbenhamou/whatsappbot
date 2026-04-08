#!/usr/bin/env bash
# Run this after `npm run auth` to export the Baileys session as a base64 string
# ready to set as a GitHub Actions secret (WA_SESSION_B64).
#
# Usage:
#   bash scripts/export_session.sh
#
# The base64 string is printed to stdout AND copied to your clipboard (macOS).
# Then run: gh secret set WA_SESSION_B64 < /tmp/wa_session.b64

set -euo pipefail

SESSION_DIR="auth_info_baileys"

if [ ! -d "$SESSION_DIR" ]; then
  echo "❌ Session directory '$SESSION_DIR' not found."
  echo "   Run 'npm run auth' first and scan the QR code."
  exit 1
fi

ARCHIVE="/tmp/wa_session.tar.gz"
tar -czf "$ARCHIVE" "$SESSION_DIR"
base64 -i "$ARCHIVE" > /tmp/wa_session.b64
rm "$ARCHIVE"

echo ""
echo "✅ Session exported to /tmp/wa_session.b64"
echo ""
echo "Set the GitHub secret by running:"
echo "  gh secret set WA_SESSION_B64 --repo kfirbenhamou/whatsappbot < /tmp/wa_session.b64"
echo ""

# Copy to clipboard on macOS
if command -v pbcopy &>/dev/null; then
  cat /tmp/wa_session.b64 | pbcopy
  echo "📋 Also copied to your clipboard."
fi
