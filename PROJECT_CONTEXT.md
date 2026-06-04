# AI电商运营助手 — 项目上下文

## 项目信息

- **名称**: AI电商运营助手
- **仓库**: https://github.com/y6754565-ai/ai-ecommerce-ops
- **技术栈**: Next.js 14 (App Router) + TypeScript + Tailwind + DeepSeek API
- **部署**: Vercel (需VPN) + GitHub Pages (国内可访问)
- **本地端口**: 3001（3000 被 Codex 占用）
- **开发方式**: Codex 主线程，增量开发，禁止重构

## 核心原则

1. **不爬虫、不破解、不碰风控** — 全部基于人工导出的 Excel/CSV 分析
2. **所有功能增量开发** — 每次只加新模块，不动已有功能
3. **每个模块独立 Git Commit** — `git commit -m "feat: 模块名"`
4. **一个项目、一个仓库、十个模块** — 不拆成多个 Agent 项目
5. **API Key 用 DeepSeek** — 配置在 `.env.local`，不暴露到前端

## 当前进度

### ✅ 第一阶段：评论分析模块（已完成）

- [x] Next.js 项目初始化
- [x] Excel/CSV 上传与解析（xlsx 库，动态加载）
- [x] 评论预览、数量统计
- [x] PWA 支持（manifest.json + apple-meta）
- [x] GitHub 仓库管理
- [x] GitHub Pages 部署
- [x] Vercel 部署

### ✅ AI 分析功能（已完成）

- [x] 评论分析 — 整体评价/关键词/优点/问题/建议
- [x] 用户画像 — 画像/购买动机/痛点
- [x] 差评 TOP10 — 差评原因排行
- [x] 高频关键词 — 词频分析 + 词云建议
- [x] 整合报告 — 画像+动机+差评+建议四合一

### ✅ 竞品分析模块（基础版，已完成）

- [x] 手动输入商品标题/价格/销量
- [x] AI 分析：标题关键词、卖点、人群、场景、主图
- [x] 前端竞品分析输入区

## 项目结构

```
ai-ecommerce-ops/
├── src/app/
│   ├── page.tsx                    # 首页（上传 + 分析按钮 + 竞品输入）
│   ├── layout.tsx                  # 根布局（PWA meta）
│   ├── globals.css                 # Tailwind
│   ├── api/analyze/route.ts        # 评论分析 API
│   ├── api/competitor/route.ts     # 竞品分析 API
│   └── test/page.tsx               # 测试页
├── src/lib/
│   ├── openai.ts                   # DeepSeek 客户端 + 所有 Prompt
│   ├── excelParser.ts              # Excel 解析工具
│   └── types.ts                    # 类型定义
├── src/components/
│   └── ErrorBoundary.tsx           # 错误边界
├── public/
│   ├── manifest.json               # PWA 配置
│   └── icons/                      # PWA 图标
├── .github/workflows/deploy.yml    # GitHub Pages 自动部署
├── .env.local                      # DeepSeek API Key（不提交）
└── PROJECT_CONTEXT.md              # 本文件
```

## 环境变量

`.env.local`:
```
DEEPSEEK_API_KEY=sk-xxx
```

Vercel 环境变量：`DEEPSEEK_API_KEY`（已配置）

## 启动命令

```bash
cd ai-ecommerce-ops
npm run dev -- -p 3001   # 本地开发
npm run build             # 构建
```

## 部署地址

- Vercel: https://ai-ecommerce-ops.vercel.app（需VPN）
- GitHub Pages: https://y6754565-ai.github.io/ai-ecommerce-ops/（国内可访问，无API功能）

---

## 路线图（10 模块 → 1 个运营中台）

### 第一阶段 ✅ 评论分析模块（已完成）
Excel上传 → 评论预览 → 统计数量 → AI分析（5种分析维度）

### 第二阶段 ✅ AI 分析能力（已完成）
用户画像、购买动机、差评TOP10、高频关键词、整合报告

### 第三阶段 ⬜ 差评分析 Agent（下一步）
- 上传评价报表 → 自动识别评分字段
- 筛选低分评价 → 差评原因TOP10 + 原话 + 改进建议

### 第四阶段 ⬜ 用户画像 Agent
- 上传生意参谋/达摩盘人群数据
- AI分析：核心用户、购买力、年龄层、消费习惯

### 第五阶段 ⬜ 竞品分析 Agent（升级）
- 上传竞品 Excel（标题/价格/销量/评价）
- AI对比：优势/劣势/市场机会/价格带

### 第六阶段 ⬜ 标题生成 Agent
- 输入产品名/卖点/关键词 → 输出天猫标题/搜索词/直通车词

### 第七阶段 ⬜ 主图文案 Agent
- 上传商品图片 → AI分析视觉 → 生成主图文案

### 第八阶段 ⬜ 详情页 Agent
- 输入产品参数 → 生成详情页框架/卖点顺序/FAQ

### 第九阶段 ⬜ 小红书 Agent
- 输入产品资料 → 输出种草文案/标题/标签

### 第十阶段 ⬜ 运营中台
- 统一界面：菜单 + 功能模块
- 用户选择分析类型 → 上传数据 → 输出结果

## 与 Codex 配合规则

每次新会话第一句话：
```
先阅读 PROJECT_CONTEXT.md，理解项目现状。
禁止重构，禁止重新生成项目，所有功能增量开发。
```
