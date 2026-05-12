import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// הגדרת הטיפוס (Interface) של הנתונים
interface AnalyticsData {
  category: string;
  amount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // הקריאה לשרת ה-Node שבנית (שרץ על פורט 5000)
        const response = await axios.get<AnalyticsData[]>('http://localhost:5000/api/analytics/category-summary');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: 400, direction: 'rtl' }}>
      <h2 style={{ textAlign: 'center' }}>סיכום הוצאות לפי קטגוריה</h2>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;