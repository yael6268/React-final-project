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

app.get('/api/analytics/category-summary', (req: Request, res: Response) => {
  res.json(mockTransactions);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});