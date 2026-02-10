import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';
import App from './App';
import './index.css';

function getMutationErrorMessage(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
  if (ax?.response?.data?.message) return ax.response.data.message;
  if (ax?.message) return ax.message;
  if (ax?.response?.status === 401) return 'Session expired. Please sign in again.';
  if (ax?.response?.status === 403) return 'You do not have permission.';
  if (ax?.response?.status === 404) return 'Resource not found.';
  return 'Request failed. Please try again.';
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: {
      onError: (err) => {
        const msg = getMutationErrorMessage(err);
        window.dispatchEvent(new CustomEvent('fwwb-mutation-error', { detail: msg }));
      },
    },
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
