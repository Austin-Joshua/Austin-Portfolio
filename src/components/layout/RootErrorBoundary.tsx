import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

export interface RootErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface RootErrorBoundaryState {
  hasError: boolean;
}

export class RootErrorBoundary extends Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  public override state: RootErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[RootErrorBoundary] Unhandled render error:', error, errorInfo);
    }
  }

  private readonly handleReload = (): void => {
    if (this.props.onReset) {
      this.setState({ hasError: false });
      this.props.onReset();
      return;
    }

    window.location.reload();
  };

  public override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] flex items-center justify-center px-5 py-12"
      >
        <div
          role="alert"
          className="glass-surface-strong w-full max-w-lg p-6 md:p-8 border border-[var(--border-glass)]"
        >
          <p className="type-meta uppercase text-[var(--text-muted)] mb-3">
            SYSTEM // RECOVERY
          </p>
          <h1 className="type-h2 text-[var(--text-primary)] mb-4">
            Austin Joshua — Portfolio
          </h1>
          <p className="type-body text-[var(--text-secondary)] mb-6">
            An unexpected rendering issue interrupted the view. Reload the page
            to restore the portfolio.
          </p>
          <Button variant="primary" size="md" onClick={this.handleReload}>
            Reload Page
          </Button>
        </div>
      </main>
    );
  }
}
