import mongoose from 'mongoose';
import Transaction from '../models/Transaction.ts';
import * as transactionService from '../services/transaction.service.ts';

const run = async () => {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/transactions';
  await mongoose.connect(uri);

  // clear and seed test transactions
  await Transaction.deleteMany({});

  const docs = [
    { title: 't1', amount: 100, type: 'expense', category: 'מזון', date: new Date('2026-06-01'), userId: 'u1' },
    { title: 't2', amount: 200, type: 'expense', category: 'מזון', date: new Date('2026-06-05'), userId: 'u1' },
    { title: 't3', amount: 300, type: 'income', category: 'משכורת', date: new Date('2026-06-10'), userId: 'u1' },
  ];
  await Transaction.insertMany(docs);

  // test filter from 2026-06-02 to 2026-06-09 -> should return only t2
  const res = await transactionService.fetchTransactions('u1', { page: 1, limit: 10, fromDate: '2026-06-02', toDate: '2026-06-09' });
  console.log('Filtered count (expect 1):', res.transactions.length);
  if (res.transactions.length !== 1) process.exit(2);

  // test open ended fromDate only
  const res2 = await transactionService.fetchTransactions('u1', { page: 1, limit: 10, fromDate: '2026-06-05' });
  console.log('Filtered count from 6/5 (expect 2):', res2.transactions.length);
  if (res2.transactions.length !== 2) process.exit(3);

  console.log('Date filter tests passed');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
