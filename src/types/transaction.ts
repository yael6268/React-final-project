export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface TransactionPagination {
  total: number;
  page: number;
  pages: number;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  category?: string;
  type?: 'income' | 'expense';
  fromDate?: string;
  toDate?: string;
}
