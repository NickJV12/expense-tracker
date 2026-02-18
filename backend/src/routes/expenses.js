const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const Expense  = require('../models/Expense');

// ── POST /expenses ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header is required' });
  }

  const { amount, category, description, date } = req.body;

  if (!amount || !category || !date) {
    return res.status(400).json({ error: 'amount, category, and date are required' });
  }

  try {
    // If this key was already processed, return the original — safe to retry
    const existing = await Expense.findOne({ idempotencyKey });
    if (existing) {
      return res.status(200).json(existing.toJSON());
    }

    const expense = await Expense.create({
      idempotencyKey,
      amount: mongoose.Types.Decimal128.fromString(String(amount)),
      category,
      description,
      date: new Date(date),
    });

    return res.status(201).json(expense.toJSON());
  } catch (err) {
    // Handle race condition where two identical requests arrive at the same time
    if (err.code === 11000) {
      const existing = await Expense.findOne({ idempotencyKey });
      return res.status(200).json(existing.toJSON());
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /expenses ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, sort } = req.query;

    const filter = {};
    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    const sortOrder = sort === 'date_desc' ? { date: -1 } : { date: 1 };

    const expenses = await Expense.find(filter).sort(sortOrder);
    return res.json(expenses.map((e) => e.toJSON()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;