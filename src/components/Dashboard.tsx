import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import SummaryCard from './SummaryCard';
import AgentButton from './AgentButton';
import AiInsightDrawer from './AiInsightDrawer';

interface AnalyticsData {
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

interface TrendData {
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

interface TrendData {
  date: string;
  amount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  // simple in-memory cache to avoid re-requesting identical payloads
  const aiCache = React.useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<AnalyticsData[]>('http://localhost:5000/api/analytics/category-summary');
        setData(response.data);

        const trendRes = await axios.get<TrendData[]>('http://localhost:5000/api/analytics/trends');
        setTrendData(trendRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAgentClick = async () => {
    setDrawerOpen(true);
    setAiLoading(true);
    setAiInsight(null);
    try {
      // prefer server-side DB fetch when user is authenticated:
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // If we have a token, let the server fetch the real transactions for this user.
      // If no token, fall back to sending the analytics data (which may be mock).
      const payload = token ? {} : (data && data.length ? { transactions: data } : {});
      const key = JSON.stringify(payload);
      if (aiCache.current.has(key)) {
        setAiInsight(aiCache.current.get(key) || null);
        setAiLoading(false);
        return;
      }
  const headers: Record<string, string> | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
  // Debug: show token and headers in browser console before sending
  // eslint-disable-next-line no-console
  console.log('AI request - token present:', !!token, 'token:', token, 'headers:', headers);
  const res = await axios.post('http://localhost:5000/api/ai/insights', payload, { headers });
      let insightText = res.data.insight || res.data;
      if (typeof insightText === 'string') {
        // remove all asterisks (single or multiple) that appear in the AI text
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

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh', direction: 'rtl' }}>

      {/* 1. כרטיסיות סיכום בחלק העליון */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
        <SummaryCard title="סה'כ הכנסות" amount={12000} color="#00C49F" />
        <SummaryCard title="סה'כ הוצאות" amount={8500} color="#FF8042" />
        <SummaryCard title="יתרה נוכחית" amount={3500} color="#0088FE" />
      </div>

      {/* 2. אזור הגרפים מסודר בשני טורים */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>

        {/* גרף קווי - מגמת הוצאות */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>מגמת הוצאות שבועית</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={3} dot={{ r: 6, fill: '#8884d8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* גרף עוגה - הוצאות לפי קטגוריה */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>סיכום הוצאות לפי קטגוריה</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Floating Agent button - always visible */}
      <AgentButton onClick={handleAgentClick} />
      <AiInsightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} loading={aiLoading} insight={aiInsight} />
    </div>
  );
};

export default Dashboard;