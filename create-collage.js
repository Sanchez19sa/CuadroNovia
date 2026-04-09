const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configuration
const CELL_SIZE = 600;       // Each photo cell in pixels
const GAP = 24;              // Gap between photos
const PADDING = 80;          // White padding around the grid
const BORDER = 40;           // Black frame border
const GRID = 3;              // 3x3 grid
const GRAYSCALE = true;      // B&W filter like the reference

// Photo order in the grid (1-9):
// 1  2  3
// 4  5  6
// 7  8  9
const PHOTO_FILES = [
    'fotos/foto1.jpg',  // Selfie lucecitas (abrigo rosado)
    'fotos/foto2.jpg',  // Selfie divertida (pelirroja)
    'fotos/foto3.jpg',  // Selfie de día (camiseta negra)
    'fotos/foto4.jpg',  // Selfie abrigo blanco
    'fotos/foto5.jpg',  // Selfie sonriendo noche
    'fotos/foto6.jpg',  // Concierto con cámaras
    'fotos/foto7.jpg',  // Selfie luz rosada (besito)
    'fotos/foto8.jpg',  // Selfie luz rosada (lengüita)
    'fotos/foto9.jpg',  // Pelirroja flor azul
];

async function createCollage() {
    console.log('🎨 Creando collage con tus 9 fotos...\n');

    const innerSize = GRID * CELL_SIZE + (GRID - 1) * GAP;
    const totalWithPadding = innerSize + 2 * PADDING;
    const totalSize = totalWithPadding + 2 * BORDER;

    console.log(`📐 Tamaño del collage: ${totalSize}x${totalSize}px (${(totalSize/300*2.54).toFixed(1)}cm a 300dpi)`);

    // Process each photo: resize to square, crop center, optional grayscale
    const composites = [];

    for (let i = 0; i < PHOTO_FILES.length; i++) {
        const filePath = path.resolve(PHOTO_FILES[i]);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ No se encontró: ${PHOTO_FILES[i]}`);
            process.exit(1);
        }

        const row = Math.floor(i / GRID);
        const col = i % GRID;

        const x = BORDER + PADDING + col * (CELL_SIZE + GAP);
        const y = BORDER + PADDING + row * (CELL_SIZE + GAP);

        console.log(`  📸 Foto ${i + 1}: fila ${row + 1}, col ${col + 1} → (${x}, ${y})`);

        let img = sharp(filePath).resize(CELL_SIZE, CELL_SIZE, {
            fit: 'cover',
            position: 'centre',
        });

        if (GRAYSCALE) {
            img = img.grayscale();
        }

        const buffer = await img.toBuffer();

        composites.push({
            input: buffer,
            top: y,
            left: x,
        });
    }

    // Create the base canvas: black border + white interior
    console.log('\n🖼️  Generando canvas base...');

    const collage = await sharp({
        create: {
            width: totalSize,
            height: totalSize,
            channels: 3,
            background: { r: 26, g: 26, b: 26 }, // Dark frame
        }
    })
    .jpeg()
    .toBuffer();

    // Add white inner area
    const whiteArea = await sharp({
        create: {
            width: totalWithPadding,
            height: totalWithPadding,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
        }
    })
    .jpeg()
    .toBuffer();

    // Composite everything together
    console.log('🧩 Componiendo collage...');

    const outputPath = path.resolve('assets', 'collage-cuadro.png');

    await sharp(collage)
        .composite([
            { input: whiteArea, top: BORDER, left: BORDER },
            ...composites,
        ])
        .png({ quality: 100 })
        .toFile(outputPath);

    console.log(`\n✅ ¡Collage creado exitosamente!`);
    console.log(`📄 Archivo: ${outputPath}`);
    console.log(`📏 Resolución: ${totalSize}x${totalSize}px`);
    console.log(`🖨️  Listo para imprimir y para AR\n`);

    return outputPath;
}

createCollage().catch(err => {
    console.error('Error creando collage:', err);
    process.exit(1);
});
