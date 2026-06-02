import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AuraSense error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "var(--bg-body)" }}>
          <div className="max-w-md rounded-3xl border p-6 text-center" style={{ borderColor: "rgba(251,146,60,0.25)", background: "rgba(251,146,60,0.06)" }}>
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Something went wrong
            </h2>
            <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              {this.state.error?.message || "An unexpected error occurred. Please try again."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="rounded-2xl px-5 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
                style={{ background: "var(--accent-from)" }}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-2xl border px-5 py-2 text-sm font-medium transition"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)", color: "var(--text-primary)" }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
