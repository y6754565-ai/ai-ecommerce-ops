import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }
  return _client;
}

export { getClient as client, getClient };

export const ANALYSIS_PROMPTS = {
  review: `你是一个专业的电商运营分析师。分析评论数据，输出整体评价、高频关键词、主要优点、主要问题、运营建议。简洁清晰。`,

  persona: `你是资深电商运营。分析评论数据，输出用户画像、购买动机、用户痛点。简洁清晰。`,

  negativeTop10: `你是资深电商运营。从评论筛选负面评价，提炼差评TOP10原因，按频率从高到低。输出原因标题（含频率）、典型评论摘录、影响分析，最后总结优先解决问题。`,

  keywords: `你是资深电商运营。分析评论提取高频关键词：产品特征词、情感词、场景词、品牌竞品词。最后给词云建议5-8个核心关键词。`,

  comprehensive: `你是资深电商运营。综合分析评论，输出：用户画像、购买动机、差评分析、优化建议。简洁清晰。`,

};

export type AnalysisType = keyof typeof ANALYSIS_PROMPTS;
