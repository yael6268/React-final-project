import express, { type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.routes.ts';
import budgetRoutes from './routes/budgetRoutes.ts';
import transactionRoutes from './routes/transactionRoutes.ts';
import Transaction from './src/models/Transaction.ts';
// @ts-ignore
import { generateFinancialInsight } from './services/aiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-app';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7).trim();
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_1234';
    const payload: any = jwt.verify(token, JWT_SECRET);
    (req as any).user = {
      id: payload.userId || payload.id,
      name: payload.name,
    };
    next();
  } catch (error: any) {
    const message = error instanceof jwt.TokenExpiredError
      ? 'Token expired'
      : error instanceof jwt.JsonWebTokenError
        ? 'Invalid token'
        : 'Failed to verify token';
    res.status(401).json({ message });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);

// Mock data
interface TransactionSummary {
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

const mockTransactions: TransactionSummary[] = [
  { category: 'Food', amount: 1500, type: 'expense' },
  { category: 'Bills', amount: 900, type: 'expense' },
  { category: 'Transport', amount: 600, type: 'expense' },
  { category: 'Entertainment', amount: 400, type: 'expense' },
];

// Analytics endpoints
app.get('/api/analytics/category-summary', (req: Request, res: Response) => {
  res.json(mockTransactions);
});

app.get('/api/analytics/trends', (req: Request, res: Response) => {
  res.json([
    { date: '01/05', amount: 400 },
    { date: '02/05', amount: 700 },
    { date: '03/05', amount: 200 },
    { date: '04/05', amount: 900 },
    { date: '05/05', amount: 500 },
  ]);
});

app.get('/api/analytics/summary', (req: Request, res: Response) => {
  const totalIncome = mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  res.json({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create transaction endpoint
app.post('/api/create-transaction', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, amount, type, category, description } = req.body;
    if (!title || !amount || !type || !category) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const transaction = new Transaction({
      title,
      amount,
      type,
      category,
      description: description || '',
      userId,
      date: new Date(),
    });

    const saved = await transaction.save();
    console.log(`✅ Transaction created: ${title} for userId ${userId}`);
    res.status(201).json({ success: true, data: saved });
  } catch (error: any) {
    console.error('❌ Transaction creation error:', error.message);
    res.status(500).json({ message: 'Failed to create transaction', error: error?.message });
  }
});

// AI insights endpoint
app.post('/api/ai/insights', async (req: Request, res: Response) => {
  try {
    let transactions: any = null;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.startsWith('Bearer ')
          ? req.headers.authorization.slice(7).trim()
          : req.headers.authorization.trim();
        const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_1234';
        const payload: any = jwt.verify(token, JWT_SECRET);
        const userId = (payload?.userId || payload?.id || '').toString();

        if (userId) {
          transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(500).lean();
          console.log(`AI: Loaded ${transactions?.length || 0} transactions for userId ${userId}`);
        }
      } catch (err) {
        console.warn('AI: Failed to load user transactions, falling back to mock');
      }
    }

    if (!transactions || !transactions.length) {
      transactions = mockTransactions;
      console.log('AI: Using mock transactions');
    }

    const dataString = JSON.stringify(transactions);
    let insight = await generateFinancialInsight(dataString);
    if (typeof insight === 'string') insight = insight.replace(/\*/g, '').trim();
    res.json({ insight });
  } catch (error: any) {
    console.error('❌ AI insight error:', error.message);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

// Debug endpoint: count transactions
app.get('/api/debug/transactions-count', async (req: Request, res: Response) => {
  try {
    if (!req.headers.authorization) {
      res.status(401).json({ message: 'Missing Authorization header' });
      return;
    }
    const token = req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : req.headers.authorization.trim();
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_1234';
    const payload: any = jwt.verify(token, JWT_SECRET);
    const userId = (payload?.userId || payload?.id || '').toString();

    if (!userId) {
      res.status(400).json({ message: 'Invalid token payload' });
      return;
    }

    const count = await Transaction.countDocuments({ userId });
    const sample = await Transaction.find({ userId }).sort({ date: -1 }).limit(5).lean();
    res.json({ userId, count, sample });
  } catch (err: any) {
    console.error('❌ Debug error:', err.message);
    res.status(500).json({ message: 'Failed to read transactions', detail: err?.message });
  }
});

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Error handlers
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Uncaught error:', err.message, err.stack);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
