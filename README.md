# 🛒 E-commerce Backend API

Ek mini E-commerce Backend REST API, jisme users signup/login kar sakte hain, products dekh sakte hain, cart mein add kar sakte hain, aur orders place kar sakte hain. Admin aur normal user ke liye alag permissions hain (Role-Based Access Control).

## 🚀 Features

- **User Authentication** — Signup aur Login, password securely hashed (bcrypt)
- **JWT-based Authorization** — Login ke baad token milta hai, protected routes ke liye use hota hai
- **Role-Based Access Control (RBAC)** — Sirf **Admin** product bana/edit/delete kar sakta hai; normal **User** sirf dekh sakta hai
- **Product CRUD** — Product banao, padho, edit karo, delete karo
- **Cart System** — User apne cart mein products add/remove kar sakta hai
- **Order System** — Cart se order place hota hai, aur order banne ke baad cart automatically khaali ho jaata hai
- **MongoDB Database** — Data permanently store hota hai (MongoDB Atlas)

## 🛠️ Tech Stack

| Technology | Kaam |
|---|---|
| **Node.js** | JavaScript runtime, server chalane ke liye |
| **Express.js** | Web framework, routes aur middleware ke liye |
| **MongoDB + Mongoose** | Database aur usse baat karne ka tareeka |
| **bcrypt** | Password ko hash (chupana) karne ke liye |
| **jsonwebtoken (JWT)** | Login token banane aur verify karne ke liye |
| **dotenv** | Environment variables (secrets) manage karne ke liye |

## 📂 Project Structure

```
Ecommerce-Project/
├── server.js         # Poora backend code (routes, schemas, middleware)
├── package.json       # Project ki dependencies ki list
├── .env               # Secret keys (MongoDB URI) — Git par upload nahi hota
└── README.md          # Ye file
```

## ⚙️ Setup / Installation

1. Repository clone karo:
```bash
git clone <tumhara-repo-link>
cd Ecommerce-Project
```

2. Dependencies install karo:
```bash
npm install
```

3. Root folder mein `.env` file banao aur apni MongoDB connection string daalo:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce
```

4. Server start karo:
```bash
node server.js
```

5. Server chalu ho jayega: `http://localhost:3000`

## 📡 API Endpoints

### Auth Routes

| Method | Endpoint | Kaam | Body |
|---|---|---|---|
| POST | `/signup` | Naya user banata hai (default role: `user`) | `{ "name", "email", "password" }` |
| POST | `/login` | Login karta hai, JWT token deta hai | `{ "email", "password" }` |

### Product Routes

| Method | Endpoint | Kaam | Auth Required? |
|---|---|---|---|
| GET | `/products` | Saare products dikhata hai |  Nahi |
| POST | `/products` | Naya product banata hai | ✅ Token + **Admin Role** |
| PUT | `/products/:id` | Product ko edit karta hai | ✅ Token + **Admin Role** |
| DELETE | `/products/:id` | Product ko delete karta hai | ✅ Token + **Admin Role** |

### Cart Routes

| Method | Endpoint | Kaam | Auth Required? |
|---|---|---|---|
| POST | `/cart/add` | Cart mein product add karta hai | ✅ Haan (Token) |
| GET | `/cart` | Apna cart dikhata hai | ✅ Haan (Token) |
| DELETE | `/cart/remove/:productId` | Cart se ek product hataata hai | ✅ Haan (Token) |

### Order Routes

| Method | Endpoint | Kaam | Auth Required? |
|---|---|---|---|
| POST | `/orders` | Cart se order place karta hai, cart khaali ho jaata hai | ✅ Haan (Token) |
| GET | `/orders` | Apne saare orders dikhata hai | ✅ Haan (Token) |

## 🔑 Authentication & Authorization kaise kaam karta hai

1. User `/signup` se account banata hai — password bcrypt se hash hoke save hota hai, role default `"user"` set hota hai
2. User `/login` karta hai — email/password sahi hone par ek **JWT token** milta hai
3. Protected routes use karne ke liye, token ko request ke **Header** mein bhejna hota hai:
```
Authorization: Bearer <tumhara-token>
```
4. **`verifyToken` middleware** — check karta hai token sahi hai ya nahi (login verification)
5. **`isAdmin` middleware** — `verifyToken` ke baad chalta hai, database se user ka `role` nikaal ke check karta hai ki wo `"admin"` hai ya nahi. Agar nahi, to `403 Forbidden` milta hai

```
Request → verifyToken (login check) → isAdmin (role check) → Route chalta hai
```

## 🔄 Cart → Order Flow

1. User `/cart/add` se products apne cart mein daalta hai (ek cart mein multiple products ho sakte hain — array of objects)
2. `/orders` call karne par, cart ka pura data ek naye `Order` document mein copy ho jaata hai
3. Order ban jaane ke baad, user ka cart automatically **khaali** kar diya jaata hai

## 🧪 Testing

API test karne ke liye **Thunder Client** (VS Code extension) use kiya gaya hai, kyunki browser sirf GET requests bhej sakta hai, POST/PUT/DELETE nahi.

