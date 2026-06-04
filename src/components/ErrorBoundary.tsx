"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
          <p className="text-lg font-semibold text-zinc-800">加载失败</p>
          <p className="mt-2 text-sm text-zinc-500">
            {this.state.error || "未知错误"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="mt-4 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
