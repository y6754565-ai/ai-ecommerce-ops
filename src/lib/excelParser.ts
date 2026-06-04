"use client";

import type { ParseResult } from "./types";

export type { ParseResult };

export async function parseExcelFile(file: File): Promise<ParseResult> {
  const XLSX = await import("xlsx");

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

        let reviewKey: string | undefined;
        const exactNames = ["初评", "评论", "评价", "追评"];
        for (const name of exactNames) {
          reviewKey = headers.find((h) => h.trim() === name);
          if (reviewKey) break;
        }

        if (!reviewKey) {
          reject(new Error(`未找到评论列。文件列名：${headers.join("、")}`));
          return;
        }

        const followUpKey = headers.find((h) => h.trim() === "追评");

        const reviews: string[] = [];
        for (const row of jsonData) {
          const review = String(row[reviewKey] ?? "").trim();
          if (review.length > 0) reviews.push(review);

          if (followUpKey) {
            const followUp = String(row[followUpKey] ?? "").trim();
            if (followUp.length > 0) reviews.push(`[追评] ${followUp}`);
          }
        }

        if (reviews.length === 0) {
          reject(new Error(`"${reviewKey}" 列中没有找到有效评论`));
          return;
        }

        resolve({ reviews, totalCount: reviews.length, fileName: file.name });
      } catch (err) {
        reject(err instanceof Error ? err : new Error("文件解析失败"));
      }
    };

    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}
