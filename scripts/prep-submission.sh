#!/bin/bash
# Backward Builder — Submission ZIP Preparation
# Run this from the project root before submitting to app.vibeathon.us

set -e

echo "=== Backward Builder Submission Prep ==="
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/lib/claude.ts" ]; then
  echo "ERROR: Run this from the backward-builder project root"
  exit 1
fi

# Verify no API keys in source
echo "1/6 — Checking for hardcoded API keys..."
if grep -r "sk-ant-" src/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
  echo "ERROR: Found hardcoded API key in source! Fix before submitting."
  exit 1
fi
echo "  PASS: No hardcoded API keys"

# Verify .env.example exists
echo "2/6 — Checking .env.example..."
if [ ! -f ".env.example" ]; then
  echo "ERROR: .env.example is missing!"
  exit 1
fi
echo "  PASS: .env.example exists"

# Verify .env is gitignored
echo "3/6 — Checking .env is gitignored..."
if ! grep -q "^\.env" .gitignore 2>/dev/null; then
  echo "WARNING: .env may not be in .gitignore!"
fi
echo "  PASS: .env in .gitignore"

# Build check
echo "4/6 — Running production build..."
npm run build > /dev/null 2>&1
echo "  PASS: Build succeeded"

# Create ZIP (exclude heavy/sensitive dirs)
ZIP_NAME="backward-builder-submission.zip"
echo "5/6 — Creating ${ZIP_NAME}..."
rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".env" \
  -x ".env.local" \
  -x ".git/*" \
  -x "*.zip" \
  -x ".venv/*" \
  -x "__pycache__/*" \
  > /dev/null 2>&1

# Check size
SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
echo "  Created: ${ZIP_NAME} (${SIZE})"

# Size check (must be under 100MB)
SIZE_BYTES=$(stat -f%z "$ZIP_NAME" 2>/dev/null || stat -c%s "$ZIP_NAME" 2>/dev/null)
if [ "$SIZE_BYTES" -gt 104857600 ]; then
  echo "ERROR: ZIP is over 100MB! Must be under 100MB for submission."
  exit 1
fi
echo "  PASS: Under 100MB"

# Final checklist
echo ""
echo "6/6 — Pre-submission checklist:"
echo "  [ ] Live URL works: https://backwardbuilder.com"
echo "  [ ] Live URL works on mobile (375px)"
echo "  [ ] Demo account works (no auth required)"
echo "  [ ] Seed data present"
echo "  [ ] Video recorded and captioned"
echo "  [ ] Project description ready (docs/submission/BB_PROJECT_DESCRIPTION_v2.md)"
echo ""
echo "=== Ready to submit! ==="
echo "Upload ${ZIP_NAME} and paste the project description at app.vibeathon.us"
echo "Code deadline: March 26, 2026 at 1:00 PM CDT"
echo "Video deadline: March 26, 2026 at 2:00 PM CDT (opens 15 min after code)"
