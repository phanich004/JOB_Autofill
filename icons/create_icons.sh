#!/bin/bash

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "Creating icons with ImageMagick..."
    convert -size 16x16 xc:"#667eea" -pointsize 12 -fill white -gravity center -annotate +0+0 "R" icon16.png
    convert -size 48x48 xc:"#667eea" -pointsize 36 -fill white -gravity center -annotate +0+0 "R" icon48.png
    convert -size 128x128 xc:"#667eea" -pointsize 96 -fill white -gravity center -annotate +0+0 "R" icon128.png
    echo "Icons created successfully!"
else
    echo "ImageMagick not found. Creating placeholder HTML files..."
    echo "You can use an online tool to create proper icons:"
    echo "1. Visit https://favicon.io/favicon-generator/"
    echo "2. Create icons with sizes: 16x16, 48x48, and 128x128"
    echo "3. Save them as icon16.png, icon48.png, and icon128.png in the icons/ directory"
fi
