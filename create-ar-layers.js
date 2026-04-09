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

const FLOWER_SINGLE_FILES = [
    'assets/flores/flower-single1.png', // Pink Cosmos
    'assets/flores/flower-single2.png'  // Yellow Poppy
];

const BACKGROUND_IMAGE = 'C:\\Users\\Sanch\\.gemini\\antigravity\\brain\\ad7774ca-160b-4aa5-a905-b3ca85659852\\floral_background_1775710233191.png';

async function createLayers() {
    console.log('🔮 Generando capas transparentes PRO para Realidad Aumentada 3D...\n');

    const outDir = path.resolve('assets', 'layers');

    const photos = [];
    for (let i = 0; i < PHOTO_FILES.length; i++) {
        let buf = await sharp(PHOTO_FILES[i])
            .resize(CELL_SIZE, CELL_SIZE, { fit: 'cover', position: 'centre' })
            .grayscale() // Dejamos las fotos en escala de grises y las flores de colores vibrantes
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

    // LAYER 1: Full Floral Background (Reemplaza el cuadro real tapando las fotos viejas)
    await sharp(BACKGROUND_IMAGE)
        .resize(TOTAL_SIZE, TOTAL_SIZE, { fit: 'cover' })
        .png()
        .toFile(path.join(outDir, 'layer1_bg_floral.png'));
    console.log('✅ Generada Layer 1 (Fondo Completo de Flores sobre el cuadro real)');

    // LAYER 3: Cruz de fotos
    const crossIndices = [1, 3, 5, 7];
    let compsL3 = [];
    for (let i of crossIndices) {
        const {x, y} = getCoords(i);
        compsL3.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await getBlank()).composite(compsL3).png().toFile(path.join(outDir, 'layer3_cross_photos.png'));
    console.log('✅ Generada Layer 3');
    
    // LAYER 4: Flores cruz (Flores GRANDES ÚNICAS en las esquinas de algunas fotos de la cruz)
    let compsL4 = [];
    compsL4.push({ input: await sharp(FLOWER_SINGLE_FILES[1]).resize(450).toBuffer(), left: getCoords(1).x - 120, top: getCoords(1).y + 350 }); // Amarillo en Top
    compsL4.push({ input: await sharp(FLOWER_SINGLE_FILES[0]).resize(500).toBuffer(), left: getCoords(5).x + 400, top: getCoords(5).y - 150 }); // Rosa en Right
    await sharp(await getBlank()).composite(compsL4).png().toFile(path.join(outDir, 'layer4_cross_flowers.png'));
    console.log('✅ Generada Layer 4');

    // LAYER 5: Esquinas
    const cornerIndices = [0, 2, 6, 8];
    let compsL5 = [];
    for (let i of cornerIndices) {
        const {x, y} = getCoords(i);
        compsL5.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await getBlank()).composite(compsL5).png().toFile(path.join(outDir, 'layer5_corner_photos.png'));
    console.log('✅ Generada Layer 5');

    // LAYER 6: Flores esquinas (Flor Grande en la esquina Inferior Izquierda, etc.)
    let compsL6 = [];
    compsL6.push({ input: await sharp(FLOWER_SINGLE_FILES[0]).resize(600).toBuffer(), left: getCoords(0).x - 200, top: getCoords(0).y - 200 }); // Rosa Top Left
    compsL6.push({ input: await sharp(FLOWER_SINGLE_FILES[1]).resize(550).toBuffer(), left: getCoords(8).x + 300, top: getCoords(8).y + 300 }); // Amarilla Bottom Right
    await sharp(await getBlank()).composite(compsL6).png().toFile(path.join(outDir, 'layer6_corner_flowers.png'));
    console.log('✅ Generada Layer 6');

    // LAYER 7: Centro
    const centerIndex = 4;
    const cCoords = getCoords(centerIndex);
    await sharp(await getBlank()).composite([{ input: photos[centerIndex], left: cCoords.x, top: cCoords.y }]).png().toFile(path.join(outDir, 'layer7_center_photo.png'));
    console.log('✅ Generada Layer 7');

    // LAYER 8: Flores centro
    let compsL8 = [];
    compsL8.push({ input: await sharp(FLOWER_SINGLE_FILES[0]).resize(500).toBuffer(), left: cCoords.x - 150, top: cCoords.y + 450 }); // Rosa tapando la esquina inferior izquierda del centro
    await sharp(await getBlank()).composite(compsL8).png().toFile(path.join(outDir, 'layer8_center_flowers.png'));
    console.log('✅ Generada Layer 8');

    console.log('🎉 ¡Nuevas Capas 3D con flores elegantes únicas completadas!');
}

createLayers().catch(err => {
    console.error('Error:', err);
});
