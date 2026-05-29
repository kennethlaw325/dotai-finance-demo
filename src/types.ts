export type Category =
  | "餐飲"
  | "交通"
  | "購物"
  | "辦公"
  | "差旅"
  | "雜項";

export const CATEGORIES: Category[] = [
  "餐飲",
  "交通",
  "購物",
  "辦公",
  "差旅",
  "雜項"
];

export interface Receipt {
  id: string;
  amount: number;
  merchant: string;
  date: string; // ISO yyyy-mm-dd
  category: Category;
  note?: string;
  reimbursable: boolean;
  imageDataUrl?: string;
  createdAt: string;
}

export interface Budget {
  category: Category;
  monthlyLimit: number;
}

export interface ExtractedReceipt {
  amount: number;
  merchant: string;
  date: string;
  category: Category;
}
