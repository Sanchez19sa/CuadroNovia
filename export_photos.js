const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'fotos');
const outDir = path.normalize('C:/Users/Sanch/OneDrive/Escritorio/FotosSorisYSanti');

if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir, { recursive: true });
}

async function processImages() {
    console.log(`Buscando fotos originales en: ${srcDir}`);
    console.log(`Exportando a: ${outDir}\n`);

    for (let i = 1; i <= 9; i++) {
        const file = `foto${i}.jpg`;
        const srcPath = path.join(srcDir, file);
        const outPath = path.join(outDir, file);
        
        try {
            if (fs.existsSync(srcPath)) {
                process.stdout.write(`Procesando ${file}... `);
                const img = await Jimp.read(srcPath);
                
                // Cortar en cuadrado perfecto centrado
                const size = Math.min(img.bitmap.width, img.bitmap.height);
                const x = (img.bitmap.width - size) / 2;
                const y = (img.bitmap.height - size) / 2;
                
                img.crop(x, y, size, size)
                   .greyscale()
                   .quality(100);
                   
                await img.writeAsync(outPath);
                console.log(`✅ ¡Recortada en ${size}x${size} y guardada en gris!`);
            } else {
                console.log(`❌ No se encontró ${file}`);
            }
        } catch(e) {
            console.log(`❌ Error con ${file}: ${e.message}`);
        }
    }
    console.log('\n¡Proceso Completado exitosamente!');
}

processImages();
