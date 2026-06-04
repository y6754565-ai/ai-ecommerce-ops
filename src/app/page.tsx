"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { parseExcelFile } from "@/lib/excelParser";
import type { ParseResult } from "@/lib/types";
import type { AnalysisType } from "@/lib/openai";

const ANALYSIS_LABELS: Record<AnalysisType, string> = {
  review: "评论分析",
  persona: "用户画像",
  negativeTop10: "差评TOP10",
  keywords: "高频关键词",
  comprehensive: "整合报告",
};

const ANALYSIS_TYPES: AnalysisType[] = [
  "review",
  "persona",
  "negativeTop10",
  "keywords",
  "comprehensive",
];

export default function Home() {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [analyses, setAnalyses] = useState<Partial<Record<AnalysisType, string>>>({});
  const [analysisError, setAnalysisError] = useState<string | null>(null);


  useEffect(() => {
    const blockDrop = (e: Event) => e.preventDefault();
    window.addEventListener("dragover", blockDrop, true);
    window.addEventListener("drop", blockDrop, true);
    return () => {
      window.removeEventListener("dragover", blockDrop, true);
      window.removeEventListener("drop", blockDrop, true);
    };
  }, []);

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
    setAnalyses({});
    setActiveAnalysis(null);
    setAnalysisError(null);
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFile]
  );

  const startAnalysis = useCallback(
    async (type: AnalysisType) => {
      if (!result) return;
      setAnalyzing(true);
      setActiveAnalysis(type);
      setAnalysisError(null);
      setAnalyses((prev) => ({ ...prev, [type]: "" }));
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviews: result.reviews, type }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "分析失败");
        }
        const reader = res.body?.getReader();
        if (!reader) throw new Error("无法读取响应流");
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setAnalyses((prev) => ({ ...prev, [type]: text }));
        }
        text += decoder.decode();
        setAnalyses((prev) => ({ ...prev, [type]: text }));
      } catch (err) {
        setAnalysisError(err instanceof Error ? err.message : "分析服务异常");
      } finally {
        setAnalyzing(false);
      }
    },
    [result]
  );

  const previewReviews = result
    ? previewExpanded
      ? result.reviews
      : result.reviews.slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-zinc-50">
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

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
            dragOver ? "border-blue-400 bg-blue-50/50" : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
          } ${loading ? "pointer-events-none opacity-50" : ""}`}
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleChange} className="hidden" />
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
              <p className="text-sm font-medium text-zinc-700">上传 Excel 文件</p>
              <p className="text-xs text-zinc-400">拖拽文件到此处，或点击选择</p>
              <div className="flex gap-2">
                {[".xlsx", ".xls", ".csv"].map((f) => (
                  <span key={f} className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <>
            {/* Stats + Buttons */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                  <span className="text-2xl font-bold text-blue-600">{result.totalCount}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900">评论数量</p>
                  <p className="text-xs text-zinc-400 truncate">{result.fileName}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {ANALYSIS_TYPES.map((type) => {
                  const isActive = activeAnalysis === type && analyzing;
                  const hasResult = analyses[type] && !analyzing;
                  return (
                    <button
                      key={type}
                      onClick={() => startAnalysis(type)}
                      disabled={analyzing}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                        hasResult
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : isActive
                            ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                            : analyzing
                              ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                              : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95"
                      }`}
                    >
                      {isActive ? (
                        <><span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />分析中</>
                      ) : hasResult ? (
                        <><CheckIcon />{ANALYSIS_LABELS[type]}</>
                      ) : (
                        <><SparkleIcon />{ANALYSIS_LABELS[type]}</>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {analysisError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{analysisError}</p>
              </div>
            )}

            {ANALYSIS_TYPES.map((type) => {
              const content = analyses[type];
              const isActive = activeAnalysis === type && analyzing;
              if (!content && !isActive) return null;
              return (
                <div key={type} className="rounded-2xl border border-zinc-200 bg-white">
                  <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
                    <h2 className="text-sm font-medium text-zinc-700">{ANALYSIS_LABELS[type]} 报告</h2>
                    {isActive && <span className="text-xs text-zinc-400">生成中...</span>}
                  </div>
                  <div className="px-5 py-4">
                    <div className="prose prose-sm prose-zinc max-w-none whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                      {content || (
                        <span className="inline-flex items-center gap-2 text-zinc-400">
                          <span className="h-3 w-3 animate-pulse rounded-full bg-zinc-400" />正在分析...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Preview */}
            <div className="rounded-2xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
                <h2 className="text-sm font-medium text-zinc-700">
                  评论预览{!previewExpanded && result.reviews.length > 5 && <span className="ml-1 text-zinc-400">(前 5 条)</span>}
                </h2>
                {result.reviews.length > 5 && (
                  <button onClick={() => setPreviewExpanded(!previewExpanded)} className="text-xs font-medium text-blue-600">
                    {previewExpanded ? "收起" : "查看全部"}
                  </button>
                )}
              </div>
              <div className="divide-y divide-zinc-50">
                {previewReviews.map((review, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-50">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-500">{i + 1}</span>
                    <p className="text-sm leading-relaxed text-zinc-600">{review}</p>
                  </div>
                ))}
              </div>
              {!previewExpanded && result.reviews.length > 5 && (
                <div className="border-t border-zinc-50 px-5 py-3 text-center">
                  <p className="text-xs text-zinc-400">还有 {result.reviews.length - 5} 条评论</p>
                </div>
              )}
            </div>
          </>
        )}

        {!result && !loading && !error && (
          <div className="mt-12 text-center">
            <p className="text-sm text-zinc-400">Excel 文件需包含 &ldquo;初评&rdquo; 或 &ldquo;评论&rdquo; 列</p>
          </div>
        )}

        {/* Competitor Analysis Section */}
        <div className="rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h2 className="text-sm font-medium text-zinc-700">竞品分析</h2>
            <span className="text-xs text-zinc-400">输入信息 → AI分析</span>
          </div>
          <div className="p-5 space-y-3">
            <input
              type="text"
              value={compTitle}
              onChange={(e) => setCompTitle(e.target.value)}
              placeholder="商品标题 *"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
            <div className="flex gap-3">
              <input
                type="text"
                value={compPrice}
                onChange={(e) => setCompPrice(e.target.value)}
                placeholder="价格"
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <input
                type="text"
                value={compSales}
                onChange={(e) => setCompSales(e.target.value)}
                placeholder="销量"
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={startCompetitorAnalysis}
                disabled={compAnalyzing || !compTitle.trim()}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  compAnalyzing || !compTitle.trim()
                    ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                    : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95"
                }`}
              >
                {compAnalyzing ? (
                  <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />分析中</>
                ) : (
                  <><SparkleIcon />竞品分析</>
                )}
              </button>
              {(compTitle || compAnalysis) && (
                <button onClick={resetCompetitor} className="rounded-lg px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-100">
                  清空
                </button>
              )}
            </div>
            {compAnalysis && (
              <div className="mt-3 rounded-xl bg-zinc-50 p-4">
                <div className="prose prose-sm prose-zinc max-w-none whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {compAnalysis}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
      <path d="M19 15l.5 2L21 17.5l-1.5.5L19 20l-.5-2L17 17.5l1.5-.5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
