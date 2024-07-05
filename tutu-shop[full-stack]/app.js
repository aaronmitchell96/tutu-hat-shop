const express = require("express");
const multer = require("multer");
const path = require('path');
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Configure PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Set up storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + path.extname(file.originalname);
        cb(null, filename);
    },
});

const upload = multer({ storage: storage });

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve images statically

// Route to render upload page
app.get("/upload", (req, res) => {
    res.render("upload");
});

// Route to handle image upload
app.post("/upload", upload.single("image"), async (req, res) => {
    const filename = req.file.filename;
    const filepath = req.file.path;
    await pool.query('INSERT INTO images (filename, path) VALUES ($1, $2)', [filename, filepath]);
    res.send("Image uploaded");
});

// Route to render the gallery page
app.get("/gallery", async (req, res) => {
    const result = await pool.query('SELECT * FROM images');
    const images = result.rows;
    res.render("gallery", { images: images });
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});