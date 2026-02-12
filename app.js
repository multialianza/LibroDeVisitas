// Importamos los módulos necesarios.
// express → framework para crear el servidor web.
// fs → módulo nativo de Node.js para trabajar con archivos (persistencia).
// path → módulo nativo para manejar rutas de archivos de forma segura.

// Creamos la aplicación Express.
// Aquí aplicamos el concepto de inicialización del servidor.

// Definimos el puerto en el que el servidor escuchará las peticiones.
// El puerto 3000 es común en entornos de desarrollo.
// Separarlo en una constante es una buena práctica,
// ya que facilita cambiarlo más adelante o usar variables de entorno.

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para procesar datos de formularios (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// RUTA GET: Leer y mostrar mensajes
app.get('/', (req, res) => {
    try {
        // 1. Leer el archivo de forma síncrona
        const datosRaw = fs.readFileSync('mensajes.json', 'utf-8');
        
        // 2. Convertir string a array de objetos
        const mensajes = JSON.parse(datosRaw);

        // 3. Generar HTML simple para mostrar los mensajes
        let listadoHtml = mensajes.map(m => `
            <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                <strong>${m.usuario}:</strong>
                <p>${m.mensaje}</p>
            </div>
        `).join('');

        // 4. Leer el index.html y "inyectar" los mensajes (Simulando un motor de plantillas simple)
        let htmlBase = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
        let paginaFinal = htmlBase.replace('<div id="contenedor-mensajes"></div>', `<div id="contenedor-mensajes">${listadoHtml}</div>`);

        res.send(paginaFinal);
    } catch (error) {
        res.status(500).send("Error al leer el libro de visitas.");
    }
});

// RUTA POST: Guardar nuevo mensaje
app.post('/nuevo-mensaje', (req, res) => {
    const { usuario, mensaje } = req.body;

    if (usuario && mensaje) {
        // 1. Leer el archivo actual
        const datosRaw = fs.readFileSync('mensajes.json', 'utf-8');
        const mensajes = JSON.parse(datosRaw);

        // 2. Agregar el nuevo objeto
        mensajes.push({ usuario, mensaje, fecha: new Date().toLocaleString() });

        // 3. Escribir de vuelta en el archivo JSON
        fs.writeFileSync('mensajes.json', JSON.stringify(mensajes, null, 2));

        // 4. Redirigir al home para ver el cambio
        res.redirect('/');
    } else {
        res.status(400).send("Faltan campos requeridos.");
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});