const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgFile = path.join(__dirname, 'logo.svg');
const pngFile = path.join(__dirname, 'logo.png');

// Read SVG file
fs.readFile(svgFile, async (err, data) => {
  if (err) {
    console.error('Error reading SVG:', err);
    process.exit(1);
  }

  try {
    // Convert SVG to PNG with high quality
    await sharp(data)
      .resize(400, 120, {
        fit: 'contain',
        background: { r: 248, g: 248, b: 248 }
      })
      .png({ quality: 95 })
      .toFile(pngFile);

    console.log(`✓ Logo PNG created: ${pngFile}`);
    console.log(`✓ Resolution: 400x120px`);
    
    // Also create smaller header size (200x60)
    const headerFile = path.join(__dirname, 'logo-header.png');
    await sharp(data)
      .resize(200, 60, {
        fit: 'contain',
        background: { r: 248, g: 248, b: 248 }
      })
      .png({ quality: 95 })
      .toFile(headerFile);
    
    console.log(`✓ Header logo created: ${headerFile}`);
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    process.exit(1);
  }
});
