"use client";

import React, { ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary - Catches React component errors and displays fallback UI
 * Prevents entire app from crashing due to component errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                      Something went wrong
                    </h2>
                    <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                      An unexpected error occurred. Try refreshing the page or contact support if the problem persists.
                    </p>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                      <details className="mb-4">
                        <summary className="text-xs font-mono text-red-700 dark:text-red-400 cursor-pointer mb-2">
                          Error details (dev only)
                        </summary>
                        <pre className="text-xs text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto max-h-40">
                          {this.state.error.toString()}
                        </pre>
                      </details>
                    )}
                    <button
                      onClick={this.handleReset}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
