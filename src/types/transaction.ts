export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  category?: string;
  type?: TransactionType;
  fromDate?: string;
  toDate?: string;
}

export interface TransactionPagination {
  total: number;
  page: number;
  pages: number;
}
