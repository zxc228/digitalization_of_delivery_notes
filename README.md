# **Final Project 2025 — Digitalization of Delivery Notes API**

This is a RESTful API built with **Node.js** and **Express** for managing clients, projects, and delivery notes with signature and PDF generation.

---

## **Features**
- User registration and login with JWT
- Email verification via 6-digit code (Mailhog)
- Onboarding personal and company data
- Profile image upload (via multer)
- Password recovery and reset via token
- CRUD operations for clients and projects
- Delivery notes with hours/materials
- PDF generation (with signature)
- Signature storage via IPFS
- Swagger documentation for all endpoints
- Centralized error handling and logging
- Jest tests for all core endpoints
---

## **Tech Stack**

- **Node.js / Express**
- **PostgreSQL** (via Docker)
- **Multer, pdfkit, bcrypt, jsonwebtoken**
- **Mailhog** for email testing
- **IPFS** (via Docker) for signature/PDF storage
- **Swagger** for API docs
- **Jest** for testing

---

## **Folder Structure**

``` bash
digital-notes-api/
├── controllers/      # Request logic
├── models/           # DB access
├── middleware/       # Auth & validation
├── routes/           # Route definitions
├── utils/            # PDF, IPFS, Mail
├── tests/            # Jest test files
├── db/init.sql       # Initial DB schema
├── docs/             # Swagger YAML
├── .envexample       # Example environment config
├── docker-compose.yml
└── index.js
```

## **Getting Started**

**Prerequisites:**
  - Docker & Docker Compose


1. **Start Services (DB, Mailhog, IPFS)**
    ```bash
    docker compose up -d
    ```
    This will:
    - Start PostgreSQL
    - Start Mailhog at http://localhost:8025
    - Start IPFS node on http://localhost:5001 (API) and http://localhost:8080/ipfs (gateway)

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Create `.env` from template**
    ```bash
    cp .envexample .env
    ```
    Edit values like `JWT_SECRET`, etc. as needed.

4. **Start the server**
    ```bash
    npm run dev
    ```
    Server runs at http://localhost:3000

---

## **API Documentation**

All endpoints are documented in Swagger.

- Access at: http://localhost:3000/api-docs

Includes:
- Auth (register, login, reset, validation)
- Clients (CRUD, archive/restore)
- Projects (CRUD, archive/restore)
- Delivery Notes (create, get, sign, PDF)
- Protected routes via JWT

---

## **Testing**
- All routes are covered with **Jest** and **Supertest**
```bash
npx jest
```
--- 

## **Status**
- ✅ Fully implemented
- ✅ Swagger-documented
- ✅ Jest-tested
- ✅ Ready for deployment or grading