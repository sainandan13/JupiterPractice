const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // Change this to your actual PostgreSQL database name
    password: 'root',
    port: 5432,
});

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        console.log("Checking existing user..."); // Debugging

        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (!existingUser || !existingUser.rows) {  // ✅ Debugging for 'rows' issue
            console.error("Database query failed: No response from pool.query()");
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        console.log("Hashing password..."); // Debugging
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Inserting user into database..."); // Debugging
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, role]
        );

        if (!newUser || !newUser.rows) {  // ✅ Debugging for 'rows' issue
            console.error("Database insert failed: No response from pool.query()");
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        return res.status(201).json({ success: true, message: 'User registered successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch user from PostgreSQL
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const user = result.rows[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '1h' });

        res.json({ success: true, token, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Middleware to protect routes
exports.verifyToken = (req, res, next) => {
    // Check header or url parameters or post body for token
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
        }
        req.user = decoded;
        next();
    });
};
