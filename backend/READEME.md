# Expense Tracker — Backend

## Why MongoDB?

1. **Flexible schema** — categories and fields can evolve without migrations.
2. **Decimal128 support** — native monetary type avoids floating-point errors.
3. **Unique indexes** — make idempotency enforcement atomic and simple.
4. **JSON-native** — documents map directly to API responses with zero overhead.

## Idempotency

Every `POST /expenses` request must include an `Idempotency-Key` header (a UUID
generated client-side). If the same key arrives more than once the server returns
the original response — no duplicate is created.

## Running Locally
```bash
cp .env.example .env   # fill in your MONGO_URI
npm install
npm run dev
```

## API Reference

| Method | Endpoint   | Description          |
|--------|------------|----------------------|
| POST   | /expenses  | Create a new expense |
| GET    | /expenses  | List all expenses    |
| GET    | /health    | Health check         |

### GET /expenses Query Parameters

| Param    | Example           | Effect                  |
|----------|-------------------|-------------------------|
| category | ?category=food    | Filter by category      |
| sort     | ?sort=date_desc   | Sort by date, newest first |