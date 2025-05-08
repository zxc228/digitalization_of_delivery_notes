CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    validation_code CHAR(6),
    validation_attempts INT DEFAULT 0,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255)
);


CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    surname VARCHAR(100),
    nif VARCHAR(20)
);

CREATE TABLE user_companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    cif VARCHAR(50),
    address TEXT
);

CREATE TABLE user_images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT
);


ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;