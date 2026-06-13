import Budget from "../models/Budget.ts"

type BudgetData = {
    userId: string;
    category: string;
    limit: number;
    month: number;
    year: number;
    [key: string]: any;
};

export const createBudget = async (budgetData: BudgetData): Promise<any> => {
    const budget = new Budget(budgetData);
    return await budget.save();
};

export const getBudgets = async (): Promise<any[]> => {
    return await Budget.find();
};

export const getBudgetById = async (id: string): Promise<any | null> => {
    return await Budget.findById(id);
};

export const updateBudget = async (
    id: string,
    budgetData: Partial<BudgetData>
): Promise<any | null> => {
    return await Budget.findByIdAndUpdate(id, budgetData, { new: true });
};

export const deleteBudget = async (id: string): Promise<any | null> => {
    return await Budget.findByIdAndDelete(id);
};

export const getBudgetsByUser = async (userId: string): Promise<any[]> => {
    const budgets = await Budget.find({ userId });
    return budgets;
};

export const getBudgetsByMonth = async (
    userId: string,
    month: number,
    year: number
): Promise<any[]> => {
    const budgets = await Budget.find({
        userId,
        month,
        year,
    });

    return budgets;
};

export const getBudgetStatus = async (
    userId: string,
    month: number,
    year: number
): Promise<any[]> => {

    const budgets = await Budget.find({
        userId,
        month,
        year,
    });

    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(year, month, 1);

    // Transaction model may not be present in simplified dev setup.
    // If it's available, you can replace the following with a real query.
    const transactions: any[] = [];

    const result = budgets.map((budget: any) => {

        const categoryTransactions = transactions.filter(
            (t: any) => t.category === budget.category
        );

        const spent = categoryTransactions.reduce(
            (sum: number, t: any) => sum + t.amount,
            0
        );

        const remaining = budget.limit - spent;

        const percentage =
            budget.limit > 0
                ? (spent / budget.limit) * 100
                : 0;

        return {
            category: budget.category,
            limit: budget.limit,
            spent,
            remaining,
            percentage,
            isOverBudget: spent > budget.limit,
        };
    });

    return result;
};