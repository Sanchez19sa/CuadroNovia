const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CELL_SIZE = 600;       
const GAP = 24;              
const PADDING = 80;          
const BORDER = 40;           
const GRID = 3;              
const TOTAL_SIZE = 2088;     

const PHOTO_FILES = [
    'fotos/foto1.jpg', 'fotos/foto2.jpg', 'fotos/foto3.jpg',
    'fotos/foto4.jpg', 'fotos/foto5.jpg', 'fotos/foto6.jpg',
    'fotos/foto7.jpg', 'fotos/foto8.jpg', 'fotos/foto9.jpg',
];

// Nuevas flores acuarela con transparencia limpia
const FLOWER_FILES = [
    'assets/flores/flower-w1.png',
    'assets/flores/flower-w2.png'
];

async function createLayers() {
    console.log('🔮 Generando capas transparentes PRO para Realidad Aumentada 3D...\n');

    const outDir = path.resolve('assets', 'layers');

    const photos = [];
    for (let i = 0; i < PHOTO_FILES.length; i++) {
        // Cargar fotos sin CERO bordes blancos extra
        let buf = await sharp(PHOTO_FILES[i])
            .resize(CELL_SIZE, CELL_SIZE, { fit: 'cover', position: 'centre' })
            .grayscale()
            .png()
            .toBuffer();
        photos.push(buf);
    }

    const getBlank = async () => sharp({
        create: { width: TOTAL_SIZE, height: TOTAL_SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    }).png().toBuffer();

    const getCoords = (i) => {
        const row = Math.floor(i / GRID);
        const col = i % GRID;
        const x = BORDER + PADDING + col * (CELL_SIZE + GAP);
        const y = BORDER + PADDING + row * (CELL_SIZE + GAP);
        return { x, y };
    };

    // LAYER 2: Flores de fondo. Vamos a crear un jardín acuarela abajo
    let compsL2 = [];
    compsL2.push({ input: await sharp(FLOWER_FILES[0]).resize(800).toBuffer(), left: 100, top: TOTAL_SIZE - 850 });
    compsL2.push({ input: await sharp(FLOWER_FILES[1]).resize(900).toBuffer(), left: TOTAL_SIZE - 950, top: 150 });
    await sharp(await getBlank()).composite(compsL2).png().toFile(path.join(outDir, 'layer2_bg_flowers.png'));
    console.log('✅ Generada Layer 2 (Jardín Acuarela Base)');

    // LAYER 3: Cruz de fotos
    const crossIndices = [1, 3, 5, 7];
    let compsL3 = [];
    for (let i of crossIndices) {
        const {x, y} = getCoords(i);
        compsL3.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await getBlank()).composite(compsL3).png().toFile(path.join(outDir, 'layer3_cross_photos.png'));
    
    // LAYER 4: Flores cruz
    let compsL4 = [];
    compsL4.push({ input: await sharp(FLOWER_FILES[1]).resize(500).toBuffer(), left: getCoords(3).x - 100, top: getCoords(3).y + 200 });
    compsL4.push({ input: await sharp(FLOWER_FILES[0]).resize(450).toBuffer(), left: getCoords(5).x + 300, top: getCoords(5).y - 50 });
    await sharp(await getBlank()).composite(compsL4).png().toFile(path.join(outDir, 'layer4_cross_flowers.png'));

    // LAYER 5: Esquinas
    const cornerIndices = [0, 2, 6, 8];
    let compsL5 = [];
    for (let i of cornerIndices) {
        const {x, y} = getCoords(i);
        compsL5.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await getBlank()).composite(compsL5).png().toFile(path.join(outDir, 'layer5_corner_photos.png'));

    // LAYER 6: Flores esquinas
    let compsL6 = [];
    compsL6.push({ input: await sharp(FLOWER_FILES[0]).resize(500).toBuffer(), left: getCoords(0).x - 200, top: getCoords(0).y - 200 });
    compsL6.push({ input: await sharp(FLOWER_FILES[1]).resize(400).toBuffer(), left: getCoords(8).x + 400, top: getCoords(8).y + 400 });
    await sharp(await getBlank()).composite(compsL6).png().toFile(path.join(outDir, 'layer6_corner_flowers.png'));

    // LAYER 7: Centro
    const centerIndex = 4;
    const cCoords = getCoords(centerIndex);
    await sharp(await getBlank()).composite([{ input: photos[centerIndex], left: cCoords.x, top: cCoords.y }]).png().toFile(path.join(outDir, 'layer7_center_photo.png'));

    // LAYER 8: Flores centro
    let compsL8 = [];
    compsL8.push({ input: await sharp(FLOWER_FILES[0]).resize(380).toBuffer(), left: cCoords.x + 350, top: cCoords.y + 350 });
    await sharp(await getBlank()).composite(compsL8).png().toFile(path.join(outDir, 'layer8_center_flowers.png'));
}

createLayers().catch(err => {
    console.error('Error:', err);
});
