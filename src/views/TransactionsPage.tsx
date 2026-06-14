import React from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionFiltersComponent from '../components/TransactionFilters.tsx';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import TransactionSummary from '../components/TransactionSummary';
import type { Transaction, TransactionFilters as Filters } from '../types/transaction';
import api from '../services/api';

const TransactionsPage: React.FC = () => {
  const [filters, setFilters] = React.useState<Filters>({ page: 1, limit: 10 });
  const [editTransaction, setEditTransaction] = React.useState<Transaction | null>(null);
  const { transactions, isLoading, errorMessage, pagination, setFilters: updateFilters, refetch } = useTransactions(filters);

  const applyFilters = (newFilters: Filters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateFilters(updatedFilters);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    applyFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    applyFilters({ page });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('את בטוחה שאת רוצה למחוק את התנועה?')) {
      return;
    }

    try {
      await api.delete(`/transactions/${transactionId}`);
      refetch();
    } catch (err) {
      alert('שגיאה במחיקת התנועה. נסי שוב.');
    }
  };

  const handleFormSuccess = () => {
    setEditTransaction(null);
    handlePageChange(1);
  };

  const handleCancelEdit = () => {
    setEditTransaction(null);
  };

  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="hero-copy">
          <p className="panel-tag">ניהול תנועות</p>
          <h1 className="hero-title">כל התנועות במקום אחד</h1>
          <p className="hero-subtitle">
            הוסף, ערוך וסנן את ההוצאות וההכנסות שלכם. זה החלק שלך בפרויקט, וה־Transactions Engine הוא הלב של מערכת הכספים.
          </p>
        </div>

        <div className="panel hero-card">
          <p className="section-title">תצוגת מצב מהירה</p>
          <div className="summary-cards" style={{ marginTop: '18px' }}>
            <div className="summary-card">
              <span className="summary-label">עמוד נוכחי</span>
              <p className="summary-value">{pagination.page} מתוך {pagination.pages}</p>
            </div>
            <div className="summary-card">
              <span className="summary-label">סך תנועות</span>
              <p className="summary-value">{pagination.total.toLocaleString('he-IL')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stack" style={{ width: '100%' }}>
        <TransactionFiltersComponent filters={filters} onChange={handleFiltersChange} />
      </section>

      <div className="page-grid">
        <section className="stack">
          <TransactionSummary transactions={transactions} />
        </section>

        <aside className="stack">
          <TransactionForm
            transactionToEdit={editTransaction}
            onCancelEdit={handleCancelEdit}
            onSuccess={handleFormSuccess}
          />
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-tag">כלים מהירים</p>
                <h2 className="section-title">עדכון תנועות</h2>
              </div>
            </div>
            <button type="button" className="button button-secondary" onClick={handleRefresh}>
              רענן תנועות
            </button>
          </div>
        </aside>
      </div>

      <section className="table-card">
        <div className="table-header">
          <div>
            <p className="panel-tag">טבלת תנועות</p>
            <h2 className="section-title">תנועות אחרונות</h2>
          </div>
          <span className="field-note">{filters.category || 'כל הקטגוריות'} · {filters.type || 'כל הסוגים'}</span>
        </div>

        {errorMessage && (
          <div className="panel panel-muted" style={{ borderColor: '#fde2e2', background: '#fff1f2', color: '#b91c1c' }}>
            {errorMessage}
          </div>
        )}

        <TransactionTable
          transactions={transactions}
          loading={isLoading}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />

        <div className="panel pagination">
          <span>עמוד {pagination.page} מתוך {pagination.pages}</span>
          <div className="table-actions">
            <button type="button" className="button button-secondary" disabled={pagination.page <= 1} onClick={() => handlePageChange(Math.max(pagination.page - 1, 1))}>
              קודם
            </button>
            <button type="button" className="button button-secondary" disabled={pagination.page >= pagination.pages} onClick={() => handlePageChange(Math.min(pagination.page + 1, pagination.pages))}>
              הבא
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TransactionsPage;
