import { useExpenses } from './hooks/useExpenses';
import ExpenseForm    from './components/ExpenseForm';
import FilterBar      from './components/FilterBar';
import ExpenseTable   from './components/ExpenseTable';
import Summary        from './components/Summary';
import StatusMessage  from './components/StatusMessage';

export default function App() {
  const {
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
  } = useExpenses();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p>Track your spending simply and clearly.</p>
      </header>

      <main className="app-main">
        <StatusMessage error={error} success={success} />

        <section className="card">
          <ExpenseForm onSubmit={submitExpense} submitting={submitting} />
        </section>

        <section className="card">
          <h2>Your Expenses</h2>
          <FilterBar
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
          />
          <Summary total={total} count={expenses.length} category={category} />
          <ExpenseTable expenses={expenses} loading={loadingList} />
        </section>
      </main>
    </div>
  );
}