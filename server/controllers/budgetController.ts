import { Request, Response } from "express";
import * as budgetService from "../services/budgetService.js";

// אחרי שאני מחברת את ה ענף שלי ל middleware אני יצטרך לשנות שיקח את  userId מה token של המשתמש ולא מה פרמטרים של ה url כמו שעשיתי פה עכשיו

// CREATE
const createBudget = async (req: Request, res: Response) => {
    try {
        const budget = await budgetService.createBudget(req.body);
        res.status(201).json(budget);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// GET ALL
const getBudgets = async (req: Request, res: Response) => {
    try {
        const budgets = await budgetService.getBudgets();
        res.json(budgets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET BY ID
const getBudgetById = async (req: Request, res: Response) => {
    try {
        const budget = await budgetService.getBudgetById(req.params.id);
        if (!budget) {
            return res.status(404).json({ error: "Budget not found" });
        }
        res.json(budget);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
const updateBudget = async (req: Request, res: Response) => {
    try {
        const updatedBudget = await budgetService.updateBudget(req.params.id, req.body);
        if (!updatedBudget) {
            return res.status(404).json({ error: "Budget not found" });
        }
        res.json(updatedBudget);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE
const deleteBudget = async (req: Request, res: Response) => {
    try {
        const deletedBudget = await budgetService.deleteBudget(req.params.id);
        if (!deletedBudget) {
            return res.status(404).json({ error: "Budget not found" });
        }
        res.json({ message: "Budget deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET budgets by user
const getBudgetsByUser = async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
    }

    const budgets = await budgetService.getBudgetsByUser(userId);
    res.json(budgets);
};

// GET budgets by month and year for a user
const getBudgetsByMonth = async (req: Request, res: Response) => {
    try {
        const { userId, month, year } = req.params;
        if (!userId || !month || !year) {
            return res.status(400).json({ error: "Missing required parameters" });
        }
        const budgets = await budgetService.getBudgetsByMonth(userId, month, year);
        res.json(budgets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET budget status for a user in a specific month and year
const getBudgetStatus = async (req: Request, res: Response) => {
    try {
        const { userId, month, year } = req.params;
        const result = await budgetService.getBudgetStatus(userId, month, year);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetsByUser,
    getBudgetsByMonth,
    getBudgetStatus,
};
