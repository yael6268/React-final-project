import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Define Transaction schema inline
const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  description: { type: String },
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

const seedTransactions = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/transactions';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // The userId from the token in the browser (use the one that appeared in the debug output)
    const userId = '6a2dbb459aee7414eacff580';

    // Sample transactions
    const transactions = [
      { title: 'קניות חודשיות', amount: 2500, type: 'expense', category: 'מזון', userId, date: new Date('2024-06-01') },
      { title: 'שכר עבודה', amount: 15000, type: 'income', category: 'הכנסה', userId, date: new Date('2024-06-05') },
      { title: 'חשמל וגז', amount: 800, type: 'expense', category: 'חשבונות', userId, date: new Date('2024-06-10') },
      { title: 'תיקון רכב', amount: 1200, type: 'expense', category: 'רכב', userId, date: new Date('2024-06-12') },
      { title: 'אינטרנט וטלפון', amount: 300, type: 'expense', category: 'חשבונות', userId, date: new Date('2024-06-15') },
      { title: 'בילוט קולנוע', amount: 100, type: 'expense', category: 'פנאי', userId, date: new Date('2024-06-18') },
      { title: 'בונוס עבודה', amount: 3000, type: 'income', category: 'הכנסה', userId, date: new Date('2024-06-20') },
      { title: 'גז לרכב', amount: 400, type: 'expense', category: 'רכב', userId, date: new Date('2024-06-22') },
    ];

    // Delete existing transactions for this user
    await Transaction.deleteMany({ userId });
    console.log('🗑️  Deleted existing transactions for this user');

    // Insert new transactions
    const result = await Transaction.insertMany(transactions);
    console.log(`✅ Created ${result.length} transactions for userId: ${userId}`);
    
    // Show what was created
    const count = await Transaction.countDocuments({ userId });
    console.log(`📊 Total transactions in DB for this user: ${count}`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedTransactions();
