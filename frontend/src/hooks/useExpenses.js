import { useState, useEffect, useCallback } from 'react';
import { fetchExpenses, createExpense } from '../api/expenses';

/**
 * Generates a UUID for idempotency keys.
 * crypto.randomUUID() is supported in all modern browsers.
 */
function generateKey() {
  return crypto.randomUUID();
}

export function useExpenses() {
  const [expenses, setExpenses]       = useState([]);
  const [category, setCategory]       = useState('');
  const [sort, setSort]               = useState('date_desc');
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  // One idempotency key per form session.
  // It is regenerated only AFTER a successful submit — not on every render.
  // This means: double-click = safe. Page refresh before submit = new key. 
  const [idempotencyKey, setIdempotencyKey] = useState(generateKey);

  // ── Load expenses whenever filters change ──────────────────────────────────
  const loadExpenses = useCallback(async () => {
    setLoadingList(true);
    setError('');
    try {
      const data = await fetchExpenses({ category, sort });
      setExpenses(data);
    } catch {
      setError('Failed to load expenses. Is the server running?');
    } finally {
      setLoadingList(false);
    }
  }, [category, sort]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // ── Submit a new expense ───────────────────────────────────────────────────
  const submitExpense = async (formData) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await createExpense(formData, idempotencyKey);
      setSuccess('Expense added successfully!');
      // Only generate a new key after success — retries before this use the same key
      setIdempotencyKey(generateKey());
      await loadExpenses();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add expense. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Total of currently visible expenses ───────────────────────────────────
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return {
    expenses,
    total,
    category,
    setCategory,
    sort,
    setSort,
    loadingList,
    submitting,
    error,
    success,
    submitExpense,
  };
}