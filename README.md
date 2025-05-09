# Partial Practice 2025 — User Management API

This is a backend RESTful API built with **Node.js** and **Express** that handles complete user management.  

---


## Features

- User registration with email + password
- Email verification with 6-digit code
- Login with JWT authentication
- Onboarding personal & company data
- Profile image upload (with `multer`)
- JWT-protected routes (get, delete user)
- Password recovery & reset via token
- Dashboard statistics summary

---


## Tech Stack

- **Node.js / Express**
- **PostgreSQL** (via Docker)
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for image uploads
- **Docker Compose** for isolated DB setup

---

## Folder Structure

```bash
project_partial_express/
├── controllers/        # Request logic
├── models/             # DB queries
├── middleware/         # JWT auth
├── routes/             # All API endpoints
├── db/init.sql         # Schema setup
├── .env                # Environment config
├── docker-compose.yml  # PostgreSQL service
└── index.js            # App entry point
```

---

## 🚀 Getting Started

### Prerequisites:
- Docker
- Docker Compose

---

### 1. Start PostgreSQL (Docker)

```bash
# 1. Остановить и удалить контейнер + том
docker compose down -v
#            └── -v  = одновременно удалить все анонимные и именованные тома,
#                     указанные в файле (в вашем случае — pgdata)

# 2. (Необязательно) убедиться, что том действительно ушёл
docker volume ls          # должен исчезнуть том pgdata
# или принудительно снести всё, что не используется
docker volume prune       # ← потребует подтверждения

# 3. Запустить заново — PostgreSQL создастся с нуля и применит init.sql
docker compose up -d
```
- This will:
    - Create a `user_management` database
    - Run schema from db/init.sql
    - Map port 5432 to local machine

### 2. Install dependencies
```bash
npm install
```

### 3. Create a .env file

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=user_management
JWT_SECRET=supersecret
```

### 4. Run the server

```bash
npm run dev
```
- server starts at http://localhost:3000

---

## API Endpoints

All protected routes require a valid Authorization: Bearer <JWT> header.

---

### 1. Register

`POST /api/user/register`

```json
{
  "email": "user@example.com",
  "password": "12345678"
}
```

Response:
- { token, user }
- A 6-digit code is logged to the console for testing

--- 

### 2. Validate Email

`PUT /api/user/validate`

```json
{
  "code": "123456"
}
```
**Requires JWT.**

Marks user as validated.

---

### 3. Login
`POST /api/user/login`

```json
{
  "email": "user@example.com",
  "password": "12345678"
}
```
Returns { token, user } on success.

---

### 4. Onboarding Personal Data

`PUT /api/user/register`




```json
{
  "name": "Anna",
  "surnames": "Smith",
  "nif": "12345678X"
}
```
**Requires JWT.**


---
### 4.1 Add Company Data / Self-Employed

```json
{
  "name": "Anna",
  "surnames": "Smith",
  "nif": "12345678X",
  "company_name": "MyCorp",
  "cif": "ES99887766",
  "address": "Main Street, 1"
}
```
**Requires JWT.**

or


```json 
{
  "name": "Anna",
  "surnames": "Smith",
  "nif": "12345678X",
  "selfEmployed": true
}
```
**Requires JWT.**

---

### 5. Upload Profile Image

`PATCH /api/user/profile-image`


- multipart/form-data
- Field name: profile_image

**Requires JWT.**

Returns imageUrl.

---

### 6.1 Get My Data

`GET /api/user/me`

**Requires JWT.**

Returns current user info.
---


### 6.2 Delete My Account

`DELETE /api/user/me?soft=false` → permanently delete

**Requires JWT.**

```bash
DELETE /api/user/me?soft=false
```

---

### 6.3 Password Recovery

*Step 1:* Generate token
`POST /api/user/recover-password`

```json
{
  "email": "user@example.com"
}
```

Returns reset token (printed for dev purposes).

--- 
*Step 2:* Reset password

`POST /api/user/reset-password`

```bash
{
  "token": "<reset_token>",
  "new_password": "newpass123"
}
```

--- 
### 6.4 Dashboard Summary

`GET /api/user/summary`

**Requires JWT.**

Returns:

```json
{
  "numActiveUsers": 10,
  "numDeletedUsers": 2,
  "numInactiveUsers": 1,
  "numActiveCompanyUsers": 5,
  "numActivePersonalUsers": 5
}
```

## Example of Api calls

https://.postman.co/workspace/My-Workspace~7139ffc0-6751-418e-84d1-9eb6b9569f77/collection/21237380-29b8fbf6-250d-48d4-adf1-6edcca39b7c2?action=share&creator=21237380


## Status
All endpoints completed, tested, and fully working.

Ready for deployment or grading.