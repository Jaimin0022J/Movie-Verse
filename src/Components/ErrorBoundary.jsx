import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0f",
            color: "#f1f1f1",
            fontFamily: "'Inter', sans-serif",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(229, 9, 20, 0.15)",
              border: "1px solid rgba(229, 9, 20, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              color: "#e50914",
              fontSize: 28,
            }}
          >
            !
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: "#a0a0b0", maxWidth: 450, marginBottom: 24, fontSize: 14 }}>
            We encountered a temporary issue while loading the application.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{
              background: "#e50914",
              color: "#ffffff",
              border: "none",
              padding: "12px 28px",
              borderRadius: 50,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(229, 9, 20, 0.4)",
            }}
          >
            Reload MovieVerse
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
