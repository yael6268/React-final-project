import type { Request, Response } from "express";
import * as budgetService from "../services/budgetService.ts";

// אחרי שאני מחברת את ה ענף שלי ל middleware אני יצטרך לשנות שיקח את  userId מה token של המשתמש ולא מה פרמטרים של ה url כמו שעשיתי פה עכשיו

// CREATE
const createBudget = async (req: Request, res: Response) => {
    try {
        const userId = req.body?.userId;
        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }

        const budget = await budgetService.createBudget({ ...req.body, userId });
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
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({ error: "Missing budget id" });
        }

        const budget = await budgetService.getBudgetById(id);
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
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({ error: "Missing budget id" });
        }

        const updatedBudget = await budgetService.updateBudget(id, req.body);
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
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({ error: "Missing budget id" });
        }

        const deletedBudget = await budgetService.deleteBudget(id);
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
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
    }

    const budgets = await budgetService.getBudgetsByUser(userId);
    res.json(budgets);
};

// GET budgets by month and year for a user
const getBudgetsByMonth = async (req: Request, res: Response) => {
    try {
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const month = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
        const year = Array.isArray(req.params.year) ? req.params.year[0] : req.params.year;

        if (!userId || !month || !year) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const budgets = await budgetService.getBudgetsByMonth(userId, Number(month), Number(year));
        res.json(budgets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET budget status for a user in a specific month and year
const getBudgetStatus = async (req: Request, res: Response) => {
    try {
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const month = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
        const year = Array.isArray(req.params.year) ? req.params.year[0] : req.params.year;

        if (!userId || !month || !year) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const result = await budgetService.getBudgetStatus(userId, Number(month), Number(year));
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
