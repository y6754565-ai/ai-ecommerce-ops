"use client";

import { useState, useCallback, useRef } from "react";
import { parseExcelFile, type ParseResult } from "@/lib/excelParser";

export default function Home() {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "csv", "xls"].includes(ext)) {
      setError("仅支持 .xlsx、.xls 或 .csv 格式的文件");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setPreviewExpanded(false);

    try {
      const parsed = await parseExcelFile(file);
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input value to allow re-uploading same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFile]
  );

  const previewReviews = result
    ? previewExpanded
      ? result.reviews
      : result.reviews.slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            AI电商运营助手
          </h1>
          {result && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              已加载
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-2xl border-2 border-dashed
            p-10 text-center transition-all duration-200
            ${
              dragOver
                ? "border-blue-400 bg-blue-50/50"
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
            }
            ${loading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleChange}
            className="hidden"
          />

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              <p className="text-sm text-zinc-500">解析中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
                <UploadIcon />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700">
                  上传 Excel 文件
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  拖拽文件到此处，或点击选择
                </p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                  .xlsx
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                  .xls
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                  .csv
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Stats Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                  <span className="text-2xl font-bold text-blue-600">
                    {result.totalCount}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">评论数量</p>
                  <p className="text-xs text-zinc-400">{result.fileName}</p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
                <h2 className="text-sm font-medium text-zinc-700">
                  评论预览
                  {!previewExpanded && result.reviews.length > 5 && (
                    <span className="ml-1 text-zinc-400">
                      (前 5 条)
                    </span>
                  )}
                </h2>
                {result.reviews.length > 5 && (
                  <button
                    onClick={() => setPreviewExpanded(!previewExpanded)}
                    className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                  >
                    {previewExpanded ? "收起" : "查看全部"}
                  </button>
                )}
              </div>
              <div className="divide-y divide-zinc-50">
                {previewReviews.map((review, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-zinc-50"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-500">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-zinc-600">
                      {review}
                    </p>
                  </div>
                ))}
              </div>
              {!previewExpanded && result.reviews.length > 5 && (
                <div className="border-t border-zinc-50 px-5 py-3 text-center">
                  <p className="text-xs text-zinc-400">
                    还有 {result.reviews.length - 5} 条评论
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="mt-12 text-center">
            <p className="text-sm text-zinc-400">
              Excel 文件第一列需包含 &ldquo;评论&rdquo; 字段
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-500"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
