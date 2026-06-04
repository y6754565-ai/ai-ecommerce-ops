import OpenAI from "openai";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf-8");
const keyMatch = env.match(/DEEPSEEK_API_KEY=(.+)/);
if (!keyMatch) { console.error("No key found"); process.exit(1); }
const key = keyMatch[1].trim();

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: key,
});

const stream = await client.chat.completions.create({
  model: "deepseek-chat",
  messages: [{
    role: "user",
    content: `请访问这个天猫商品链接并提取所有信息：
https://detail.tmall.com/item.htm?id=742487634701

请以 JSON 格式输出：
{
  "title": "商品完整标题",
  "price": "价格",
  "sales": "销量",
  "titleKeywords": ["关键词1", "关键词2"],
  "sellingPoints": ["卖点1", "卖点2"],
  "targetAudience": "目标人群",
  "usageScenarios": ["场景1, "场景2"],
  "mainImageAnalysis": {
    "sellingPoints": ["主图卖点"],
    "style": "设计风格",
    "colors": ["主色调"],
    "layout": "布局"
  }
}

请实际访问链接获取真实数据，不要编造。`
  }],
  stream: true,
  temperature: 0.3,
  max_tokens: 2048,
});

let result = "";
for await (const chunk of stream) {
  const c = chunk.choices[0]?.delta?.content;
  if (c) process.stdout.write(c);
}
console.log("");
