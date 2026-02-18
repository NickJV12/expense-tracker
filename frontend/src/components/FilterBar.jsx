const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Other'];

export default function FilterBar({ category, setCategory, sort, setSort }) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="filter-category">Filter by Category</label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-sort">Sort by Date</label>
        <select
          id="filter-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
        </select>
      </div>

      {category && (
        <button className="btn-clear" onClick={() => setCategory('')}>
          Clear Filter
        </button>
      )}
    </div>
  );
}