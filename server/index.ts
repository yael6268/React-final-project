
import express, { type Request, type Response } from 'express';
import cors from 'cors';
// @ts-ignore
import { generateFinancialInsight } from './services/aiService.js';
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
// post/get?
app.post('/api/ai/insights', async (req: Request, res: Response) => {
  try{
    const dataString = JSON.stringify(mockTransactions);
    const insight = await generateFinancialInsight(dataString);
    res.json({ insight });
  } catch (error) {
    console.error('Error generating insight:', error);
    res.status(500).json({ error: 'Failed to generate insight' });
  }});
  