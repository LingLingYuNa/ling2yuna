import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
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

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = () => {
    if (window.confirm("確定要重置網頁快取並重新載入嗎？（您的專欄紀錄不會丟失）")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#bfc9eb]/30 flex items-center justify-center p-4">
          <div className="bg-white border border-[#4c4993]/30 rounded-lg p-6 max-w-md w-full shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto border border-amber-300">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            
            <h2 className="text-lg font-black text-[#4c4993]">
              CollectTrack 系統載入保護
            </h2>
            
            <p className="text-xs text-[#4c4993] font-semibold leading-relaxed">
              檢測到網頁資源重新載入中的狀態問題。請點擊下方按鈕刷新頁面以載入最新網頁。
            </p>

            {this.state.error && (
              <div className="bg-red-50 p-2.5 rounded border border-red-200 text-[11px] text-red-700 font-mono text-left max-h-24 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 btn-noguchi-primary font-black text-xs py-2 rounded-md transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>重新整理頁面</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="px-3 py-2 text-xs font-bold text-[#4c4993] bg-[#f4f5f1] hover:bg-[#bfc9eb]/30 rounded-md border border-[#bfc9eb] transition cursor-pointer"
              >
                清空快取重試
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
