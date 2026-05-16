
import express, { type Request, type Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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
  const summary = {
    totalIncome: 12000,
    totalExpenses: 8500,
    balance: 3500
  };
  const totalIncome =mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  res.json({ ...summary, totalIncome, totalExpenses, balance });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});