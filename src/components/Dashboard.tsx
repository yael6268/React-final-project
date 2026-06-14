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

        const trendRes = await axios.get<TrendData[]>('http://localhost:5000/api/analytics/weekly-trends');
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
      // prefer to send real data if available, otherwise server will use mock
      const payload = data && data.length ? { transactions: data } : {};
      const key = JSON.stringify(payload);
      if (aiCache.current.has(key)) {
        setAiInsight(aiCache.current.get(key) || null);
        setAiLoading(false);
        return;
      }
      const res = await axios.post('http://localhost:5000/api/ai/insights', payload);
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
    <div className="page-shell" style={{ direction: 'rtl' }}>

      {/* Header Section */}
      <section className="page-hero">
        <div className="hero-copy">
          <p className="panel-tag">ניהול תנועות</p>
          <h1 className="hero-title">לוח בקרה פיננסי</h1>
          <p className="hero-subtitle">
            עקבו אחרי הכנסותיכם וההוצאות שלכם בזמן אמת. קבלו תובנות חכמות ותגידו להשקעה שלכם הצעדים הבאים.
          </p>
        </div>

        <div className="panel hero-card">
          <p className="section-title" style={{ marginBottom: 20 }}>תצוגת מצב מהירה</p>
          <div className="summary-cards" style={{ marginTop: '18px' }}>
            <div className="summary-card">
              <span className="summary-label">סה"כ הכנסות</span>
              <p className="summary-value" style={{ color: '#0f775f' }}>₪12,000</p>
            </div>
            <div className="summary-card">
              <span className="summary-label">סה"כ הוצאות</span>
              <p className="summary-value" style={{ color: '#b91c1c' }}>₪8,500</p>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '28px',
        maxWidth: '100%',
        margin: '36px 0'
      }}>
        {/* Line Chart */}
        <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '28px', boxShadow: '0 18px 32px rgba(15, 23, 42, 0.06)', border: '1px solid #f0eff5' }}>
          <h2 style={{ textAlign: 'right', marginBottom: '22px', color: '#2f2b59', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>מגמת הוצאות שבועית</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eff5" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#5439ff" strokeWidth={3} dot={{ r: 6, fill: '#5439ff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '28px', boxShadow: '0 18px 32px rgba(15, 23, 42, 0.06)', border: '1px solid #f0eff5' }}>
          <h2 style={{ textAlign: 'right', marginBottom: '22px', color: '#2f2b59', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>הוצאות לפי קטגוריה</h2>
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

      {/* Agent Button and Drawer */}
      <AgentButton onClick={handleAgentClick} />
      <AiInsightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} loading={aiLoading} insight={aiInsight} />
    </div>
  );
};

export default Dashboard;