import React from 'react';
import ReactDOM from 'react-dom/client';

// Self-hosted fonts (was Google Fonts CDN): same-origin, hashed, immutable —
// no third-party connection in the critical render path. Weights mirror the
// old fonts.googleapis.com request.
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
// Playfair Display has no 300 weight (Google Fonts silently served 400 for
// the old wght@300 request); the browser's font matching does the same here.
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/400-italic.css';

import './index.css';
import App from './App';

class ErrorBoundary extends React.Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee', color: '#c00' }}>
          <h1>App Crashed</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import { HelmetProvider } from 'react-helmet-async';

// Legacy hash-URL redirect: BrowserRouter ignores the old `/#/path` URLs that may
// still be indexed or shared. Rewrite them to clean paths before the app mounts so
// those visitors (and any cached SERP links) land on the correct route.
if (window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.slice(1) + window.location.search;
  window.history.replaceState(null, '', cleanPath);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);