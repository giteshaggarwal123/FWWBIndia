import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 24 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: 480, textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px', color: '#c53030' }}>Something went wrong</h2>
            <p style={{ color: '#4a5568', marginBottom: 24 }}>{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Reload page</button>
              <button type="button" onClick={() => { this.setState({ hasError: false, error: undefined }); window.location.href = '/dashboard'; }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Go to Dashboard</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
