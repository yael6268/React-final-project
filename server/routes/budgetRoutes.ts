import express from "express";
import budgetController from "../controllers/budgetController";

const router = express.Router();


// =======================
// 📌 STATUS 
// =======================
router.get(
    "/status/user/:userId/month/:month/year/:year",
    budgetController.getBudgetStatus
);


// =======================
// 📌 MONTHLY DATA
// =======================
router.get(
    "/user/:userId/month/:month/year/:year",
    budgetController.getBudgetsByMonth
);


// =======================
// 📌 USER BUDGETS
// =======================
router.get(
    "/user/:userId",
    budgetController.getBudgetsByUser
);


// =======================
// 📌 CRUD
// =======================

// CREATE
router.post("/", budgetController.createBudget);

// READ ALL
router.get("/", budgetController.getBudgets);

// READ ONE
router.get("/:id", budgetController.getBudgetById);

// UPDATE
router.put("/:id", budgetController.updateBudget);

// DELETE
router.delete("/:id", budgetController.deleteBudget);


export default router;