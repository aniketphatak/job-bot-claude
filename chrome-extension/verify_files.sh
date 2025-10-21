#!/bin/bash
echo "Verifying all files referenced in manifest.json..."
echo ""

files=(
  "popup.html"
  "background.js"
  "icons/icon16.png"
  "icons/icon48.png"
  "icons/icon128.png"
  "content-scripts/common.js"
  "content-scripts/linkedin.js"
  "content-scripts/indeed.js"
  "styles/content.css"
)

all_good=true

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ MISSING: $file"
    all_good=false
  fi
done

echo ""
if [ "$all_good" = true ]; then
  echo "✅ All required files exist!"
  exit 0
else
  echo "❌ Some files are missing!"
  exit 1
fi
