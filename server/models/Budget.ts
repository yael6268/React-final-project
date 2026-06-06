import mongoose, { Document, Schema } from "mongoose";

export interface IBudget extends Document {
    userId: string;
    category: string;
    limit: number;
    month: number;
    year: number;
}

const budgetSchema = new Schema<IBudget>({
    userId: String,
    category: String,
    limit: Number,
    month: Number,
    year: Number,
});

const Budget = mongoose.model<IBudget>("Budget", budgetSchema);
export default Budget;
