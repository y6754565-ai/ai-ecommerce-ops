"use client";

import * as XLSX from "xlsx";

export interface ParseResult {
  reviews: string[];
  totalCount: number;
  fileName: string;
}

// 常见的评论列名（按优先级排序，优先精确匹配）
const REVIEW_NAMES_EXACT = [
  "初评",
  "评论",
  "评价",
  "追评",
];

const REVIEW_NAMES_FUZZY = [
  "评论内容",
  "评价内容",
];

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          firstSheet,
          { defval: "" }
        );

        if (jsonData.length === 0) {
          reject(new Error("文件中没有数据"));
          return;
        }

        const headers = Object.keys(jsonData[0]);

        // 1. 精确匹配列名（优先级最高，避免 "初评" 误匹配 "初评时间"）
        let reviewKey: string | undefined;
        for (const name of REVIEW_NAMES_EXACT) {
          reviewKey = headers.find((h) => h.trim() === name);
          if (reviewKey) break;
        }

        // 2. 模糊匹配（列名包含关键词）
        if (!reviewKey) {
          for (const name of REVIEW_NAMES_FUZZY) {
            reviewKey = headers.find((h) => h.trim().includes(name));
            if (reviewKey) break;
          }
        }

        if (!reviewKey) {
          reject(
            new Error(
              `未找到评论列。文件列名：${headers.join("、")}`
            )
          );
          return;
        }

        // 3. 查找追评列（同样精确匹配优先）
        let followUpKey = headers.find((h) => h.trim() === "追评");

        const reviews: string[] = [];

        for (const row of jsonData) {
          const review = String(row[reviewKey] ?? "").trim();
          if (review.length > 0) {
            reviews.push(review);
          }

          if (followUpKey) {
            const followUp = String(row[followUpKey] ?? "").trim();
            if (followUp.length > 0) {
              reviews.push(`[追评] ${followUp}`);
            }
          }
        }

        if (reviews.length === 0) {
          reject(new Error(`"${reviewKey}" 列中没有找到有效评论`));
          return;
        }

        resolve({
          reviews,
          totalCount: reviews.length,
          fileName: file.name,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error("文件解析失败"));
      }
    };

    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}
