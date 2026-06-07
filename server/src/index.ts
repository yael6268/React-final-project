import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTransactions, createTransaction } from './controllers/transaction.controller.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(express.json());

const fakeAuth = (req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: 'demo-user' };
  next();
};

app.use('/api/transactions', fakeAuth);
app.get('/api/transactions', getTransactions);
app.post('/api/transactions', createTransaction);

app.get('/api/analytics/category-summary', (_req: Request, res: Response) => {
  res.json([
    { category: 'מזון', amount: 1500 },
    { category: 'חשבונות', amount: 900 },
    { category: 'רכב', amount: 600 },
    { category: 'פנאי', amount: 400 },
  ]);
});

app.get('/api/analytics/weekly-trends', (_req: Request, res: Response) => {
  res.json([
    { date: 'א׳', amount: 500 },
    { date: 'ב׳', amount: 650 },
    { date: 'ג׳', amount: 450 },
    { date: 'ד׳', amount: 780 },
    { date: 'ה׳', amount: 920 },
    { date: 'ו׳', amount: 1100 },
    { date: 'ש׳', amount: 800 },
  ]);
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const startServer = async () => {
  try {
    const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/transactions';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
