const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const multer = require('multer')
const cloudinary = require('cloudinary').v2;
const fs = require("fs");
const bcrypt = require('bcrypt');
let session = require('express-session')

require('dotenv').config();

const upload = multer({ dest: "uploads/" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const app = express();
const PORT = process.env.PORT || 3001

app.use(session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2
    }
}));

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true
}));

app.set("trust proxy", 1);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get('/', (req, res) => {

    console.log("Hello world");
    res.send("Hello world")

})

app.get('/pins', async (req, res) => {

    const pins = await pool.query('SELECT * FROM pins');
    res.send(pins.rows)

})

app.post('/register-user', upload.none(), async (req, res) => {

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await pool.query(
            'SELECT 1 FROM users WHERE username = $1 LIMIT 1',
            [username]
        );


        if (existingUser.rowCount > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: newUser.id
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Server error" });
    }


})

app.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length == 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
        };

        res.json({ message: "Login success" });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
})

app.post('/registerPin', upload.single('pic'), async (req, res) => {

    try {

        if (!req.session.user) return res.status(400).json({ message: "You are not logged in" })

        const { name, lat, lng } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const uploadCloudinary = await cloudinary.uploader.upload(req.file.path, {
            folder: "Dustbin Tracker App/UnapprovedPins",
        });

        const public_id = uploadCloudinary.public_id
        const url = uploadCloudinary.secure_url;

        const insert = await pool.query('INSERT INTO unapproved_pins (name, lat, lng, pic_link, public_id, user_id) VALUES ($1, $2, $3, $4, $5, $6)', [name, lat, lng, url, public_id, req.session.user.id])

        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("Failed to delete local file:", err);
            }
        });

        res.json(insert)

    } catch (err) {

        console.log(err)
        res.status(500).json({ error: "Something went wrong" });
    }
})

app.get('/auth/profile', (req, res) => {

    let user = req.session.user
    if (req.session.user) {
        res.json({ loggedIn: true, id: user.id, username: user.username, isAdmin: user.isAdmin })
    } else {
        res.status(200).json({ loggedIn: false })
    }
})

app.get('/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.send('Error destroying session');
        } else {
            res.send('Session destroyed');
        }
    });
});

app.get('/unapproved-pins', async (req, res) => {

    let user = req.session.user

    if (!user) {
        return res.status(400).json({ message: "Not logged in" })
    }

    if (!user.isAdmin) {
        return res.status(400).json({ message: "Not admin" })
    }

    try {

        let unapproved_pins = await pool.query(`SELECT unapproved_pins.id, unapproved_pins.name, unapproved_pins.lat, unapproved_pins.lng, unapproved_pins.pic_link, users.username FROM unapproved_pins INNER JOIN users ON unapproved_pins.user_id = users.id`)
        return res.status(200).json(unapproved_pins.rows)

    } catch (err) {

        console.log(err)
        return res.status(500).send("Something went wrong..")
    }

})

app.post('/delete-pin', async (req, res) => {

    let user = req.session.user

    if (!user) {
        return res.status(400).json({ message: "Not logged in" })
    }

    if (!user.isAdmin) {
        return res.status(400).json({ message: "Not admin" })
    }

    try {

        let public_id = await pool.query('SELECT public_id FROM unapproved_pins WHERE id=$1 LIMIT 1', [req.body.id]);
        await cloudinary.uploader.destroy(public_id.rows[0].public_id);
        let delete_pin = await pool.query('DELETE FROM unapproved_pins WHERE id=$1', [req.body.id])

        return res.status(200).json(delete_pin)

    } catch (err) {
        console.log(err)
        return res.status(500).send("Something went wrong..")
    }

})

app.post('/approve-pin', async (req, res) => {

    let user = req.session.user

    if (!user) {
        return res.status(400).json({ message: "Not logged in" })
    }

    if (!user.isAdmin) {
        return res.status(400).json({ message: "Not admin" })
    }

    try {

        let q = await pool.query('SELECT * FROM unapproved_pins WHERE id=$1 LIMIT 1', [req.body.id])

        let selected = q.rows[0]

        const uploadCloudinary = await cloudinary.uploader.upload(selected.pic_link, {
            folder: "Dustbin Tracker App/ApprovedPins",
        });

        const insert = await pool.query('INSERT INTO pins (name, lat, lng, pic_link) VALUES ($1, $2, $3, $4)', [selected.name, selected.lat, selected.lng, uploadCloudinary.secure_url])

        await cloudinary.uploader.destroy(selected.public_id);
        await pool.query('DELETE FROM unapproved_pins WHERE id=$1', [req.body.id])

        return res.status(200).json(insert)

    } catch (err) {
        console.log(err)
        return res.status(500).send("Something went wrong..")
    }
})

app.listen(PORT, () => {

    console.log(`App listening at port ${PORT}`)
})

module.exports = app;