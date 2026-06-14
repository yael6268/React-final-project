import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTransactions, createTransaction } from './controllers/transaction.controller.ts';
// 🔥 הוספנו: ייבוא של פונקציית אימות JWT אמיתית
import { authenticateToken } from './middlewares/auth.middleware.ts';
// 🔥 הוספנו: ייבוא של פונקציות ההרשמה וההתחברות שלך
import { register, login } from './controllers/auth.controller.ts';
import budgetRoutes from '../routes/budgetRoutes.ts';
// @ts-ignore - service is JS
import { generateFinancialInsight } from '../services/aiService.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug: show which .env path is loaded and whether MONGODB_URI is present (masked)
const envPath = path.resolve(__dirname, '../../.env');
try {
  const uri = process.env.MONGODB_URI;
  const masked = uri ? uri.replace(/:(?:[^:@]+)@/, ':****@') : undefined;
  console.log('Loaded .env from:', envPath);
  console.log('MONGODB_URI present:', !!uri, masked ? `${masked.slice(0, 80)}...` : '');
} catch (e) {
  console.warn('Failed to read MONGODB_URI from env', e);
}

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

// Configure CORS to explicitly allow Authorization header for preflight
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// 🔥 הוספנו: הנתיבים האמיתיים של ההרשמה וההתחברות למערכת
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.use('/api/budgets', budgetRoutes);

app.use('/api/transactions', authenticateToken);
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

// AI insights endpoint: use posted transactions OR authenticated user's transactions from DB OR mock fallback
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
          const mod = await import('./models/Transaction.ts');
          const Transaction = (mod && (mod.default || mod.Transaction)) as any;
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
      transactions = [
        { category: 'מזון', amount: 1500, type: 'expense' },
        { category: 'חשבונות', amount: 900, type: 'expense' },
        { category: 'רכב', amount: 600, type: 'expense' },
        { category: 'פנאי', amount: 400, type: 'expense' },
      ];
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
    const mod = await import('./models/Transaction.ts');
    const Transaction = (mod && (mod.default || mod.Transaction)) as any;
    if (!Transaction) return res.status(500).json({ message: 'Transaction model not available' });
    const count = await Transaction.countDocuments({ userId });
    const sample = await Transaction.find({ userId }).sort({ date: -1 }).limit(5).lean();
    res.json({ userId, count, sample });
  } catch (err: any) {
    console.error('debug/transactions-count error:', err);
    res.status(500).json({ message: 'Failed to read transactions from DB', detail: err?.message });
  }
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