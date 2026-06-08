import axios from "axios";

const BASE_URL = "http://localhost:5000/budgets";

// יצירת תקציב חדש
export const createBudget = async (budgetData: any) => {
    const response = await axios.post(BASE_URL, budgetData);
    return response.data;
};

// קבלת כל התקציבים של משתמש
export const getBudgetsByUser = async (userId: string) => {
    const response = await axios.get(
        `${BASE_URL}/user/${userId}`
    );

    return response.data;
};

// קבלת תקציבים לפי חודש ושנה
export const getBudgetsByMonth = async (
    userId: string,
    month: number,
    year: number
) => {
    const response = await axios.get(
        `${BASE_URL}/user/${userId}/month/${month}/year/${year}`
    );

    return response.data;
};

// קבלת סטטוס התקציבים
export const getBudgetStatus = async (
    userId: string,
    month: number,
    year: number
) => {
    const response = await axios.get(
        `${BASE_URL}/status/user/${userId}/month/${month}/year/${year}`
    );

    return response.data;
};

// עדכון תקציב
export const updateBudget = async (
    id: string,
    budgetData: any
) => {
    const response = await axios.put(
        `${BASE_URL}/${id}`,
        budgetData
    );

    return response.data;
};

// מחיקת תקציב
export const deleteBudget = async (id: string) => {
    const response = await axios.delete(
        `${BASE_URL}/${id}`
    );

    return response.data;
};