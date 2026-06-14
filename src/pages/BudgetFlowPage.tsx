import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BudgetDashboardPage from './BudgetDashboardPage';
import AgentButton from '../components/AgentButton';
import AiInsightDrawer from '../components/AiInsightDrawer';
import * as api from '../services/budgetApi';

const BudgetFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasBudget, setHasBudget] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budgetStatuses, setBudgetStatuses] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const aiCache = React.useRef<Map<string, string>>(new Map());

  const checkBudget = async () => {
    try {
      setLoading(true);
      setError(null);

      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const budgets = await api.getBudgetsByMonth(month, year);
      const statuses = await api.getBudgetStatus(month, year);

      setHasBudget(Array.isArray(budgets) && budgets.length > 0);
      setBudgetStatuses(Array.isArray(statuses) ? statuses : []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'לא удалось לבדוק את מצב התקציב');
      setHasBudget(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkBudget();
  }, []);

  const handleAgentClick = async () => {
    setDrawerOpen(true);
    setAiLoading(true);
    setAiInsight(null);

    try {
      const payload = budgetStatuses.length
        ? { budgets: budgetStatuses }
        : { message: hasBudget ? 'User has a budget but no status details were returned.' : 'User has no budget yet.' };

      const key = JSON.stringify(payload);
      if (aiCache.current.has(key)) {
        setAiInsight(aiCache.current.get(key) || null);
        setAiLoading(false);
        return;
      }

      const res = await axios.post('http://localhost:5000/api/ai/insights', payload);
      let insightText = res.data.insight || res.data;
      if (typeof insightText === 'string') {
        insightText = insightText.replace(/\*+/g, '').trim();
        aiCache.current.set(key, insightText);
      }
      setAiInsight(insightText);
    } catch (err) {
      console.error('AI request failed', err);
      setAiInsight('אירעה שגיאה בקבלת תובנות מהשרת.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', direction: 'rtl' }}>
        <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>טוען את מצב התקציב...</p>
        <AgentButton onClick={handleAgentClick} />
        <AiInsightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} loading={aiLoading} insight={aiInsight} />
      </div>
    );
  }

  if (error && hasBudget === false) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', direction: 'rtl' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <p style={{ color: '#dc2626', marginBottom: '0.75rem', fontWeight: 600 }}>לא ניתן לבדוק את התקציב כרגע</p>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#111827' }}>התקציב שלך לא מוגדר</h1>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/budget/manage')} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: 700 }}>
              הגדר תקציב חדש
            </button>
            <button onClick={() => void checkBudget()} style={{ backgroundColor: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: 700 }}>
              רענון
            </button>
          </div>
        </div>
        <AgentButton onClick={handleAgentClick} />
        <AiInsightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} loading={aiLoading} insight={aiInsight} />
      </div>
    );
  }

  if (!hasBudget) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem', direction: 'rtl' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <p style={{ color: '#ef4444', marginBottom: '0.75rem', fontWeight: 600 }}>סטטוס תקציב</p>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#111827' }}>התקציב שלך לא מוגדר</h1>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
            עדיין אין לך תקציב עבור החודש הנוכחי. הגדר אותו כדי לראות גרפים, התראות וסיכום כספי.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/budget/manage')} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: 700 }}>
              הגדר תקציב חדש
            </button>
            <button onClick={() => void checkBudget()} style={{ backgroundColor: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: 700 }}>
              בדוק שוב
            </button>
          </div>
        </div>
        <AgentButton onClick={handleAgentClick} />
        <AiInsightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} loading={aiLoading} insight={aiInsight} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '1.5rem', direction: 'rtl' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: 0, color: '#16a34a', fontWeight: 700 }}>יש תקציב פעיל</p>
          <h1 style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>התקציב שלך מוכן להצגה</h1>
        </div>
        <BudgetDashboardPage />
        <AgentButton onClick={handleAgentClick} />
        <AiInsightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} loading={aiLoading} insight={aiInsight} />
      </div>
    </div>
  );
};

export default BudgetFlowPage;
