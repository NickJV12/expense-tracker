export default function Summary({ total, count, category }) {
  return (
    <div className="summary">
      <div className="summary-item">
        <span className="summary-label">
          {category ? `Total for "${category}"` : 'Total (all expenses)'}
        </span>
        <span className="summary-value">${total.toFixed(2)}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Expenses shown</span>
        <span className="summary-value">{count}</span>
      </div>
    </div>
  );
}