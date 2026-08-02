import React from 'react';
import { Wallet, Coffee, Car, Film } from 'lucide-react';

export default function SimpleLedgerView() {
  const records = [
    { id: '1', name: '全家二次元動漫聯名奶茶', amount: 45, category: '餐飲飲食', date: '2026-08-02', icon: Coffee },
    { id: '2', name: '捷運公車交通費', amount: 80, category: '交通出行', date: '2026-08-02', icon: Car },
    { id: '3', name: '二次元劇場版電影票', amount: 330, category: '休閒娛樂', date: '2026-08-01', icon: Film }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-1">
          <Wallet className="w-5 h-5 text-emerald-600" />
          生活極簡記帳模式
        </h2>
        <p className="text-slate-500 text-xs font-medium">
          低阻力快速紀錄日常開銷，與週邊訂單獨立隔離
        </p>
      </div>

      <div className="space-y-3">
        {records.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-sm block">{r.name}</span>
                  <span className="text-xs text-slate-500 font-medium">{r.category} • {r.date}</span>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-600 text-base">
                - NT$ {r.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
