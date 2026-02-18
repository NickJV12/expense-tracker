const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Decimal128 avoids floating-point errors (e.g. 0.1 + 0.2 !== 0.3)
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Amount is required'],
      validate: {
        validator: (v) => parseFloat(v.toString()) > 0,
        message: 'Amount must be a positive number',
      },
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Clean up the JSON output for API responses
expenseSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret.amount) ret.amount = ret.amount.toString();
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.idempotencyKey;
    return ret;
  },
});

module.exports = mongoose.model('Expense', expenseSchema);