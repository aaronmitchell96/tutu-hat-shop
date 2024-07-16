-- -- Users Table
-- CREATE TABLE users (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user'))
-- );

-- -- Images Table
-- CREATE TABLE images (
--     id SERIAL PRIMARY KEY,
--     filename VARCHAR(255) NOT NULL,
--     path VARCHAR(255) NOT NULL,
--     category VARCHAR(50) NOT NULL,
--     gender VARCHAR(10) NOT NULL CHECK (gender IN ('men', 'women', 'unisex')),
--     type VARCHAR(50) NOT NULL,
--     color VARCHAR(50) NOT NULL,  -- Added color field
--     details TEXT,                -- Added details field
--     price DECIMAL(10, 2) NOT NULL,
--     name VARCHAR(100) NOT NULL,
--     parent_id INT REFERENCES images(id) ON DELETE CASCADE,
--     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- session_table.sql

-- CREATE TABLE "session" (
--     "sid" varchar NOT NULL COLLATE "default",
--     "sess" json NOT NULL,
--     "expire" timestamp(6) NOT NULL
-- )
-- WITH (OIDS=FALSE);

-- ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

-- CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- CREATE TABLE sizes (
--     id SERIAL PRIMARY KEY,
--     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
--     size VARCHAR(50) NOT NULL,
--     quantity INTEGER NOT NULL
-- );