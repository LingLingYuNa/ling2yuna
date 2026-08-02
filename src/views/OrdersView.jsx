import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronRight, Plus } from 'lucide-react';

export default function OrdersView() {
  const [orders] = useState([
    {
      id: 'ord-1',
      name: '白厄周邊安利美特代購單',
      date: '2026-07-28',
      currency: 'TWD',
      exchangeRate: 1,
      shippingFee: 150,
      discount: 50,
      status: '🟠 已匯款/下單',
      items: [
        { id: 'itm-1', name: '白厄隨機特典小卡 (共5張)', price: 300, qty: 1, weight: 0.1, status: '🟠 已下單' },
        { id: 'itm-2', name: '白厄亞克力立牌 限定款', price: 450, qty: 1, weight: 0.25, status: '🟠 已下單' }
      ]
    }
  ]);

  const [expandedId, setExpandedId] = useState('ord-1');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 p-6 rounded-3xl border border-purple-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-600" />
            週邊訂單與分攤引擎 (週邊模式)
          </h2>
          <p className="text-slate-600 text-xs mt-1 font-medium">
            父子階層結構、支援全域國際運費按重量/數量平攤與二補追蹤
          </p>
        </div>

        <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-md shadow-purple-500/20">
          <Plus className="w-4 h-4" />
          建立新訂單
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => (
          <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div
              onClick={() => setExpandedId(expandedId === ord.id ? null : ord.id)}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
            >
              <div className="flex items-center space-x-3">
                {expandedId === ord.id ? (
                  <ChevronDown className="w-5 h-5 text-purple-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    {ord.name}
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono border border-purple-200 font-semibold">
                      {ord.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">交易日期: {ord.date} • 幣別: {ord.currency}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">運費分攤後估算</span>
                <span className="font-mono font-extrabold text-purple-700 text-base">
                  NT$ {(ord.items.reduce((s, i) => s + i.price * i.qty, 0) + ord.shippingFee - ord.discount).toLocaleString()}
                </span>
              </div>
            </div>

            {expandedId === ord.id && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  訂單內品項清單 ({ord.items.length} 項)
                </div>
                {ord.items.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">{item.name}</span>
                      <span className="text-xs text-slate-500 font-mono">數量: {item.qty} | 單價: NT$ {item.price}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      NT$ {item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
