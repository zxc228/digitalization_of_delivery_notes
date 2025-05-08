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

-- ====== Clients ======
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====== Projects ======
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====== Delivery Notes ======
CREATE TABLE delivery_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    signed BOOLEAN DEFAULT FALSE,
    signature_url TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====== Delivery Note Items ======
CREATE TABLE delivery_note_items (
    id SERIAL PRIMARY KEY,
    delivery_note_id INTEGER REFERENCES delivery_notes(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('hour', 'material')),
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2),
    total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
