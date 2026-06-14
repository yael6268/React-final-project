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
// @ts-ignore
import { generateFinancialInsight } from './services/aiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Lazy load Transaction model to avoid issues before DB connect
let TransactionModel: any = null;
async function getTransactionModel() {
  if (!TransactionModel) {
    const mod = await import('./src/models/Transaction.ts');
  TransactionModel = mod.default ?? mod;
  }
  return TransactionModel;
}

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

// ensure we only call connectDB later in the IIFE startup

app.use(cors());
app.use(express.json());

// Authentication middleware: verify JWT and populate req.user
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ message: 'Missing authorization token' });
    return;
  }

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

// 🔥 שינוי 2: מחברים את נתיבי ההרשמה וההתחברות שלך לשרת
app.use('/api/auth', authRoutes);
// Mount budget and transaction routes WITH authentication middleware
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);

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

// Simple transaction creation endpoint (bypasses complex routes)
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

    // Import Transaction model dynamically
    const mod = await import('./src/models/Transaction.ts');
  const Transaction = (mod && (mod.default ?? mod)) as any;
    
    if (!Transaction) {
      res.status(500).json({ message: 'Transaction model not available' });
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
    console.log(`✅ Transaction created for userId ${userId}: ${title}`);
    res.status(201).json({ success: true, data: saved });
  } catch (error: any) {
    console.error('❌ Error creating transaction:', error);
    res.status(500).json({ message: 'Failed to create transaction', error: error?.message });
  }
});

app.post('/api/ai/insights', async (req: Request, res: Response) => {
  try {
    let transactions: any = null;
    console.log('AI insights: request received. Authorization header present:', !!req.headers.authorization);

    // 1) If client provided transactions in body, use them (no auth required)
    if (req.body && Object.keys(req.body).length && req.body.transactions) {
      console.log('AI insights: using transactions provided in request body; count:', Array.isArray(req.body.transactions) ? req.body.transactions.length : 'unknown');
      transactions = req.body.transactions;
    } else if (req.headers.authorization) {
      // 2) Otherwise, if Authorization header present, try to verify and load user's transactions from DB
      try {
        const token = req.headers.authorization.startsWith('Bearer ')
          ? req.headers.authorization.slice(7).trim()
          : req.headers.authorization.trim();
        console.log('AI insights: token extracted, length=', token.length);
        const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_1234';
        const payload: any = jwt.verify(token, JWT_SECRET);
        console.log('AI insights: JWT payload keys:', Object.keys(payload), 'payload:', JSON.stringify(payload, null, 2));
        const rawId = (payload as any)?.userId || (payload as any)?.id;
        const userId = rawId ? (typeof rawId === 'string' ? rawId : (rawId?.toString ? rawId.toString() : '')) : '';
        console.log('AI insights: rawId=', rawId, 'userId after conversion=', userId);
        if (userId) {
          console.log('AI insights: JWT verified, userId=', userId, 'type=', typeof userId);
          // dynamic import of model to avoid module resolution timing issues
          const mod = await import('./src/models/Transaction.ts');
          const Transaction = (mod && (mod.default ?? mod)) as any;
          console.log('AI insights: Transaction model loaded, available=', !!Transaction);
          if (Transaction) {
            console.log('AI insights: querying DB for userId=', userId);
            transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(500).lean();
            console.log('AI insights: loaded transactions from DB, count=', Array.isArray(transactions) ? transactions.length : 'unknown', 'sample:', transactions?.[0]);
          }
        } else {
          console.log('AI insights: userId is empty after conversion');
        }
      } catch (err) {
        console.warn('AI insights: could not verify token or load transactions, falling back to mock', err);
      }
    }

    // 3) fallback to mock data
    if (!transactions) {
      console.log('AI insights: no transactions found for user / no auth - falling back to mock data');
      transactions = mockTransactions;
    }

    const dataString = JSON.stringify(transactions);
    let insight = await generateFinancialInsight(dataString);
    if (typeof insight === 'string') insight = insight.replace(/\*/g, '').trim();
    res.json({ insight });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

// Debug: return number of transactions for the user in the token and a small sample
app.get('/api/debug/transactions-count', async (req: Request, res: Response) => {
  try {
    if (!req.headers.authorization) return res.status(401).json({ message: 'Missing Authorization header' });
    const token = req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.slice(7).trim() : req.headers.authorization.trim();
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_1234';
    const payload: any = jwt.verify(token, JWT_SECRET);
    const userId = payload?.userId || payload?.id;
    if (!userId) return res.status(400).json({ message: 'Invalid token payload' });
    const mod = await import('./src/models/Transaction.ts');
  const Transaction = (mod && (mod.default ?? mod)) as any;
    if (!Transaction) return res.status(500).json({ message: 'Transaction model not available' });
    const count = await Transaction.countDocuments({ userId });
    const sample = await Transaction.find({ userId }).sort({ date: -1 }).limit(5).lean();
    res.json({ userId, count, sample });
  } catch (err: any) {
    console.error('debug/transactions-count error:', err);
    res.status(500).json({ message: 'Failed to read transactions from DB', detail: err?.message });
  }
});

// Add request logger to debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Start server after connecting to DB
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
})();
