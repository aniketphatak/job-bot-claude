#!/bin/bash
# Create simple placeholder icons using ImageMagick convert
# If not available, will create SVG placeholders instead

for size in 16 48 128; do
  cat > icon${size}.svg << SVGEOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="$((size/8))" fill="url(#grad)"/>
  <text x="50%" y="50%" font-size="$((size/2))" text-anchor="middle" dy="0.3em" fill="white">🤖</text>
</svg>
SVGEOF
done

echo "Icons created successfully"
