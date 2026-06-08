import React, { useState, useEffect } from 'react';
import * as api from '../services/budgetApi';


interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

const BudgetDashboardPage: React.FC = () => {
  const [statuses, setStatuses] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sortBy, setSortBy] = useState<'category' | 'spent' | 'percentage' | 'overbudget'>('overbudget');

  // Fetch status on mount and when month/year change
  useEffect(() => {
    fetchStatus();
  }, [month, year]);

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
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch budget status');
    } finally {
      setLoading(false);
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({ num: i + 1, name: new Date(2000, i).toLocaleDateString('en', { month: 'long' }) }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>
          Budget Dashboard
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Track your spending and budget status</p>

        {/* Error Alert */}
        {error && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
              Month
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
              Year
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
              Sort By
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
              <option value="overbudget">Over Budget First</option>
              <option value="percentage">Spending %</option>
              <option value="spent">Amount Spent</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && statuses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#666', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Total Budget</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111', margin: '0.5rem 0 0 0' }}>
                {totalBudget.toLocaleString()} ILS
              </p>
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0 0' }}>{statuses.length} categories</p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#666', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Total Spent</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111', margin: '0.5rem 0 0 0' }}>
                {totalSpent.toLocaleString()} ILS
              </p>
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0 0' }}>{averagePercentage}% average</p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#666', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Total Remaining</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: totalRemaining >= 0 ? '#16a34a' : '#dc2626', margin: '0.5rem 0 0 0' }}>
                {totalRemaining.toLocaleString()} ILS
              </p>
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0 0' }}>
                {totalBudget ? ((totalRemaining / totalBudget) * 100).toFixed(1) : '0'}% left
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#666', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Over Budget</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: overBudgetCount > 0 ? '#dc2626' : '#16a34a', margin: '0.5rem 0 0 0' }}>
                {overBudgetCount}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0 0' }}>of {statuses.length} categories</p>
            </div>
          </div>
        )}

        {/* Status Table */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>Loading...</p>
        ) : statuses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No budget data for this period</p>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Category
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Budget
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Spent
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Remaining
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Progress
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
                            Over
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
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#991b1b', margin: '0 0 0.5rem 0' }}>Budget Alerts</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {statuses
                    .filter((s) => s.isOverBudget)
                    .map((s) => (
                      <li key={s.category} style={{ fontSize: '0.875rem', color: '#b91c1c', marginBottom: '0.25rem' }}>
                        <strong>{s.category}</strong> exceeded budget by <strong>{(s.spent - s.limit).toLocaleString()} ILS</strong>
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
