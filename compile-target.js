const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9876;
const OUTPUT_PATH = path.join(__dirname, 'assets', 'cuadro.mind');

function startServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let url = req.url.split('?')[0]; // strip query params
            let filePath = path.join(__dirname, url === '/' ? 'compile.html' : url);
            const ext = path.extname(filePath).toLowerCase();
            const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };

            if (!fs.existsSync(filePath)) {
                console.log(`  [404] ${url}`);
                res.writeHead(404); res.end('Not found'); return;
            }
            res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
            res.end(fs.readFileSync(filePath));
        });
        server.listen(PORT, () => { console.log(`🌐 http://localhost:${PORT}`); resolve(server); });
    });
}

async function main() {
    console.log('🔮 Compilando target AR...\n');
    const server = await startServer();
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => {
        const t = msg.text();
        if (!t.includes('DevTools') && !t.includes('blob:')) console.log('  [log]', t);
    });
    page.on('pageerror', err => console.log('  [ERR]', err.message));

    console.log('📂 Abriendo compilador...');
    await page.goto(`http://localhost:${PORT}/compile.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    console.log('⏳ Esperando compilación (hasta 3 min)...\n');

    try {
        await page.waitForFunction(() => {
            const dl = document.getElementById('dl');
            const log = document.getElementById('log');
            return (dl && !dl.classList.contains('hide')) || (log && log.textContent.includes('❌'));
        }, { timeout: 180000 });

        const hasError = await page.evaluate(() => document.getElementById('log')?.textContent.includes('❌'));

        if (hasError) {
            const txt = await page.evaluate(() => document.getElementById('log')?.textContent);
            console.error('❌ Error:', txt);
        } else {
            console.log('📥 Descargando .mind...');
            const data = await page.evaluate(async () => {
                const dl = document.getElementById('dl');
                const resp = await fetch(dl.href);
                const buf = await resp.arrayBuffer();
                return Array.from(new Uint8Array(buf));
            });
            fs.writeFileSync(OUTPUT_PATH, Buffer.from(data));
            console.log(`\n✅ ¡COMPILADO! → ${OUTPUT_PATH}`);
            console.log(`📏 Tamaño: ${(data.length / 1024).toFixed(1)} KB`);
        }
    } catch (e) {
        const txt = await page.evaluate(() => document.getElementById('log')?.textContent).catch(() => '');
        console.error('❌ Timeout/Error:', e.message);
        if (txt) console.log('Log:', txt);
    }

    await browser.close();
    server.close();
}

main().catch(e => { console.error(e); process.exit(1); });
