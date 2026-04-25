import { Component, type ErrorInfo, type ReactNode } from "react";
import { Flower2, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Frontend crash:", error, info);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4 text-white-alt">
        <section className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky/10 text-sky">
            <Flower2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Что-то пошло не так</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Страница временно сломалась, но сайт жив. Обновите страницу, и мы попробуем открыть её заново.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-sky px-5 py-3 font-bold text-ink transition hover:brightness-110"
          >
            <RefreshCw className="h-4 w-4" />
            Обновить страницу
          </button>
        </section>
      </main>
    );
  }
}
