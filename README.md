# SecureBank — Heritage Trust Banking

A full-stack simulated retail banking platform built with React + Express + MongoDB.

## Features
- **Landing page** with animated diagonal line pattern
- **Registration** with split-panel layout
- **Sign in with OTP 2FA** — credentials + 6-digit code (shown in demo mode)
- **Dashboard** — total balance, accounts list, recent activity
- **Open accounts** — Savings (2.4% APY) or Current (0.1%)
- **Fund transfers** — OTP required for $1,000+
- **Fraud engine** — flags transfers over $10K or high velocity (5+ in 1hr)
- **Paginated transactions** ledger with filters
- **Monthly statements** — downloadable as HTML/PDF
- **Admin seed** — admin@securebank.com / Admin@12345

## Tech Stack
- **Frontend**: React 18, React Router 6, Vite
- **Backend**: Express 4, MongoDB + Mongoose
- **Auth**: JWT + bcrypt + OTP via nodemailer (or console in dev)

## Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) OR MongoDB Atlas URI

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET at minimum
```

Minimum `.env`:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/securebank
JWT_SECRET=change-this-to-a-long-random-string
```

### 4. Run in development
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Using Supabase instead of MongoDB

If you prefer Supabase (PostgreSQL), replace the Mongoose models with Supabase client calls.

Install:
```bash
npm install @supabase/supabase-js
```

Create these tables in Supabase:
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  phone text,
  password text not null,
  role text default 'user',
  otp text,
  otp_expiry timestamptz,
  created_at timestamptz default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  account_number text unique not null,
  type text check (type in ('savings','current')),
  balance numeric default 0,
  status text default 'active',
  interest_rate numeric,
  created_at timestamptz default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  from_account uuid references accounts(id),
  to_account uuid references accounts(id),
  from_account_number text,
  to_account_number text,
  user_id uuid references users(id),
  type text check (type in ('credit','debit','deposit')),
  amount numeric not null,
  description text,
  counterparty text,
  balance_after numeric,
  flagged boolean default false,
  flag_reason text,
  created_at timestamptz default now()
);
```

## Demo Credentials
- **Admin**: admin@securebank.com / Admin@12345
- OTP will appear on screen in demo mode and in the server console

## Architecture
```
securebank/
├── server/
│   ├── index.js          # Express entry, MongoDB connect, admin seed
│   ├── models/           # User, Account, Transaction
│   ├── routes/           # auth, accounts, transactions, statements, admin
│   └── middleware/       # auth (JWT), otp (generate + send)
└── client/
    └── src/
        ├── pages/        # Landing, Register, Login, Dashboard, Transfer, Transactions, Statements
        ├── components/   # AppNav
        ├── context/      # AuthContext
        └── lib/          # api.js (fetch wrapper)
```
