const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const baseDir = "C:\\Users\\Sanch\\.gemini\\antigravity\\brain\\ad7774ca-160b-4aa5-a905-b3ca85659852";

const flowers = [
    { in: path.join(baseDir, 'flower_red_hibiscus_1775714032711.png'), out: 'assets/flores/f_red.png' },
    { in: path.join(baseDir, 'flower_purple_cosmos_1775714044257.png'), out: 'assets/flores/f_purple.png' },
    { in: path.join(baseDir, 'flower_blue_delphinium_1775714057799.png'), out: 'assets/flores/f_blue.png' },
    { in: path.join(baseDir, 'flower_yellow_large_1775714071366.png'), out: 'assets/flores/f_yellow.png' },
    // Reutilizamos las existentes como pink
    { in: 'assets/flores/flower-single1.png', out: 'assets/flores/f_pink.png' },
];

async function removeWhiteBG(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
        console.log('SKIP (no existe):', inputPath);
        return;
    }
    const image = await Jimp.read(inputPath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const avg = (r + g + b) / 3;
        
        if (r > 235 && g > 235 && b > 235) {
            this.bitmap.data[idx + 3] = 0;
        } else if (avg > 200) {
            const alpha = Math.max(0, 255 - ((avg - 200) * (255 / 55)));
            this.bitmap.data[idx + 3] = alpha;
        }
    });

    await image.writeAsync(outputPath);
    console.log('✅', outputPath);
}

async function run() {
    for (const f of flowers) {
        await removeWhiteBG(f.in, f.out);
    }
    console.log('🎉 Todas las flores procesadas');
}

run().catch(console.error);
