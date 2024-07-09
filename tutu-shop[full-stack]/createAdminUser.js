const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createAdminUser = async () => {
    const username = 'admin';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'admin';

    await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        [username, hashedPassword, role]
    );

    console.log('Admin user created');
    pool.end();
};

createAdminUser();