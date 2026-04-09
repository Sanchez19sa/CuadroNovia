# 💕 Cuadro de Realidad Aumentada

Un regalo romántico: un cuadro físico con fotos que cobra vida con realidad aumentada al apuntarle con el celular.

## 📋 Guía Paso a Paso

### Paso 1: Crear el Collage

1. Abre `collage.html` en tu navegador (doble clic en el archivo)
2. Haz clic en cada celda y sube las 9 fotos
3. Activa/desactiva el filtro Blanco & Negro
4. Haz clic en **"Descargar Collage HD"**
5. Se descargará `collage-cuadro-amor.png` en alta resolución

> 💡 Esta imagen es la que imprimirás para el cuadro físico Y la que usarás para el AR.

---

### Paso 2: Compilar el Archivo AR

1. Ve al [Compilador de MindAR](https://hiukim.github.io/mind-ar-js-doc/tools/compile/)
2. Haz clic en "Upload Images" y sube `collage-cuadro-amor.png`
3. Haz clic en "Start" y espera a que compile
4. Descarga el archivo `.mind`
5. Renómbralo a `cuadro.mind`
6. Colócalo en: `assets/cuadro.mind`

---

### Paso 3: Agregar la Música

1. Consigue el MP3 de "Para tu amor" de Juanes
2. Renómbralo a `musica.mp3`
3. Colócalo en: `assets/musica.mp3`

---

### Paso 4: Probar Localmente

Necesitas un servidor local. Desde la terminal, en la carpeta del proyecto:

```bash
npx -y serve .
```

O usa la extensión "Live Server" de VS Code.

Luego:
1. Abre la URL en tu **celular** (ej: `http://192.168.x.x:3000`)
2. Toca "Comenzar"
3. Muestra el collage en tu pantalla de computador
4. Apunta la cámara del celular al collage en pantalla
5. ¡Verás las flores, brillitos, y el mensaje "Te amo mi vida"! ✨

---

### Paso 5: Publicar en Vercel

1. Crea un repositorio en GitHub con estos archivos
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio
4. Deploy automático → obtienes una URL HTTPS
5. Comparte esa URL con tu novia cuando le des el cuadro

---

### Paso 6: Imprimir el Cuadro

Imprime `collage-cuadro-amor.png` en el tamaño que desees para tu cuadro físico.

> ⚠️ El cuadro debe verse lo más parecido posible al archivo digital para que el AR lo reconozca.

---

## 📁 Estructura del Proyecto

```
CuadroNovia/
├── index.html          ← Experiencia AR (página principal)
├── style.css           ← Estilos de la experiencia AR
├── collage.html        ← Herramienta para crear el collage
├── README.md           ← Este archivo
└── assets/
    ├── cuadro.mind     ← Archivo AR compilado (tú lo generas)
    ├── musica.mp3      ← "Para tu amor" - Juanes (tú lo agregas)
    └── flores/
        ├── flower1.png ← Flor rosa/hibisco
        ├── flower2.png ← Flor morada/cosmos
        └── flower3.png ← Flor amarilla/poppy
```

## 🛠 Tecnologías

- **MindAR.js** - Detección de imágenes (gratis, open-source)
- **A-Frame** - Escena 3D WebAR
- **HTML/CSS/JS** - Efectos visuales y animaciones
- **html2canvas** - Exportación del collage

## 💜 Hecho con amor
