import { useEffect, useState } from "react";
import axios from "axios";

type BudgetStatus = {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
};

export default function BudgetStatusPage() {
  const [data, setData] = useState<BudgetStatus[]>([]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5000/budgets/status/user/USER_ID/month/5/year/2026",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setData(res.data);
  };

  return (
    <div>
      <h1>Budget Status</h1>
    </div>
  );
}