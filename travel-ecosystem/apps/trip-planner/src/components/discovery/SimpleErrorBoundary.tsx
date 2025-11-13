import React from 'react';

type ResetHandler = () => void;

type FallbackRenderer = (error: Error, reset: ResetHandler) => React.ReactNode;

interface SimpleErrorBoundaryProps {
  fallback: FallbackRenderer;
  onReset?: ResetHandler;
  children: React.ReactNode;
}

interface SimpleErrorBoundaryState {
  error: Error | null;
}

export class SimpleErrorBoundary extends React.Component<
  SimpleErrorBoundaryProps,
  SimpleErrorBoundaryState
> {
  state: SimpleErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): SimpleErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('SimpleErrorBoundary caught an error', error, info);
    }
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      return fallback(error, this.reset);
    }

    return children;
  }
}
