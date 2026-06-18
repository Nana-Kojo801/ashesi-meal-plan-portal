import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Log to an error-reporting service here if one is added in future.
    void error;
    void info;
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: '#fff',
              border: '1px solid #ECE0D4',
              borderRadius: 20,
              margin: 24,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1C1413' }}>
              Something went wrong
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#7A6A63',
                lineHeight: 1.5,
              }}
            >
              {this.state.message}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              style={{
                marginTop: 20,
                padding: '11px 20px',
                borderRadius: 12,
                background: '#D81E2C',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
