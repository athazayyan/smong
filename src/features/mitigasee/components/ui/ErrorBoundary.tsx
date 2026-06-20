"use client";

import React, { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Komponen fallback kustom (opsional) */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * ErrorBoundary React — menangkap error rendering yang tidak terduga.
 * Menyediakan tombol "Muat Ulang Halaman" sebagai recovery action.
 * Semua error teknis dicatat di console, pesan user disederhanakan.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("[MitigaSee] Uncaught render error:", error);
    return {
      hasError: true,
      errorMessage: error.message ?? "Error tidak diketahui",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[MitigaSee] componentDidCatch:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[60svh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-coral-50 text-coral-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-8 w-8"
            >
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-black text-ink-900">
            Terjadi Masalah
          </h2>
          <p className="mt-2 max-w-sm text-sm font-semibold leading-7 text-ink-700">
            Aplikasi mengalami gangguan tak terduga. Muat ulang halaman untuk
            mencoba lagi.
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Detail teknis: {this.state.errorMessage}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-full border border-purple-700/15 bg-white px-5 py-2.5 font-heading text-sm font-black text-purple-700 shadow-sm transition hover:bg-lavender-100"
            >
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-full bg-purple-900 px-5 py-2.5 font-heading text-sm font-black text-white shadow-[0_4px_0_#20104f] transition active:translate-y-0.5 active:shadow-[0_2px_0_#20104f]"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
