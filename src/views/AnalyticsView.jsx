import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsView() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          資產與花費大盤分析
        </h2>
        <p className="text-slate-500 text-xs font-medium">
          分析角色 (白厄/雪初音)、品項分類與月度預算防護網
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">專欄累計留言記帳</span>
          <span className="text-2xl font-extrabold font-mono text-pink-600">NT$ 590</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">二次元週邊總估算</span>
          <span className="text-2xl font-extrabold font-mono text-purple-600">NT$ 850</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">本月剩餘預算</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600">NT$ 4,150</span>
        </div>
      </div>
    </div>
  );
}
