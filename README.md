

# Enterprise Procurement Platform

A full-stack procurement and vendor management system for organizations that need to control purchasing, approvals, budgets, contracts, and inventory in one place. The platform digitizes the procurement lifecycle end-to-end — from purchase requests and RFQs to purchase orders, deliveries, and spend analytics — with role-based access, real-time notifications, and full audit trails.

## Features

- **Purchase Requests & Orders** — Create, review, and track purchase requests through to fulfilled purchase orders.
- **Vendor Management** — Maintain vendor profiles, bank accounts, and status tracking.
- **RFQ / Quotations** — Request quotes from vendors and compare pricing before awarding orders.
- **Approval Workflows** — Multi-step, role-based approval routing for requests and orders.
- **Budget Management** — Track department budgets, utilization, and automated alerts when thresholds are hit.
- **Contract Management** — Store contracts and get automated reminders ahead of renewal or expiry dates.
- **Inventory Tracking** — Monitor stock levels and pending deliveries.
- **Analytics Dashboard** — Vendor performance rankings, budget utilization, department spend, and contract compliance, visualized with charts.
- **Audit Logging** — Immutable log of key actions for compliance and traceability.
- **Real-Time Notifications** — Live updates via WebSockets (Socket.IO) for approvals, deliveries, and alerts.
- **Role-Based Access Control** — Granular permissions (e.g., admin, procurement officer) enforced on both API and UI.

## Tech Stack

**Backend**
- Node.js / Express 5
- MongoDB with Mongoose
- Redis + BullMQ (background jobs and queues)
- Socket.IO (real-time events)
- JWT authentication, bcrypt password hashing
- Joi (validation), Helmet, CORS, rate limiting, compression
- Nodemailer (email), node-cron (scheduled jobs)

**Frontend**
- React 18 with Vite
- Material UI (MUI) + Emotion
- Zustand (state management)
- TanStack Query (server state / data fetching)
- Recharts (data visualization)
- Axios, Socket.IO client, React Router

## Project Structure

```
Enterprise-Procurement-Platform/
├── backend/
│   ├── src/
│   │   ├── config/        # Database & Redis configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── jobs/          # Scheduled jobs (budget alerts, contract reminders)
│   │   ├── middleware/    # Auth, upload, role restriction
│   │   ├── models/        # Mongoose schemas
│   │   ├── queues/        # BullMQ email queue
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Shared helpers (calculators, error handling)
│   │   └── validations/   # Joi validation schemas
│   ├── app.js              # Express app setup
│   └── start.js            # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Data-fetching & utility hooks
│   │   ├── pages/         # Route-level pages
│   │   ├── routes/        # App routing & protected routes
│   │   ├── stores/        # Zustand stores
│   │   ├── lib/           # API client & socket setup
│   │   └── theme/         # MUI theme configuration
│   └── vite.config.js
└── package.json
```

## Prerequisites

- Node.js 18+
- MongoDB (local instance or Atlas)
- Redis (optional — used for caching, job queues, and budget/contract background jobs)
- SMTP credentials (optional — used for email notifications)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Omar-Hashmi/Enterprise-Procurement-Platform.git
cd Enterprise-Procurement-Platform
```

### 2. Configure environment variables

Create a `.env` file inside `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/procurement-db
JWT_SECRET=your_jwt_secret

# Optional — Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Optional — SMTP (email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASSWORD=password
SMTP_FROM=procurement@example.com
```

Create a `.env` file inside `frontend/` (see `frontend/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the app in development

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

The API runs on `http://localhost:5000` and the frontend dev server on the port Vite assigns (typically `http://localhost:5173`).

### 5. Build for production

```bash
cd frontend
npm run build
```

```bash
cd backend
npm start
```

## API Overview

All endpoints are prefixed with `/api`.

| Resource | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Register, login, profile, password reset |
| Users | `/api/users` | User management |
| Purchase Requests | `/api/purchase-requests` | Create and track purchase requests |
| Vendors | `/api/vendors` | Vendor profiles & bank accounts |
| Quotations (RFQ) | `/api/quotations` | Request and manage vendor quotes |
| Purchase Orders | `/api/purchase-orders` | Create and track purchase orders |
| Approvals | `/api/approvals` | Approval workflow actions |
| Audit Logs | `/api/audit-logs` | Admin-only action history |
| Budgets | `/api/budgets` | Department budgets & utilization |
| Contracts | `/api/contracts` | Contract lifecycle management |
| Inventory | `/api/inventory` | Stock levels & pending deliveries |
| Analytics | `/api/analytics` | Dashboards, vendor rankings, spend trends |

## Testing

```bash
npm test
```

Runs the test suite covering authentication, workflow, purchase orders, notifications, and audit logs (using `mongodb-memory-server` for an isolated test database).

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

