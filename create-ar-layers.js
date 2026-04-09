const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ===== DIMENSIONES DEL COLLAGE ORIGINAL =====
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

// ===== FLORES INDIVIDUALES (ya sin fondo blanco) =====
const F = {
    red:    'assets/flores/f_red.png',
    purple: 'assets/flores/f_purple.png',
    blue:   'assets/flores/f_blue.png',
    yellow: 'assets/flores/f_yellow.png',
    pink:   'assets/flores/f_pink.png',
};

// Fondo de pradera floral denso
const BG_MEADOW = 'C:\\Users\\Sanch\\.gemini\\antigravity\\brain\\ad7774ca-160b-4aa5-a905-b3ca85659852\\floral_meadow_bg_1775714083096.png';

const outDir = path.resolve('assets', 'layers');

async function createLayers() {
    console.log('🔮 Generando 8 capas AR profesionales...\n');

    // Preparar fotos en escala de grises
    const photos = [];
    for (let i = 0; i < PHOTO_FILES.length; i++) {
        let buf = await sharp(PHOTO_FILES[i])
            .resize(CELL_SIZE, CELL_SIZE, { fit: 'cover', position: 'centre' })
            .grayscale()
            .png()
            .toBuffer();
        photos.push(buf);
    }

    // Función para crear canvas transparente
    const blank = async () => sharp({
        create: { width: TOTAL_SIZE, height: TOTAL_SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    }).png().toBuffer();

    // Coordenadas de cada celda en el collage
    const pos = (i) => {
        const row = Math.floor(i / GRID);
        const col = i % GRID;
        return {
            x: BORDER + PADDING + col * (CELL_SIZE + GAP),
            y: BORDER + PADDING + row * (CELL_SIZE + GAP)
        };
    };

    // Helper para cargar y redimensionar una flor
    const flower = async (name, size) => {
        return await sharp(F[name]).resize(size).png().toBuffer();
    };

    // =========================================================
    // CAPA 1: TODAS las 9 fotos (fondo blanco, como el cuadro)
    // Esta es la base que simula el cuadro real
    // =========================================================
    let comps1 = [];
    for (let i = 0; i < 9; i++) {
        const {x, y} = pos(i);
        comps1.push({ input: photos[i], left: x, top: y });
    }
    // Crear fondo blanco con borde negro (como el cuadro real)
    const whiteBase = await sharp({
        create: { width: TOTAL_SIZE, height: TOTAL_SIZE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 255 } }
    }).png().toBuffer();
    await sharp(whiteBase).composite(comps1).png().toFile(path.join(outDir, 'layer1_all_photos.png'));
    console.log('✅ Capa 1: Todas las 9 fotos (base del cuadro)');

    // =========================================================
    // CAPA 2: FONDO DE FLORES DENSO (cubre todo el cuadro)
    // Flores del campo de pradera cubriendo todo
    // =========================================================
    await sharp(BG_MEADOW)
        .resize(TOTAL_SIZE, TOTAL_SIZE, { fit: 'cover' })
        .png()
        .toFile(path.join(outDir, 'layer2_flower_bg.png'));
    console.log('✅ Capa 2: Fondo denso de flores (pradera)');

    // =========================================================
    // CAPA 3: CRUZ de fotos (posiciones 1,3,5,7) - fondo transparente
    // =========================================================
    const crossIdx = [1, 3, 5, 7];
    let comps3 = [];
    for (let i of crossIdx) {
        const {x, y} = pos(i);
        comps3.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await blank()).composite(comps3).png().toFile(path.join(outDir, 'layer3_cross_photos.png'));
    console.log('✅ Capa 3: Cruz de fotos (4 fotos)');

    // =========================================================
    // CAPA 4: Flores en las esquinas de las fotos de la cruz
    // Flores individuales grandes decorando las fotos
    // =========================================================
    let comps4 = [];
    // Flores alrededor de foto 1 (arriba centro)
    comps4.push({ input: await flower('purple', 350), left: pos(1).x - 80, top: pos(1).y - 100 });
    comps4.push({ input: await flower('yellow', 280), left: pos(1).x + 400, top: pos(1).y + 350 });
    // Flores alrededor de foto 3 (izquierda centro)
    comps4.push({ input: await flower('blue', 250), left: pos(3).x - 100, top: pos(3).y + 300 });
    comps4.push({ input: await flower('red', 320), left: pos(3).x + 350, top: pos(3).y - 80 });
    // Flores alrededor de foto 5 (derecha centro)
    comps4.push({ input: await flower('pink', 300), left: pos(5).x + 350, top: pos(5).y + 200 });
    comps4.push({ input: await flower('yellow', 250), left: pos(5).x - 50, top: pos(5).y + 400 });
    // Flores alrededor de foto 7 (abajo centro)
    comps4.push({ input: await flower('purple', 280), left: pos(7).x + 200, top: pos(7).y + 380 });
    comps4.push({ input: await flower('red', 240), left: pos(7).x - 80, top: pos(7).y + 100 });
    await sharp(await blank()).composite(comps4).png().toFile(path.join(outDir, 'layer4_cross_flowers.png'));
    console.log('✅ Capa 4: Flores alrededor de la cruz');

    // =========================================================
    // CAPA 5: ESQUINAS (posiciones 0,2,6,8) - fondo transparente
    // =========================================================
    const cornerIdx = [0, 2, 6, 8];
    let comps5 = [];
    for (let i of cornerIdx) {
        const {x, y} = pos(i);
        comps5.push({ input: photos[i], left: x, top: y });
    }
    await sharp(await blank()).composite(comps5).png().toFile(path.join(outDir, 'layer5_corner_photos.png'));
    console.log('✅ Capa 5: Esquinas (4 fotos)');

    // =========================================================
    // CAPA 6: Flores en las esquinas de las fotos de las esquinas
    // =========================================================
    let comps6 = [];
    // Foto 0 (top-left)
    comps6.push({ input: await flower('purple', 380), left: pos(0).x - 150, top: pos(0).y - 120 });
    comps6.push({ input: await flower('blue', 200), left: pos(0).x + 450, top: pos(0).y - 60 });
    // Foto 2 (top-right)
    comps6.push({ input: await flower('pink', 300), left: pos(2).x + 380, top: pos(2).y - 100 });
    comps6.push({ input: await flower('blue', 180), left: pos(2).x + 500, top: pos(2).y + 350 });
    // Foto 6 (bottom-left)
    comps6.push({ input: await flower('yellow', 350), left: pos(6).x - 120, top: pos(6).y + 350 });
    comps6.push({ input: await flower('red', 280), left: pos(6).x + 400, top: pos(6).y + 400 });
    // Foto 8 (bottom-right)
    comps6.push({ input: await flower('red', 320), left: pos(8).x + 350, top: pos(8).y + 300 });
    comps6.push({ input: await flower('pink', 220), left: pos(8).x + 500, top: pos(8).y + 50 });
    await sharp(await blank()).composite(comps6).png().toFile(path.join(outDir, 'layer6_corner_flowers.png'));
    console.log('✅ Capa 6: Flores alrededor de esquinas');

    // =========================================================
    // CAPA 7: CENTRO (posición 4) - fondo transparente
    // =========================================================
    const c = pos(4);
    await sharp(await blank())
        .composite([{ input: photos[4], left: c.x, top: c.y }])
        .png().toFile(path.join(outDir, 'layer7_center_photo.png'));
    console.log('✅ Capa 7: Foto central');

    // =========================================================
    // CAPA 8: Flores alrededor de la foto central
    // =========================================================
    let comps8 = [];
    comps8.push({ input: await flower('red', 350), left: c.x - 120, top: c.y + 380 });
    comps8.push({ input: await flower('yellow', 300), left: c.x + 400, top: c.y + 350 });
    comps8.push({ input: await flower('purple', 250), left: c.x + 350, top: c.y - 100 });
    comps8.push({ input: await flower('blue', 200), left: c.x - 80, top: c.y - 60 });
    await sharp(await blank()).composite(comps8).png().toFile(path.join(outDir, 'layer8_center_flowers.png'));
    console.log('✅ Capa 8: Flores alrededor del centro');

    console.log('\n🎉 ¡8 capas generadas exitosamente!');
}

createLayers().catch(err => {
    console.error('Error:', err);
});
