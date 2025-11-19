#!/usr/bin/env python3
"""
Simple icon generator for Resume AutoFill Chrome Extension
Creates PNG icons without external dependencies
"""

def create_png_icon(size, filename):
    """Create a simple PNG icon using pure Python"""
    import struct
    
    # Create a simple gradient purple icon with white "R"
    pixels = []
    
    for y in range(size):
        for x in range(size):
            # Create purple gradient
            r = int(102 + (118 - 102) * (x / size))
            g = int(126 + (75 - 126) * (x / size))
            b = int(234 + (162 - 234) * (x / size))
            
            # Draw a simple "R" letter in white
            if is_letter_r(x, y, size):
                r, g, b = 255, 255, 255
            
            pixels.append((r, g, b))
    
    # Create PNG file
    def create_png(width, height, pixels, filename):
        import zlib
        
        def chunk(type, data):
            return (struct.pack('>I', len(data)) + type + data + 
                    struct.pack('>I', zlib.crc32(type + data) & 0xffffffff))
        
        raw_data = b''.join(b'\x00' + bytes(pixels[y * width:(y + 1) * width])
                            for y in range(height))
        compressed = zlib.compress(raw_data, 9)
        
        # PNG signature
        png = b'\x89PNG\r\n\x1a\n'
        # IHDR chunk
        png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
        # IDAT chunk
        png += chunk(b'IDAT', compressed)
        # IEND chunk
        png += chunk(b'IEND', b'')
        
        with open(filename, 'wb') as f:
            f.write(png)
    
    # Flatten RGB tuples to bytes
    flat_pixels = []
    for r, g, b in pixels:
        flat_pixels.extend([r, g, b])
    
    create_png(size, size, flat_pixels, filename)

def is_letter_r(x, y, size):
    """Determine if pixel should be part of letter 'R'"""
    # Scale coordinates to 0-1 range
    nx = x / size
    ny = y / size
    
    # Center the letter
    margin = 0.3
    if nx < margin or nx > (1 - margin) or ny < margin or ny > (1 - margin):
        return False
    
    # Normalize to letter space
    lx = (nx - margin) / (1 - 2 * margin)
    ly = (ny - margin) / (1 - 2 * margin)
    
    # Draw "R" shape
    # Vertical line on left
    if lx < 0.25:
        return True
    
    # Top horizontal
    if ly < 0.2 and lx < 0.75:
        return True
    
    # Middle horizontal
    if 0.4 < ly < 0.5 and lx < 0.75:
        return True
    
    # Top right vertical
    if 0.65 < lx < 0.75 and ly < 0.5:
        return True
    
    # Diagonal leg
    if ly > 0.5 and lx > 0.3 and abs((lx - 0.3) / 0.45 - (ly - 0.5) / 0.5) < 0.15:
        return True
    
    return False

def main():
    """Generate all required icon sizes"""
    import os
    
    print("Generating Resume AutoFill extension icons...")
    
    sizes = [
        (16, 'icon16.png'),
        (48, 'icon48.png'),
        (128, 'icon128.png')
    ]
    
    for size, filename in sizes:
        print(f"Creating {filename} ({size}x{size})...")
        create_png_icon(size, filename)
    
    print("\n✅ All icons created successfully!")
    print("Icons are ready to use with the Chrome extension.")

if __name__ == '__main__':
    main()

