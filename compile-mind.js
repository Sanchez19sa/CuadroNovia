const { Compiler } = require('mind-ar/dist/mindar-image.prod.cjs.js');  
const fs = require('fs');
const path = require('path');

async function compile() {
    console.log('🔮 Compilando archivo .mind con máxima calidad...');
    
    const compiler = new Compiler();
    
    // Leer la imagen del collage
    const imageData = fs.readFileSync(path.resolve('assets/collage-cuadro.png'));
    
    // Convertir a base64 data URL para el compiler
    const base64 = imageData.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    // Compilar con la imagen
    await compiler.compileImageTargets([dataUrl], (progress) => {
        const pct = Math.round(progress * 100);
        process.stdout.write(`\r  Progreso: ${pct}%`);
    });
    
    // Exportar el .mind file
    const exportedBuffer = await compiler.exportData();
    
    // Guardar
    const outPath = path.resolve('assets/cuadro.mind');
    fs.writeFileSync(outPath, Buffer.from(exportedBuffer));
    
    console.log(`\n✅ Archivo .mind compilado exitosamente: ${outPath}`);
    console.log(`   Tamaño: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
}

compile().catch(err => {
    console.error('Error compilando:', err);
});
