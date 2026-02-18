import { useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Other'];

const emptyForm = {
  amount:      '',
  category:    '',
  description: '',
  date:        new Date().toISOString().split('T')[0], // today as default
};

export default function ExpenseForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const validate = () => {
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0)
      return 'Please enter a valid positive amount.';
    if (!form.category)
      return 'Please select a category.';
    if (!form.date)
      return 'Please select a date.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setValidationError(err); return; }

    await onSubmit({
      ...form,
      amount: parseFloat(form.amount).toFixed(2),
    });

    // Reset form only after parent confirms success
    setForm(emptyForm);
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <h2>Add Expense</h2>

      {validationError && (
        <div className="status-message status-error">{validationError}</div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="What was this expense for?"
          value={form.description}
          onChange={handleChange}
          disabled={submitting}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}