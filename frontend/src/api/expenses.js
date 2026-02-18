import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetch expenses with optional filters.
 * @param {{ category?: string, sort?: string }} params
 */
export async function fetchExpenses({ category = '', sort = '' } = {}) {
  const params = {};
  if (category) params.category = category;
  if (sort)     params.sort     = sort;

  const { data } = await client.get('/expenses', { params });
  return data;
}

/**
 * Create a new expense.
 * idempotencyKey ensures the server ignores duplicate submissions
 * (double-clicks, page refreshes mid-submit, network retries).
 *
 * @param {object} expense  - { amount, category, description, date }
 * @param {string} idempotencyKey - UUID generated once per form fill
 */
export async function createExpense(expense, idempotencyKey) {
  const { data } = await client.post('/expenses', expense, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
}