// const bcrypt = require('bcrypt');
// const { Pool } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

// const createAdminUser = async () => {
//     const username = 'elsa';
//     const password = 'admin';
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const role = 'admin';

//     await pool.query(
//         'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
//         [username, hashedPassword, role]
//     );

//     console.log('Admin user created');
//     pool.end();
// };

// createAdminUser();

const bcrypt = require('bcrypt');

const password = 'admin'; // Replace with the desired admin password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error(err);
    } else {
        console.log(hash); // Save this hash for use in the SQL file
    }
});