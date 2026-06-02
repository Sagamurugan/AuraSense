import { Component } from "react";

class ViewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel-card p-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            {this.props.title || "This section failed to load."}
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl border px-4 py-2"
            style={{ borderColor: "var(--border-color)" }}
            onClick={() => this.setState({ hasError: false })}
          >
            Retry section
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}

export default ViewErrorBoundary;
