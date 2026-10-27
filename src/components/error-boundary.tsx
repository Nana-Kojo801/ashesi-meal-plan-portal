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
          <div className="card empty-state boundary">
            <strong>Something went wrong</strong>
            <p>{this.state.message}</p>
            <button className="button primary" onClick={() => this.setState({ hasError: false, message: '' })}>
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
