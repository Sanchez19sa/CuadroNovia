const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const baseDir = "C:\\Users\\Sanch\\.gemini\\antigravity\\brain\\ad7774ca-160b-4aa5-a905-b3ca85659852";

const in1 = path.join(baseDir, 'flower_head_pink_1775711088128.png');
const in2 = path.join(baseDir, 'flower_head_yellow_1775711104307.png');
const in3 = path.join(baseDir, 'flower_head_purple_1775711119321.png');

const out1 = path.join(__dirname, 'assets', 'flores', 'head_pink.png');
const out2 = path.join(__dirname, 'assets', 'flores', 'head_yellow.png');
const out3 = path.join(__dirname, 'assets', 'flores', 'head_purple.png');

async function removeWhiteBackground(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
        console.log('No existe:', inputPath);
        return;
    }
    const image = await Jimp.read(inputPath);
    
    // Algoritmo de chroma key suave para acuarela sobre fondo blanco
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        
        // Calcular "blancura". 255 = puro blanco.
        const avg = (r + g + b) / 3;
        
        // Convertir blancos casi puros a transparencia total
        if (r > 240 && g > 240 && b > 240) {
            this.bitmap.data[idx + 3] = 0; // Alpha = 0
        } else if (avg > 180) {
            // Suavizado anti-aliasing
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
    await removeWhiteBackground(in3, out3);
}

run().catch(console.error);
