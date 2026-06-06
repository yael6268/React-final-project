import express, { type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// @ts-ignore
import { generateFinancialInsight } from './services/aiService.js';
import authRoutes from './routes/auth.routes.ts'; // 🔥 שינוי 1: מייבאים את הנתיבים שלך!

dotenv.config();

const app = express();
const PORT = 5000;

// 🔥 חיבור ל-MongoDB בענן
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-app';
    await mongoose.connect(mongoUri);
    console.log('✅ התחבור ל-MongoDB הצליח!');
  } catch (error) {
    console.error('❌ התחבור ל-MongoDB נכשל:', error);
    process.exit(1);
  }
};

connectDB();

app.use(cors());
app.use(express.json());

// 🔥 שינוי 2: מחברים את נתיבי ההרשמה וההתחברות שלך לשרת
app.use('/api/auth', authRoutes);

// הגדרת Interface לנתונים - זה הכוח של TS!
interface TransactionSummary {
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

const mockTransactions: TransactionSummary[] = [
  { category: 'מזון', amount: 1500, type: 'expense' },
  { category: 'חשבונות', amount: 900, type: 'expense' },
  { category: 'רכב', amount: 600, type: 'expense' },
  { category: 'פנאי', amount: 400, type: 'expense' },
];

// נתוני דמה לגרף קווי (הוצאות לאורך השבוע)
const mockTrendData = [
  { date: '01/05', amount: 400 },
  { date: '02/05', amount: 700 },
  { date: '03/05', amount: 200 },
  { date: '04/05', amount: 900 },
  { date: '05/05', amount: 500 },
  { date: '06/05', amount: 300 },
  { date: '07/05', amount: 600 },
];

app.get('/api/analytics/trends', (req: Request, res: Response) => {
  res.json(mockTrendData);
});

app.get('/api/analytics/category-summary', (req: Request, res: Response) => {
  res.json(mockTransactions);
});

// נתיב לכרטיסיות הסיכום
app.get('/api/analytics/summary', (req, res) => {
  const totalIncome = mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  res.json({
    totalIncome,
    totalExpenses,
    balance,
  });
});

app.post('/api/ai/insights', async (req: Request, res: Response) => {
  try {
    const payload = req.body && Object.keys(req.body).length ? req.body : { transactions: mockTransactions };
    const dataString = JSON.stringify(payload.transactions || payload);
    const insight = await generateFinancialInsight(dataString);
    res.json({ insight });
  } catch (error) {
    console.error('Error generating insight:', error);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});