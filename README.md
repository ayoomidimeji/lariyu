# Lariyu Luxury Steps

A premium e-commerce platform for luxury footwear, built with a modern stack focusing on performance, security, and aesthetics.

![Lariyu Luxury Steps Banner](public/og-image.png)

## 🚀 Overview

Lariyu Luxury Steps is a full-stack application combining a high-performance React frontend with a secure Express backend. It features robust authentication, real-time database interactions, and sophisticated user interface components.

### Key Features
*   **Premium UI/UX**: Built with React, TailwindCSS, and Radix UI for accessible, stunning components.
*   **Secure Authentication**: Supabase Auth integration with custom email verification flows.
*   **Robust Backend**: Express server with comprehensive security measures:
    *   **Rate Limiting**: Multi-layer protection (Global, IP, Email, Device) using Redis.
    *   **Input Sanitization**: Global middleware to prevent XSS attacks using `xss` library.
    *   **Security Headers**: Implementation of Helmet for CSP and HSTS.
    *   **Bot Protection**: Exponential backoff (Slow Down) for sensitive endpoints.
*   **Database**: Supabase (PostgreSQL) for reliable data storage and real-time capabilities.
*   **Email Service**: Nodemailer integration for transactional emails.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Language**: TypeScript
*   **Styling**: [TailwindCSS](https://tailwindcss.com/)
*   **Components**: [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/)
*   **State/Data**: React Query (@tanstack/react-query)
*   **Routing**: React Router DOM

### Backend
*   **Server**: Node.js + Express
*   **Database**: Supabase (PostgreSQL)
*   **Caching/Rate Limiting**: Redis
*   **Security**: Helmet, XSS, Express Rate Limit
*   **Email**: Nodemailer

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+ recommended)
*   pnpm (v9+ recommended)
*   Redis (optional, for production-grade rate limiting)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/lriyu-luxury-steps.git
cd lriyu-luxury-steps
```

### 2. Install Dependencies
This project uses a unified package structure. Install dependencies from the root:
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. You can use `.env.example` as a reference if available.

**Required Variables:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Service (Gmail Example)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_specific_password

# Optional: Rate Limiting (Redis)
# If not provided, server defaults to in-memory store
REDIS_URL=redis://localhost:6379

# Ops
REDIRECT_URL=http://localhost:5173/email-confirmation
ADDITIONAL_ALLOWED_ORIGINS=http://localhost:5173,https://your-production-domain.com
```

### 4. Running the Application

**Development (Frontend + Backend)**
It's recommended to run frontend and backend in separate terminals for easier log monitoring.

Terminal 1 (Frontend):
```bash
pnpm dev
```

Terminal 2 (Backend):
```bash
pnpm server
```

The frontend will start at `http://localhost:5173` and the backend at `http://localhost:3000`.

## 🔒 Security Measures

### Input Sanitization
A global middleware automatically sanitizes `req.body`, `req.query`, and `req.params` to strip malicious scripts, preventing Cross-Site Scripting (XSS) via the `xss` library.

### Rate Limiting Strategies
*   **Global Limit**: 300 requests / 15 mins.
*   **Signup IP Limit**: 5 accounts / hour per IP.
*   **Signup Email Limit**: 3 attempts / hour per email.
*   **Signup Device Limit**: 5 attempts / hour per device fingerprint.
*   **Slow Down**: Delays responses after 2 consecutive requests to `signup`.

### SQL Injection
Protected via Supabase's parameterized queries options.

## 🧪 Testing

The backend includes verification scripts for security features.

```bash
# Verify Sanitization
node server/test-sanitization.js

# Verify Rate Limiting
node server/test-rate-limit.js
```

## 📂 Project Structure

```
├── public/              # Static assets
├── server/              # Express backend code
│   ├── index.js         # Main server entry point
│   ├── test-*.js        # Security verification scripts
├── src/                 # React frontend code
│   ├── components/      # Reusable UI components
│   ├── pages/           # Application routes/pages
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities (Supabase client, utils)
├── .env                 # Environment variables (do not commit)
├── package.json         # Project dependencies and scripts
└── vite.config.ts       # Vite configuration
```

## 📄 License
Private (Proprietary). All rights reserved.
