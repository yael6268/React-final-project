import type { Request, Response } from "express";
import * as budgetService from "../services/budgetService.ts";

// CREATE
const createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body?.userId;
        if (!userId) {
            res.status(400).json({ error: "Missing userId" });
            return;
        }

        const budget = await budgetService.createBudget({ ...req.body, userId });
        res.status(201).json(budget);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// GET ALL
const getBudgets = async (_req: Request, res: Response): Promise<void> => {
    try {
        const budgets = await budgetService.getBudgets();
        res.json(budgets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET BY ID
const getBudgetById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            res.status(400).json({ error: "Missing budget id" });
            return;
        }

        const budget = await budgetService.getBudgetById(id);
        if (!budget) {
            res.status(404).json({ error: "Budget not found" });
            return;
        }
        res.json(budget);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
const updateBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            res.status(400).json({ error: "Missing budget id" });
            return;
        }

        const updatedBudget = await budgetService.updateBudget(id, req.body);
        if (!updatedBudget) {
            res.status(404).json({ error: "Budget not found" });
            return;
        }
        res.json(updatedBudget);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE
const deleteBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            res.status(400).json({ error: "Missing budget id" });
            return;
        }

        const deletedBudget = await budgetService.deleteBudget(id);
        if (!deletedBudget) {
            res.status(404).json({ error: "Budget not found" });
            return;
        }
        res.json({ message: "Budget deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET budgets by user
const getBudgetsByUser = async (req: Request, res: Response): Promise<void> => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (!userId) {
        res.status(400).json({ error: "Missing userId parameter" });
        return;
    }

    const budgets = await budgetService.getBudgetsByUser(userId);
    res.json(budgets);
};

// GET budgets by month and year for a user
const getBudgetsByMonth = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const month = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
        const year = Array.isArray(req.params.year) ? req.params.year[0] : req.params.year;

        if (!userId || !month || !year) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }

        const budgets = await budgetService.getBudgetsByMonth(userId, Number(month), Number(year));
        res.json(budgets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET budget status for a user in a specific month and year
const getBudgetStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const month = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
        const year = Array.isArray(req.params.year) ? req.params.year[0] : req.params.year;

        if (!userId || !month || !year) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
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
