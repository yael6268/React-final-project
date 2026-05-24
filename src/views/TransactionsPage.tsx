import React from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionFilters from '../components/TransactionFilters';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import TransactionSummary from '../components/TransactionSummary';
import type { TransactionFilters as Filters } from '../types/transaction';

const TransactionsPage: React.FC = () => {
  const [filters, setFilters] = React.useState<Filters>({ page: 1, limit: 10 });
  const { transactions, isLoading, errorMessage, pagination, setFilters: updateFilters, refetch } = useTransactions(filters);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
    updateFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    updateFilters({ ...filters, page });
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <main className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-4">
          <div className="rounded border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">ניהול תנועות פיננסיות</h1>
            <p className="mt-2 text-sm text-gray-600">הוספת תנועות, סינון וסקירה מהירה של המצב הכלכלי.</p>
          </div>

          <TransactionFilters filters={filters} onChange={handleFiltersChange} />
          <TransactionSummary transactions={transactions} />
        </section>

        <aside className="space-y-6">
          <TransactionForm onSuccess={() => handlePageChange(1)} />
          <div className="rounded border bg-white p-4 shadow-sm">
            <button
              type="button"
              className="w-full rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
              onClick={handleRefresh}
            >
              רענן תנועות
            </button>
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        {errorMessage && <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{errorMessage}</div>}

        <TransactionTable transactions={transactions} loading={isLoading} />

        <div className="flex items-center justify-between rounded border bg-white p-4 shadow-sm">
          <span>עמוד {pagination.page} מתוך {pagination.pages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(Math.max(pagination.page - 1, 1))}
            >
              קודם
            </button>
            <button
              type="button"
              className="rounded bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              disabled={pagination.page >= pagination.pages}
              onClick={() => handlePageChange(Math.min(pagination.page + 1, pagination.pages))}
            >
              הבא
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TransactionsPage;
