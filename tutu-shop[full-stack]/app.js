const express = require("express");
const multer = require("multer");
const path = require('path');
const { Pool } = require("pg");
const dotenv = require("dotenv");
const session = require("express-session");
const bcrypt = require("bcrypt")

dotenv.config();

const app = express();

// Configure PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Set up session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Middleware to make session data available to all views
app.use((req, res, next) => {
    console.log("Session User:", req.session.user)
    res.locals.user = req.session.user;
    next();
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

// Render the login page
app.get("/login", (req, res) => {
    res.render("login", { activePage: 'login'});
});

// Handle login form submission
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    console.log(user)

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { id: user.id, username: user.username, role: user.role };
        console.log("User logged in: ", req.session.user); // Log session user after setting it
        res.redirect("/gallery");
    } else {
        res.send("Invalid username or password");
    }
});

// Handle logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// Middleware to restrict access to the upload route
function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send("Access denied");
    }
}

//Route to render home page
app.get("/", (req, res) => {
    res.render("home", { activePage: 'home' });
})

// Route to render upload page
app.get("/upload", requireAdmin, (req, res) => {
    res.render("upload", { activePage: 'upload' });
});

// Route to handle image upload
app.post("/upload", upload.single("image"), async (req, res) => {
    const { category, gender, menHatType, womenHatType, accessoryType, price, name } = req.body;
    const filename = req.file.filename;
    const filepath = req.file.path;
    let itemType = "";

    if (category === "hat") {
        itemType = gender === "men" ? menHatType : womenHatType;
    } else if (category === "accessory") {
        itemType = accessoryType;
    }

    // Check for existing record
    const result = await pool.query(
        'SELECT id FROM images WHERE category = $1 AND gender = $2 AND type = $3 AND name = $4 AND parent_id IS NULL',
        [category, gender, itemType, name]
    );

    let parent_id = null;
    if (result.rows.length > 0) {
        parent_id = result.rows[0].id;
    }

    // Insert new image with or without parent_id
    await pool.query(
        'INSERT INTO images (filename, path, category, gender, type, price, name, parent_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [filename, filepath, category, gender, itemType, price, name, parent_id]
    );

    res.send("Image uploaded");
});

// Route to render the gallery page
app.get("/gallery", async (req, res) => {
    const result = await pool.query('SELECT * FROM images');
    const images = result.rows;

    // Organize images into a hierarchy
    const imageMap = {};
    images.forEach(image => {
        if (!image.parent_id) {
            imageMap[image.id] = { ...image, children: [] };
        }
    });

    images.forEach(image => {
        if (image.parent_id) {
            if (imageMap[image.parent_id]) {
                imageMap[image.parent_id].children.push(image);
            }
        }
    });

    const organizedImages = Object.values(imageMap);

    res.render("gallery", { images: organizedImages, activePage: 'gallery' });
});
// Route to render image details page
app.get("/image/:id", async (req, res) => {
    const imageResult = await pool.query('SELECT * FROM images WHERE id = $1', [req.params.id]);
    const image = imageResult.rows[0];

    if (image) {
        let parentImage = null;
        if (image.parent_id) {
            const parentImageResult = await pool.query('SELECT * FROM images WHERE id = $1', [image.parent_id]);
            parentImage = parentImageResult.rows[0];
        }

        const parentId = image.parent_id ? image.parent_id : image.id;
        const childImagesResult = await pool.query('SELECT * FROM images WHERE parent_id = $1', [parentId]);
        const childImages = childImagesResult.rows;

        res.render("image-details", { image: image, childImages: childImages, parentImage: parentImage, activePage: 'image-details' });
    } else {
        res.status(404).send("Image not found");
    }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});