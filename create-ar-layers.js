const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CELL_SIZE = 600;       // Cada foto
const GAP = 24;              // Espacio entre fotos
const PADDING = 80;          // Borde blanco interior
const BORDER = 40;           // Borde negro exterior
const GRID = 3;              // 3x3
const TOTAL_SIZE = 2088;     // 2088x2088 px garantizado
const CARD_PADDING = 15;     // Extra borde blanco para dar efecto tipo polaroid al salir en 3D

const PHOTO_FILES = [
    'fotos/foto1.jpg', 'fotos/foto2.jpg', 'fotos/foto3.jpg',
    'fotos/foto4.jpg', 'fotos/foto5.jpg', 'fotos/foto6.jpg',
    'fotos/foto7.jpg', 'fotos/foto8.jpg', 'fotos/foto9.jpg',
];

const FLOWER_FILES = [
    'assets/flores/flower1.png',
    'assets/flores/flower2.png',
    'assets/flores/flower3.png'
];

async function createLayers() {
    console.log('🔮 Generando capas transparentes para Realidad Aumentada 3D...\n');

    const outDir = path.resolve('assets', 'layers');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // 1. Cargar las fotos preprocesadas
    const photos = [];
    for (let i = 0; i < PHOTO_FILES.length; i++) {
        let buf = await sharp(PHOTO_FILES[i])
            .resize(CELL_SIZE, CELL_SIZE, { fit: 'cover', position: 'centre' })
            .grayscale()
            .toBuffer();
            
        // Add a small solid white border representing the photo "card" popping out
        const cardSize = CELL_SIZE + (CARD_PADDING * 2);
        buf = await sharp({
            create: { width: cardSize, height: cardSize, channels: 4, background: { r:255, g:255, b:255, alpha:1 } }
        })
        .composite([{ input: buf, top: CARD_PADDING, left: CARD_PADDING }])
        .png()
        .toBuffer();

        photos.push(buf);
    }

    // 2. Helper para crear un blank canvas transparente
    const getBlank = async () => sharp({
        create: { width: TOTAL_SIZE, height: TOTAL_SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    }).png().toBuffer();

    // Función para calcular coordenadas (considerando el offset del borde extra que le pusimos a la carta)
    const getCoords = (i) => {
        const row = Math.floor(i / GRID);
        const col = i % GRID;
        const reqX = BORDER + PADDING + col * (CELL_SIZE + GAP);
        const reqY = BORDER + PADDING + row * (CELL_SIZE + GAP);
        return { x: reqX - CARD_PADDING, y: reqY - CARD_PADDING };
    };

    // ----------------------------------------------------------------------
    // LAYER 2: Flores de fondo (Flores grandes por detrás de la estructura principal)
    // ----------------------------------------------------------------------
    let compsL2 = [];
    for(let i=0; i<8; i++) {
        const fBuf = await sharp(FLOWER_FILES[i % 3]).resize(400).png().toBuffer();
        compsL2.push({
            input: fBuf, 
            left: Math.floor(Math.random() * (TOTAL_SIZE - 400)), 
            top: Math.floor(Math.random() * (TOTAL_SIZE - 400))
        });
    }
    await sharp(await getBlank()).composite(compsL2).png().toFile(path.join(outDir, 'layer2_bg_flowers.png'));
    console.log('✅ Generada Layer 2 (Flores Base)');

    // ----------------------------------------------------------------------
    // LAYER 3: Cruz de fotos (indices 1, 3, 5, 7)
    // ----------------------------------------------------------------------
    const crossIndices = [1, 3, 5, 7];
    let compsL3 = [];
    for (let i of crossIndices) {
        const {x, y} = getCoords(i);
        compsL3.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await getBlank()).composite(compsL3).png().toFile(path.join(outDir, 'layer3_cross_photos.png'));
    console.log('✅ Generada Layer 3 (Fotos cruz)');

    // ----------------------------------------------------------------------
    // LAYER 4: Flores cruz
    // ----------------------------------------------------------------------
    let compsL4 = [];
    for (let i of crossIndices) {
        const {x, y} = getCoords(i);
        const fBuf = await sharp(FLOWER_FILES[(i+1)%3]).resize(250).png().toBuffer();
        // Place flower near the photo
        compsL4.push({ input: fBuf, left: x - 50, top: y - 50 });
    }
    await sharp(await getBlank()).composite(compsL4).png().toFile(path.join(outDir, 'layer4_cross_flowers.png'));
    console.log('✅ Generada Layer 4 (Flores cruz)');

    // ----------------------------------------------------------------------
    // LAYER 5: Fotos de las esquinas (indices 0, 2, 6, 8)
    // ----------------------------------------------------------------------
    const cornerIndices = [0, 2, 6, 8];
    let compsL5 = [];
    for (let i of cornerIndices) {
        const {x, y} = getCoords(i);
        compsL5.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await getBlank()).composite(compsL5).png().toFile(path.join(outDir, 'layer5_corner_photos.png'));
    console.log('✅ Generada Layer 5 (Fotos esquinas)');

    // ----------------------------------------------------------------------
    // LAYER 6: Flores esquinas
    // ----------------------------------------------------------------------
    let compsL6 = [];
    for (let i of cornerIndices) {
        const {x, y} = getCoords(i);
        const fBuf = await sharp(FLOWER_FILES[(i+2)%3]).resize(280).png().toBuffer();
        compsL6.push({ input: fBuf, left: x + 400, top: y + 400 });
    }
    await sharp(await getBlank()).composite(compsL6).png().toFile(path.join(outDir, 'layer6_corner_flowers.png'));
    console.log('✅ Generada Layer 6 (Flores esquinas)');

    // ----------------------------------------------------------------------
    // LAYER 7: Foto central (indice 4)
    // ----------------------------------------------------------------------
    const centerIndex = 4;
    let compsL7 = [];
    const cCoords = getCoords(centerIndex);
    compsL7.push({ input: photos[centerIndex], left: cCoords.x, top: cCoords.y });
    await sharp(await getBlank()).composite(compsL7).png().toFile(path.join(outDir, 'layer7_center_photo.png'));
    console.log('✅ Generada Layer 7 (Foto central)');

    // ----------------------------------------------------------------------
    // LAYER 8: Flores centro
    // ----------------------------------------------------------------------
    let compsL8 = [];
    const fCenter1 = await sharp(FLOWER_FILES[0]).resize(320).png().toBuffer();
    const fCenter2 = await sharp(FLOWER_FILES[1]).resize(240).png().toBuffer();
    compsL8.push({ input: fCenter1, left: cCoords.x - 100, top: cCoords.y - 120 });
    compsL8.push({ input: fCenter2, left: cCoords.x + 450, top: cCoords.y + 480 });
    await sharp(await getBlank()).composite(compsL8).png().toFile(path.join(outDir, 'layer8_center_flowers.png'));
    console.log('✅ Generada Layer 8 (Flores centro)');

    console.log('\n🎉 ¡Capas 3D generadas correctamente! Estructura paralaje completada.');
}

createLayers().catch(err => {
    console.error('Error:', err);
});
