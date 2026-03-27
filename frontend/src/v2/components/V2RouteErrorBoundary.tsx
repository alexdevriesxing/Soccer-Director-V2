import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

class V2RouteErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected interface error occurred.'
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('V2RouteErrorBoundary caught an error:', error, errorInfo);
  }

  private resetBoundary = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="v2-route-error" role="alert" data-testid="v2-route-error-boundary">
        <div className="v2-route-error__card">
          <p className="v2-route-error__eyebrow">Soccer Director</p>
          <h2 className="v2-route-error__title">Interface recovery required</h2>
          <p className="v2-route-error__body">
            {this.state.errorMessage || 'An unexpected interface error occurred.'}
          </p>
          <div className="v2-inline-actions">
            <button type="button" className="v2-button v2-button--primary" onClick={this.resetBoundary}>
              Retry page
            </button>
            <Link className="v2-link-button v2-link-button--secondary" to="/hq" onClick={this.resetBoundary}>
              Return to HQ
            </Link>
            <Link className="v2-link-button v2-link-button--ghost" to="/save-load" onClick={this.resetBoundary}>
              Open Save / Load
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default V2RouteErrorBoundary;
