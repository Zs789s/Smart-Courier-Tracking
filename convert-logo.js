const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgFile = path.join(__dirname, 'horse-logo.svg');
const pngFile = path.join(__dirname, 'horse-logo.png');

// Read SVG file
fs.readFile(svgFile, async (err, data) => {
  if (err) {
    console.error('Error reading SVG:', err);
    process.exit(1);
  }

  try {
    // Convert SVG to PNG with high quality
    await sharp(data)
      .resize(400, 400, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 245 }
      })
      .png({ quality: 95 })
      .toFile(pngFile);

    console.log(`✓ PNG created successfully: ${pngFile}`);
    console.log(`✓ Resolution: 400x400px`);
    console.log(`✓ Quality: 95%`);
    
    // Also create favicon size (64x64)
    const faviconFile = path.join(__dirname, 'horse-logo-favicon.png');
    await sharp(data)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 245 }
      })
      .png({ quality: 95 })
      .toFile(faviconFile);
    
    console.log(`✓ Favicon created: ${faviconFile}`);
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    process.exit(1);
  }
});
