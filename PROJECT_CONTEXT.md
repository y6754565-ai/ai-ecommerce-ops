# AI电商运营助手

## Github

https://github.com/y6754565-ai/ai-ecommerce-ops

## 当前版本

V1

## 已完成

- Excel上传
- CSV上传
- 评论读取
- 评论数量统计
- 评论预览
- Git管理
- Github同步

## 下一步

- AI评论分析
- 用户画像
- 购买动机
- 高频词
- 差评分析

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PWA (manifest + icons, 无 Service Worker)
- GitHub

## 架构速览

```
src/
├── app/
│   ├── layout.tsx    ← 根布局 (PWA meta, viewport)
│   ├── page.tsx      ← 主页 (上传+预览, "use client")
│   └── globals.css
└── lib/
    └── excelParser.ts ← Excel/CSV 解析 (xlsx 库)
```

## 开发原则

- 所有功能增量开发
- 禁止重构
- 禁止删除现有功能
- 每次开发前必须阅读本文件
