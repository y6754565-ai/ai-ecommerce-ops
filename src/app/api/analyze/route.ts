import { NextRequest } from "next/server";
import { client, ANALYSIS_PROMPTS, type AnalysisType } from "@/lib/openai";

const MAX_REVIEWS_PER_BATCH = 100;

export async function POST(req: NextRequest) {
  try {
    const { reviews, type } = (await req.json()) as {
      reviews: string[];
      type: AnalysisType;
    };

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return Response.json({ error: "请提供有效的评论数据" }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === "your-deepseek-api-key-here") {
      return Response.json(
        { error: "请在 .env.local 中配置 DEEPSEEK_API_KEY" },
        { status: 500 }
      );
    }

    const prompt = ANALYSIS_PROMPTS[type] || ANALYSIS_PROMPTS.review;

    const sample = reviews.slice(0, MAX_REVIEWS_PER_BATCH);
    const reviewText = sample
      .map((r, i) => `${i + 1}. ${r}`)
      .join("\n");

    const stream = await client().chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: `请分析以下 ${sample.length} 条商品评论（总计 ${reviews.length} 条，此处为抽样数据）：\n\n${reviewText}`,
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("分析失败:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "分析服务异常" },
      { status: 500 }
    );
  }
}
