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

export type Currency = "HKD" | "USD" | "CNY" | "EUR" | "JPY" | "TWD" | "SGD" | "GBP";

export const CURRENCIES: Currency[] = [
  "HKD",
  "USD",
  "CNY",
  "EUR",
  "JPY",
  "TWD",
  "SGD",
  "GBP"
];

export interface Receipt {
  id: string;
  amount: number;
  currency: Currency;
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
  currency: Currency;
  merchant: string;
  date: string;
  category: Category;
}
