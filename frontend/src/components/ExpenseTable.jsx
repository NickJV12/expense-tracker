export default function ExpenseTable({ expenses, loading }) {
  if (loading) {
    return <div className="table-state">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="table-state">
        No expenses found. Add your first one above!
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>
                {new Date(expense.date).toLocaleDateString('en-US', {
                  year:  'numeric',
                  month: 'short',
                  day:   'numeric',
                })}
              </td>
              <td>
                <span className={`badge badge-${expense.category.toLowerCase()}`}>
                  {expense.category}
                </span>
              </td>
              <td className="description-cell">
                {expense.description || <span className="muted">—</span>}
              </td>
              <td className="text-right amount-cell">
                ${parseFloat(expense.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}