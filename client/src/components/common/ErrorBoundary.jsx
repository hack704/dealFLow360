import React from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = '/dashboard';
  };

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbfbfd] dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center justify-center p-6 antialiased">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white/90 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] shadow-2xl backdrop-blur-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3b30]/10 dark:bg-[#ff453a]/15 text-[#ff3b30] dark:text-[#ff453a] flex items-center justify-center mx-auto ring-8 ring-[#ff3b30]/10">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[20px] font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                Application View Recovered
              </h2>
              <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
                DealFlow360 encountered an unexpected view state. Click below to safely resume your session.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] text-left text-[11px] font-mono text-[#86868b] overflow-x-auto max-h-28 border border-black/[0.06] dark:border-white/[0.06]">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 h-10 px-4 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Dashboard</span>
              </button>
              <button
                onClick={this.handleReset}
                className="h-10 px-4 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-white text-[13px] font-medium flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
