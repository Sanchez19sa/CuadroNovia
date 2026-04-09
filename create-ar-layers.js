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

const FLOWER_HEADS = [
    'assets/flores/head_pink.png',
    'assets/flores/head_yellow.png',
    'assets/flores/head_purple.png'
];

const BACKGROUND_IMAGE = 'C:\\Users\\Sanch\\.gemini\\antigravity\\brain\\ad7774ca-160b-4aa5-a905-b3ca85659852\\floral_background_1775710233191.png';

async function createLayers() {
    console.log('🔮 Generando capas transparentes (ESTRUCTURA EXACTA) para AR...');

    const outDir = path.resolve('assets', 'layers');

    const photos = [];
    for (let i = 0; i < PHOTO_FILES.length; i++) {
        let buf = await sharp(PHOTO_FILES[i])
            .resize(CELL_SIZE, CELL_SIZE, { fit: 'cover', position: 'centre' })
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

    // LAYER 2: Flores de fondo con FONDO BLANCO.
    // Esto cubre las fotos físicas para evitar que "tiemblen" o se vean duplicadas.
    const bgWhite = await sharp({
        create: { width: TOTAL_SIZE, height: TOTAL_SIZE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
    }).png().toBuffer();
    
    // Si la imagen de fondo es muy densa, podemos bajarle su opacidad o colocar las otras, lo useremos de fondo blanco
    await sharp(bgWhite)
        .composite([{ input: await sharp(BACKGROUND_IMAGE).resize(TOTAL_SIZE, TOTAL_SIZE, {fit:'cover'}).toBuffer(), blend: 'over' }])
        .png()
        .toFile(path.join(outDir, 'layer2_bg_flowers.png'));
    console.log('✅ Capa 2 (Fondo Blanco con Flores)');

    // LAYER 3: Cruz de fotos
    const crossIndices = [1, 3, 5, 7];
    let compsL3 = [];
    for (let i of crossIndices) {
        const {x, y} = getCoords(i);
        compsL3.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await getBlank()).composite(compsL3).png().toFile(path.join(outDir, 'layer3_cross_photos.png'));
    console.log('✅ Capa 3 (Cruz)');

    // LAYER 4: Florecitas de esquinas en cruz
    let compsL4 = [];
    compsL4.push({ input: await sharp(FLOWER_HEADS[2]).resize(300).toBuffer(), left: getCoords(1).x + 400, top: getCoords(1).y + 350 }); 
    compsL4.push({ input: await sharp(FLOWER_HEADS[2]).resize(250).toBuffer(), left: getCoords(3).x + 350, top: getCoords(3).y - 50 }); 
    compsL4.push({ input: await sharp(FLOWER_HEADS[2]).resize(320).toBuffer(), left: getCoords(5).x - 100, top: getCoords(5).y + 400 }); 
    compsL4.push({ input: await sharp(FLOWER_HEADS[2]).resize(280).toBuffer(), left: getCoords(7).x + 100, top: getCoords(7).y - 120 }); 
    await sharp(await getBlank()).composite(compsL4).png().toFile(path.join(outDir, 'layer4_cross_flowers.png'));
    console.log('✅ Capa 4 (Flores de cruz)');

    // LAYER 5: 4 Fotos de esquinas
    const cornerIndices = [0, 2, 6, 8];
    let compsL5 = [];
    for (let i of cornerIndices) {
        const {x, y} = getCoords(i);
        compsL5.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await getBlank()).composite(compsL5).png().toFile(path.join(outDir, 'layer5_corner_photos.png'));
    console.log('✅ Capa 5 (Esquinas)');

    // LAYER 6: Florecitas para esquinas (otra posición)
    let compsL6 = [];
    compsL6.push({ input: await sharp(FLOWER_HEADS[1]).resize(350).toBuffer(), left: getCoords(0).x - 100, top: getCoords(0).y - 100 }); 
    compsL6.push({ input: await sharp(FLOWER_HEADS[1]).resize(400).toBuffer(), left: getCoords(2).x + 300, top: getCoords(2).y - 50 }); 
    compsL6.push({ input: await sharp(FLOWER_HEADS[1]).resize(350).toBuffer(), left: getCoords(6).x - 50, top: getCoords(6).y + 400 }); 
    compsL6.push({ input: await sharp(FLOWER_HEADS[1]).resize(380).toBuffer(), left: getCoords(8).x + 350, top: getCoords(8).y + 350 }); 
    await sharp(await getBlank()).composite(compsL6).png().toFile(path.join(outDir, 'layer6_corner_flowers.png'));
    console.log('✅ Capa 6 (Flores Esquinas)');

    // LAYER 7: Imagen del centro
    const cCoords = getCoords(4);
    await sharp(await getBlank()).composite([{ input: photos[4], left: cCoords.x, top: cCoords.y }]).png().toFile(path.join(outDir, 'layer7_center_photo.png'));
    console.log('✅ Capa 7 (Centro)');

    // LAYER 8: Última capa con más florecitas
    let compsL8 = [];
    compsL8.push({ input: await sharp(FLOWER_HEADS[0]).resize(450).toBuffer(), left: cCoords.x - 100, top: cCoords.y + 400 }); 
    compsL8.push({ input: await sharp(FLOWER_HEADS[0]).resize(400).toBuffer(), left: cCoords.x + 350, top: cCoords.y - 150 }); 
    await sharp(await getBlank()).composite(compsL8).png().toFile(path.join(outDir, 'layer8_center_flowers.png'));
    console.log('✅ Capa 8 (Flores Centro)');

    console.log('🎉 Terminado.');
}

createLayers().catch(err => {
    console.error('Error:', err);
});
