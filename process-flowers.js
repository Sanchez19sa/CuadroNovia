const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const baseDir = "C:\\Users\\Sanch\\.gemini\\antigravity\\brain\\ad7774ca-160b-4aa5-a905-b3ca85659852";

const in1 = path.join(baseDir, 'single_flower_pink_1775710206030.png');
const in2 = path.join(baseDir, 'single_flower_yellow_1775710220760.png');

const out1 = path.join(__dirname, 'assets', 'flores', 'flower-single1.png');
const out2 = path.join(__dirname, 'assets', 'flores', 'flower-single2.png');

async function removeWhiteBackground(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
        console.log('No existe:', inputPath);
        return;
    }
    const image = await Jimp.read(inputPath);
    
    // Algoritmo de chroma key que crea un degradado alfa basado en qué tan blanco es el píxel
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        
        // Calcular "blancura". 255 = puro blanco.
        const avg = (r + g + b) / 3;
        
        // Si el brillo promedio es mayor a 240, lo hacemos 100% transparente
        if (r > 240 && g > 240 && b > 240) {
            this.bitmap.data[idx + 3] = 0; // Alpha = 0
        } else if (avg > 180) {
            const alpha = Math.max(0, 255 - ((avg - 180) * (255 / 75)));
            this.bitmap.data[idx + 3] = alpha;
        }
    });

    await image.writeAsync(outputPath);
    console.log('✅ Background removed and saved to', outputPath);
}

async function run() {
    await removeWhiteBackground(in1, out1);
    await removeWhiteBackground(in2, out2);
}

run().catch(console.error);
