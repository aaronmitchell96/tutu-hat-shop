const express = require("express");
const app = express();
const path = require('path');
const multer = require("multer");

// Set up storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.set("view engine", "ejs");

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to render upload page
app.get("/upload", (req, res) => {
    res.render("upload");
});

// Route to handle image upload
app.post("/upload", upload.single("image"), (req, res) => {
    res.send("Image uploaded");
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});