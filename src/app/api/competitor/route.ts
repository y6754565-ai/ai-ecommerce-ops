import { NextRequest } from "next/server";
import { getClient, ANALYSIS_PROMPTS } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { title, price, sales, description } = await req.json();

    if (!title) {
      return Response.json({ error: "请提供商品标题" }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === "your-deepseek-api-key-here") {
      return Response.json({ error: "请配置 DEEPSEEK_API_KEY" }, { status: 500 });
    }

    const context = [
      `商品标题：${title}`,
      price ? `价格：${price}` : "",
      sales ? `销量：${sales}` : "",
      description ? `补充描述：${description}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const stream = await getClient().chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: ANALYSIS_PROMPTS.competitor },
        { role: "user", content: `请分析以下竞品信息：\n\n${context}` },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "服务异常" },
      { status: 500 }
    );
  }
}
