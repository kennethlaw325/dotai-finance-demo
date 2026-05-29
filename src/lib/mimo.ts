import type { Category, ExtractedReceipt } from "../types";
import { CATEGORIES } from "../types";
import { loadMimoConfig } from "./config";

// MiMo Vision OCR client (BYOK — bring your own key)
//
// Reads API key from LocalStorage (Settings UI) first, then env vars
// (VITE_MIMO_API_KEY in .env.local) as dev fallback. If neither set,
// returns a deterministic mock.
//
// Endpoint:  POST {baseUrl}/chat/completions  (OpenAI-compatible)
// Model:     mimo-v2-omni (only multimodal one — v2.5-pro returns 404
//            "No endpoints found that support image input")
// Image:     base64 data URL in user message content[].image_url.url

const SYSTEM_PROMPT = `你係收據解析助手。輸入係一張收據圖片，請抽取以下欄位並以 JSON 回覆，唔好加任何 markdown 或解釋：

{
  "amount": number (HKD，只要數字),
  "merchant": string (商戶名稱),
  "date": string (yyyy-mm-dd 格式),
  "category": "餐飲" | "交通" | "購物" | "辦公" | "差旅" | "雜項"
}

如果某欄位睇唔清，盡量估；amount 預設 0；date 預設今日；category 預設「雜項」。`;

export async function extractReceipt(
  imageDataUrl: string
): Promise<ExtractedReceipt> {
  const { apiKey, baseUrl, model } = loadMimoConfig();

  if (!apiKey) {
    return mockExtract();
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "請解析呢張收據。" },
            { type: "image_url", image_url: { url: imageDataUrl } }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    })
  });

  if (!res.ok) {
    throw new Error(`MiMo API error ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);

  return normalize(parsed);
}

function normalize(raw: Partial<ExtractedReceipt>): ExtractedReceipt {
  const cat = (CATEGORIES as string[]).includes(raw.category ?? "")
    ? (raw.category as Category)
    : "雜項";
  return {
    amount: Number(raw.amount) || 0,
    merchant: String(raw.merchant ?? "未知商戶"),
    date: String(raw.date ?? today()),
    category: cat
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const MOCK_SAMPLES: ExtractedReceipt[] = [
  { amount: 88, merchant: "翠華餐廳", date: today(), category: "餐飲" },
  { amount: 23.5, merchant: "港鐵 MTR", date: today(), category: "交通" },
  { amount: 459, merchant: "Apple Store", date: today(), category: "辦公" },
  { amount: 1280, merchant: "Lalamove", date: today(), category: "差旅" },
  { amount: 168, merchant: "Watsons", date: today(), category: "購物" }
];

let mockCursor = 0;

async function mockExtract(): Promise<ExtractedReceipt> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
  const sample = MOCK_SAMPLES[mockCursor % MOCK_SAMPLES.length];
  mockCursor += 1;
  return { ...sample };
}

export function isMockMode(): boolean {
  return !loadMimoConfig().apiKey;
}
