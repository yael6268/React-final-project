
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
}

const mockTransactions: TransactionSummary[] = [
  { category: 'מזון', amount: 1500 },
  { category: 'חשבונות', amount: 900 },
  { category: 'רכב', amount: 600 },
  { category: 'פנאי', amount: 400 },
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
  res.json(summary);
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});