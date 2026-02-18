# Expense Tracker

A full-stack expense tracking web application built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend. Supports adding, filtering, and sorting expenses with built-in idempotency to handle duplicate submissions gracefully.

---
## Features

- **Add expenses** with amount, category, description, and date
- **Filter** expenses by category
- **Sort** expenses by date (newest or oldest first)
- **Live total** of currently visible expenses updates with filters
- **Idempotency** — safe against double-clicks, page refreshes mid-submit, and network retries
- **Error & loading states** shown clearly in the UI
- Fully responsive layout

---

## Project Structure

```
expense-tracker/
├── backend/                     # Express + MongoDB API
│   ├── src/
│   │   ├── models/
│   │   │   └── Expense.js       # Mongoose schema with Decimal128 for money
│   │   ├── routes/
│   │   │   └── expenses.js      # POST /expenses, GET /expenses
│   │   ├── middleware/
│   │   │   └── errorHandler.js  # Centralised error handling
│   │   └── app.js               # Express app entry point
│   ├── .env.example             # Environment variable template
│   ├── package.json
│   └── README.md
│
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── api/
│   │   │   └── expenses.js      # Axios API calls
│   │   ├── components/
│   │   │   ├── ExpenseForm.jsx  # Add expense form
│   │   │   ├── ExpenseTable.jsx # Expenses list/table
│   │   │   ├── FilterBar.jsx    # Category filter + sort controls
│   │   │   ├── Summary.jsx      # Total amount display
│   │   │   └── StatusMessage.jsx# Success/error feedback
│   │   ├── hooks/
│   │   │   └── useExpenses.js   # All state and data fetching logic
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | HTTP server and routing |
| MongoDB | Database |
| Mongoose | ODM — schema definition and queries |
| Decimal128 | Precise monetary value storage |
| dotenv | Environment variable management |
| cors | Cross-origin resource sharing |
| helmet | Secure HTTP headers |
| morgan | HTTP request logging |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Axios | HTTP client |
| CSS (vanilla) | Styling — no UI library |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud-hosted database |
| Render | Backend hosting (Node.js) |
| Vercel | Frontend hosting |
| GitHub | Source control + auto-deploy trigger |

---

## Key Design Decisions

### Why MongoDB?
- **Flexible schema** — expense categories and metadata can evolve without migrations
- **Decimal128 type** — native support for precise monetary values, avoiding floating-point rounding errors common with JavaScript's `Number` (e.g. `0.1 + 0.2 !== 0.3`)
- **Atomic unique indexes** — make idempotency enforcement simple and race-condition safe
- **JSON-native** — documents map directly to API responses with zero transformation overhead

### Idempotency
Every `POST /expenses` request must include an `Idempotency-Key` header containing a UUID. The server stores this key alongside the expense record with a unique index.

- If the same key arrives more than once (double-click, retry, page refresh), the server returns the **original response** — no duplicate is created
- The frontend generates a new UUID **only after a successful submission**, so retries before success always reuse the same key
- A MongoDB unique index handles the race condition where two identical requests arrive simultaneously

---

## Getting Started (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
```

Start the backend server:

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### 3. Set up the Frontend

Open a new terminal tab:

```bash
cd frontend
npm install
```

Create a `.env.development` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

Base URL (local): `http://localhost:5000`  
Base URL (production): `https://expense-tracker-backend.onrender.com`

---

### `GET /health`

Health check endpoint.

**Response**
```json
{ "status": "ok" }
```

---

### `POST /expenses`

Create a new expense.

**Headers**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | ✅ | `application/json` |
| `Idempotency-Key` | ✅ | A UUID (e.g. from `crypto.randomUUID()`) |

**Request Body**

```json
{
  "amount": "25.50",
  "category": "Food",
  "description": "Lunch at work",
  "date": "2024-01-15"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | string or number | ✅ | Positive number, stored as Decimal128 |
| `category` | string | ✅ | Expense category |
| `description` | string | ❌ | Optional details |
| `date` | ISO date string | ✅ | Date of the expense |

**Responses**

| Status | Meaning |
|--------|---------|
| `201 Created` | Expense created successfully |
| `200 OK` | Duplicate key — original expense returned (idempotent) |
| `400 Bad Request` | Missing required fields or `Idempotency-Key` header |
| `500 Internal Server Error` | Server error |

**Example Response**
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "amount": "25.50",
  "category": "Food",
  "description": "Lunch at work",
  "date": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-15T12:30:00.000Z",
  "updatedAt": "2024-01-15T12:30:00.000Z"
}
```

---

### `GET /expenses`

Retrieve a list of expenses with optional filtering and sorting.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category (case-insensitive) |
| `sort` | string | `date_desc` for newest first, `date_asc` for oldest first |

**Examples**

```
GET /expenses
GET /expenses?category=Food
GET /expenses?sort=date_desc
GET /expenses?category=Transport&sort=date_desc
```

**Response** — Array of expense objects (same shape as POST response)

---

## Deployment

This project is deployed as two separate services:

