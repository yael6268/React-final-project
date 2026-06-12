import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import * as api from '../services/budgetApi';
import * as transactionApi from '../services/transactionApi';

interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

interface TransactionItem {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
}

const BudgetDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionSaving, setTransactionSaving] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sortBy, setSortBy] = useState<'category' | 'spent' | 'percentage' | 'overbudget'>('overbudget');
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  useEffect(() => {
    void fetchStatus();
    void fetchTransactions();
  }, [month, year]);

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(transactionForm.category)) {
      setTransactionForm((prev) => ({ ...prev, category: availableCategories[0] }));
    }
  }, [availableCategories, transactionForm.category]);

  // Auto-clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getBudgetStatus(month, year);
      setStatuses(data || []);
      setAvailableCategories((data || []).map((item: BudgetStatus) => item.category).filter(Boolean));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'נכשל בטעינת סטטוס התקציב');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
      const response = await transactionApi.getTransactions(1, 8, { startDate, endDate });
      setTransactions(response?.transactions || []);
      setTransactionMessage(null);
    } catch (err: any) {
      setTransactionMessage(err.response?.data?.message || 'נכשל בטעינת התנועות');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleTransactionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const amount = Number(transactionForm.amount);
    const normalizedCategory = transactionForm.category.trim();
    const categoryIsValid = availableCategories.some((category) => category.toLowerCase() === normalizedCategory.toLowerCase());

    if (!normalizedCategory || !transactionForm.date || Number.isNaN(amount) || amount <= 0) {
      setTransactionMessage('יש להזין סכום תקין, קטגוריה ותאריך.');
      return;
    }

    if (!categoryIsValid) {
      setTransactionMessage('הקטגוריה אינה קיימת בתקציב הנוכחי. יש לבחור קטגוריה קיימת או ליצור תקציב לקטגוריה זו תחילה.');
      return;
    }

    try {
      setTransactionSaving(true);
      await transactionApi.createTransaction({
        amount,
        type: transactionForm.type,
        category: normalizedCategory,
        date: transactionForm.date,
        description: transactionForm.description.trim() || undefined,
      });

      setTransactionMessage('התנועה נוספה בהצלחה.');
      setTransactionForm({
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().slice(0, 10),
        description: '',
      });
      await fetchStatus();
      await fetchTransactions();
    } catch (err: any) {
      setTransactionMessage(err.response?.data?.message || 'הוספת התנועה נכשלה');
    } finally {
      setTransactionSaving(false);
    }
  };

  // Sort statuses
  const sortedStatuses = [...statuses].sort((a, b) => {
    switch (sortBy) {
      case 'spent':
        return b.spent - a.spent;
      case 'percentage':
        return b.percentage - a.percentage;
      case 'overbudget':
        if (a.isOverBudget === b.isOverBudget) return b.percentage - a.percentage;
        return a.isOverBudget ? -1 : 1;
      case 'category':
      default:
        return a.category.localeCompare(b.category);
    }
  });

  // Calculations
  const totalBudget = statuses.reduce((sum, s) => sum + s.limit, 0);
  const totalSpent = statuses.reduce((sum, s) => sum + s.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const averagePercentage = statuses.length ? Math.round(statuses.reduce((sum, s) => sum + s.percentage, 0) / statuses.length) : 0;
  const overBudgetCount = statuses.filter((s) => s.isOverBudget).length;
  const chartData = statuses.map((status) => ({
    name: status.category,
    budget: status.limit,
    spent: status.spent,
    remaining: Math.max(status.remaining, 0),
  }));
  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({ num: i + 1, name: new Date(2000, i).toLocaleDateString('he', { month: 'long' }) }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#0f172a' }}>
              לוח תקציב
            </h1>
            <p style={{ color: '#475569', margin: 0 }}>עקוב אחרי ההוצאות, התקציב והמצב שלך</p>
          </div>
          <button
            onClick={() => navigate('/budget/manage')}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              fontWeight: '700',
            }}
          >
            ערוך תקציב
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.85rem', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
              חודש
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            >
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
              שנה
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
              מיון לפי
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            >
              <option value="overbudget">חריגות ראשונות</option>
              <option value="percentage">אחוז שימוש</option>
              <option value="spent">סכום שהוצא</option>
              <option value="category">קטגוריה</option>
            </select>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.9rem', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a' }}>הוסף תנועה</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>רשום הכנסה או הוצאה ישירות בתוך לוח התקציב.</p>
            </div>
            <div style={{ color: '#2563eb', fontWeight: '600' }}>זמין ישירות באפליקציה</div>
          </div>

          <form onSubmit={handleTransactionSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '0.35rem' }}>סכום</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
                placeholder="0.00"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '0.35rem' }}>סוג</label>
              <select
                value={transactionForm.type}
                onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
              >
                <option value="expense">הוצאה</option>
                <option value="income">הכנסה</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '0.35rem' }}>קטגוריה</label>
              {availableCategories.length > 0 ? (
                <select
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
                >
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
                  placeholder="הקלד קטגוריה"
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '0.35rem' }}>תאריך</label>
              <input
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '0.35rem' }}>הערה</label>
              <input
                type="text"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
                placeholder="הערה אופציונלית"
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={transactionSaving}
                style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.7rem 1rem', cursor: transactionSaving ? 'not-allowed' : 'pointer', fontWeight: '700' }}
              >
                {transactionSaving ? 'שומר...' : 'הוסף תנועה'}
              </button>
              {transactionMessage && (
                <span style={{ color: transactionMessage.includes('successfully') ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                  {transactionMessage}
                </span>
              )}
            </div>
          </form>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a' }}>תנועות אחרונות</h4>
            {transactionsLoading ? (
              <p style={{ margin: 0, color: '#64748b' }}>טוען תנועות...</p>
            ) : transactions.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>אין תנועות עדיין לתקופה זו.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {transactions.map((item) => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.9rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#f9fafb' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#111' }}>{item.category}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(item.date).toLocaleDateString('en-GB')} {item.description ? `• ${item.description}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: item.type === 'expense' ? '#dc2626' : '#16a34a' }}>
                        {item.type === 'expense' ? '-' : '+'}{item.amount.toLocaleString()} ILS
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'capitalize' }}>{item.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && statuses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>סך כל התקציב</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111', margin: '0.5rem 0 0 0' }}>
                {totalBudget.toLocaleString()} ILS
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{statuses.length} קטגוריות</p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>סך הכל שהוצא</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111', margin: '0.5rem 0 0 0' }}>
                {totalSpent.toLocaleString()} ILS
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{averagePercentage}% בממוצע</p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>היתרה הכוללת</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: totalRemaining >= 0 ? '#16a34a' : '#dc2626', margin: '0.5rem 0 0 0' }}>
                {totalRemaining.toLocaleString()} ILS
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                {totalBudget ? ((totalRemaining / totalBudget) * 100).toFixed(1) : '0'}% נותר
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>חריגות תקציב</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: overBudgetCount > 0 ? '#dc2626' : '#16a34a', margin: '0.5rem 0 0 0' }}>
                {overBudgetCount}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>מתוך {statuses.length} קטגוריות</p>
            </div>
          </div>
        )}

        {!loading && statuses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#111' }}>השימוש בכל קטגוריה</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budget" fill="#3b82f6" name="תקציב" />
                    <Bar dataKey="spent" fill="#ef4444" name="שימוש" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#111' }}>שארית התקציב לכל קטגוריה</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="remaining"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Status Table */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>טוען...</p>
        ) : statuses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>אין נתוני תקציב לתקופה זו</p>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    קטגוריה
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    תקציב
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    הוצא
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    נותר
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    התקדמות
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStatuses.map((status) => (
                  <tr key={status.category} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#111' }}>{status.category}</span>
                        {status.isOverBudget && (
                          <span style={{ padding: '0.125rem 0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '0.25rem' }}>
                            חריגה
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#111' }}>
                      {status.limit.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: status.isOverBudget ? '#dc2626' : '#111' }}>
                      {status.spent.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: status.remaining > 0 ? '#16a34a' : '#dc2626' }}>
                      {status.remaining.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ minWidth: '150px' }}>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(status.percentage, 100)}%`,
                              backgroundColor:
                                status.percentage > 100
                                  ? '#ef4444'
                                  : status.percentage > 80
                                  ? '#f97316'
                                  : status.percentage > 50
                                  ? '#eab308'
                                  : '#22c55e',
                            }}
                          />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>
                          {status.percentage.toFixed(0)}%
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Over Budget Warnings */}
        {!loading && statuses.some((s) => s.isOverBudget) && (
          <div style={{ marginTop: '2rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: '#dc2626', marginTop: '0.125rem' }}>
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#991b1b', margin: '0 0 0.5rem 0' }}>התראות תקציב</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {statuses
                    .filter((s) => s.isOverBudget)
                    .map((s) => (
                      <li key={s.category} style={{ fontSize: '0.875rem', color: '#b91c1c', marginBottom: '0.25rem' }}>
                        <strong>{s.category}</strong> חרגה מהתקציב ב- <strong>{(s.spent - s.limit).toLocaleString()} ILS</strong>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetDashboardPage;