### Backend → Render

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node src/app.js` |

**Environment variables to set in Render dashboard:**

```
MONGO_URI=<your Atlas connection string>
FRONTEND_URL=<your Vercel URL>
PORT=5000
```

### Frontend → Vercel

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment variable to set in Vercel dashboard:**

```
VITE_API_URL=<your Render backend URL>
```

### Auto-deploy

Both services are connected to this GitHub repository. Every `git push` to `main` triggers an automatic redeploy on both Render and Vercel.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the server runs on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/expense-tracker` |
| `FRONTEND_URL` | Allowed CORS origin | `https://your-app.vercel.app` |

### Frontend (`frontend/.env.development` / Vercel dashboard)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

>  Never commit `.env` files. They are listed in `.gitignore`. Use `.env.example` as a reference template.

---

## Testing the API manually

You can test the API using **Thunder Client** (VS Code extension) or **curl**:

```bash
# Create an expense
curl -X POST https://expense-tracker-backend.onrender.com/expenses \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"amount": "19.99", "category": "Food", "description": "Dinner", "date": "2024-01-15"}'

# Get all expenses sorted newest first
curl "https://expense-tracker-backend.onrender.com/expenses?sort=date_desc"

# Filter by category
curl "https://expense-tracker-backend.onrender.com/expenses?category=Food"
```

---

## Edge Cases Handled

| Scenario | How it's handled |
|----------|-----------------|
| User double-clicks submit | Button disabled during submission; same `Idempotency-Key` sent |
| Page refresh mid-submit | New key generated only after success; retry uses same key |
| Network timeout / retry | Server returns original record for duplicate key, not a new one |
| Slow API response | Loading state shown; button disabled to prevent multiple submissions |
| API server down | Error message shown clearly in the UI |
| Invalid form data | Client-side validation before any API call is made |

---

### Key Design Decisions

**Idempotency via client-generated UUID headers** — rather than trying to detect duplicates by comparing field values (which is fragile — two separate $5 coffee purchases on the same day are legitimate), the client generates a UUID once per form session and sends it as an `Idempotency-Key` header. The server enforces uniqueness at the database level with a MongoDB unique index. This is the same pattern used by Stripe and other payment APIs, and it correctly handles all three failure modes: double-clicks, page refreshes mid-submit, and network-level retries.

**Decimal128 for money** — JavaScript's `Number` type uses IEEE 754 floating-point which cannot represent many decimal values exactly (e.g. `0.1 + 0.2 === 0.30000000000000004`). For monetary values this is unacceptable. MongoDB's `Decimal128` type stores values with 34 significant decimal digits of precision, avoiding rounding errors entirely. The value is serialised to a string in API responses so the frontend never has to deal with the raw BSON type.

**Logic in a custom hook, not in components** — all data fetching, state, and side effects live in `useExpenses.js`. Components are purely presentational. This makes the code easier to follow, test, and change — you can swap out the API layer or change filtering logic in one place without touching any component.

**Filtering and sorting on the server** — category filtering and date sorting are handled by MongoDB queries rather than filtering a large client-side array. This keeps the API response small and means the pattern scales correctly if the dataset grows.

---

### Trade-offs Made Because of the Timebox

**No authentication** — all expenses are shared globally. Adding per-user data would require auth (JWT or sessions), a `userId` field on every document, and protected routes. This was out of scope for the brief but would be the first thing to add in a real product.

**No pagination** — `GET /expenses` returns all records. For a personal tracker with tens or hundreds of records this is fine. At scale you would add `?page=` and `?limit=` query parameters and return total count metadata in the response.

**No edit or delete** — the brief only required creating and listing expenses. `PUT /expenses/:id` and `DELETE /expenses/:id` are straightforward additions but were intentionally left out to stay focused.

**Hardcoded category list** — categories are a fixed array in both the frontend form and filter dropdown. A production app would either allow free-text input or manage categories as their own resource (`GET /categories`). Hardcoding was the simplest correct solution here.

**In-memory error state, not a toast library** — errors and success messages are displayed via a simple `StatusMessage` component with plain CSS. A real app would use a toast/notification library with auto-dismiss, but the inline approach is dependency-free and fully meets the brief's requirement to show feedback on slow or failed responses.

---

### What Was Intentionally Not Done

- **No unit or integration tests** — writing meaningful tests for an Express + MongoDB stack (with proper DB mocking or a test database) would have taken longer than the feature work itself. In a real project, at minimum the idempotency logic and the money serialisation would have test coverage.
- **No input sanitisation beyond trimming** — Mongoose trims string fields and validates types, but there is no HTML-escaping or profanity filtering. React escapes values by default so XSS is not a concern on the frontend.
- **No rate limiting** — the API has no per-IP request limits. For a public-facing API, `express-rate-limit` would be added to prevent abuse.
- **No CI/CD pipeline** — deployments are triggered by `git push` via Render and Vercel's GitHub integrations. A real project would add a GitHub Actions workflow to run linting and tests before allowing a merge to `main`.
- **No HTTPS enforcement on the backend** — Render handles TLS termination at the load balancer level, so the Express app itself does not need to manage certificates. This is correct for this deployment setup.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

> Built with ❤️ using Node.js, Express, MongoDB, React, and Vite.
