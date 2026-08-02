import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Plus, Trash2, Calculator, Sparkles, Tag, ShoppingBag } from 'lucide-react';
import { parseLedgerComment } from '../utils/ledgerParser';

export default function CommentLedger() {
  const {
    columnComments,
    columnTotalAmount,
    columnTotalQty,
    columnLedgerItemsCount,
    handleAddComment,
    handleDeleteComment
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [authorVal, setAuthorVal] = useState('LingLing_YuNa');
  const [previewParsed, setPreviewParsed] = useState(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    if (val.trim()) {
      setPreviewParsed(parseLedgerComment(val));
    } else {
      setPreviewParsed(null);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleAddComment(inputVal, authorVal || 'LingLing_YuNa');
    setInputVal('');
    setPreviewParsed(null);
  };

  const handleQuickInsert = (text) => {
    setInputVal(text);
    setPreviewParsed(parseLedgerComment(text));
  };

  return (
    <div className="bg-[#f4f5f1] backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-[#4c4993]/30 shadow-xl shadow-[#4c4993]/5 flex flex-col h-full">
      {/* 標題欄 */}
      <div className="flex items-center justify-between mb-4 border-b border-[#4c4993]/20 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#4c4993] rounded-xl text-white shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-[#4c4993] flex items-center gap-2">
              專欄留言與記帳紀錄
              <span className="text-xs bg-[#4c4993] text-white px-2.5 py-0.5 rounded-full font-mono font-bold shadow-xs">
                {columnComments.length} 則
              </span>
            </h3>
            <p className="text-xs text-[#4c4993] font-bold">隨手打 `白厄小卡*1=$60` 即可自動辨識並總計金額</p>
          </div>
        </div>

        {/* 智慧語法提示 */}
        <div className="hidden sm:flex items-center text-xs text-[#161348] font-bold bg-[#a1cdc4]/40 px-3 py-1.5 rounded-lg border border-[#a1cdc4]">
          <Sparkles className="w-3.5 h-3.5 text-[#4c4993] mr-1.5 animate-pulse" />
          支援 `品項*數量=$金額`
        </div>
      </div>

      {/* 快捷範例按鈕列 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-[#4c4993] font-bold self-center mr-1">快捷示範:</span>
        <button
          type="button"
          onClick={() => handleQuickInsert('白厄小卡*1=$60')}
          className="text-xs bg-white text-[#4c4993] hover:bg-[#4c4993] hover:text-white border border-[#4c4993]/40 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer font-black shadow-xs"
        >
          <Plus className="w-3 h-3" /> 白厄小卡*1=$60
        </button>
        <button
          type="button"
          onClick={() => handleQuickInsert('白厄徽章*2=$180')}
          className="text-xs bg-white text-[#4c4993] hover:bg-[#4c4993] hover:text-white border border-[#4c4993]/40 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer font-black shadow-xs"
        >
          <Plus className="w-3 h-3" /> 白厄徽章*2=$180
        </button>
        <button
          type="button"
          onClick={() => handleQuickInsert('白厄壓克力立牌 $350')}
          className="text-xs bg-white text-[#4c4993] hover:bg-[#4c4993] hover:text-white border border-[#4c4993]/40 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer font-black shadow-xs"
        >
          <Plus className="w-3 h-3" /> 白厄立牌 $350
        </button>
      </div>

      {/* 留言紀錄列表 */}
      <div className="flex-1 overflow-y-auto max-h-[360px] space-y-3 pr-1 mb-4">
        {columnComments.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#4c4993]/40">
            <ShoppingBag className="w-10 h-10 text-[#4c4993]/60 mx-auto mb-2" />
            <p className="text-[#4c4993] font-black text-sm">此專欄尚無留言記帳紀錄</p>
            <p className="text-xs text-[#4c4993] font-bold mt-1">在下方輸入 `白厄小卡*1=$60` 開始隨手記帳吧！</p>
          </div>
        ) : (
          columnComments.map((cmt) => (
            <div
              key={cmt.id}
              className="bg-white rounded-xl p-3.5 border border-[#4c4993]/30 shadow-xs hover:border-[#4c4993] transition flex items-start justify-between group"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xs text-[#4c4993]">{cmt.author}</span>
                  <span className="text-[10px] text-[#4c4993]/70 font-mono font-bold">
                    {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {cmt.parsed?.isLedger && (
                    <span className="text-[10px] bg-[#a1cdc4] text-[#161348] px-2 py-0.5 rounded-full font-black border border-[#a1cdc4]">
                      已記帳
                    </span>
                  )}
                </div>

                <p className="text-[#161348] text-sm font-bold">{cmt.text}</p>

                {/* 智慧解析詳細標籤 */}
                {cmt.parsed?.isLedger && (
                  <div className="mt-2 inline-flex items-center gap-3 bg-[#f4f5f1] px-3 py-1.5 rounded-lg text-xs font-mono border border-[#4c4993]/30">
                    <span className="text-[#4c4993] font-black flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#4c4993]" />
                      {cmt.parsed.name}
                    </span>
                    <span className="text-[#4c4993] font-extrabold">×{cmt.parsed.qty}</span>
                    <span className="text-[#4c4993] font-black ml-auto text-sm">
                      NT$ {cmt.parsed.total.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* 刪除按鈕 */}
              <button
                onClick={() => handleDeleteComment(cmt.id)}
                className="opacity-0 group-hover:opacity-100 transition text-[#4c4993]/60 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                title="刪除留言紀錄"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 智慧即時預覽 Banner */}
      {previewParsed && previewParsed.isLedger && (
        <div className="mb-3 bg-[#a1cdc4]/40 border border-[#a1cdc4] rounded-xl p-2.5 flex items-center justify-between text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-[#161348] font-bold">
            <Sparkles className="w-4 h-4 text-[#4c4993]" />
            <span>辨識成功：<strong className="text-[#4c4993] font-black">{previewParsed.name}</strong> × {previewParsed.qty}</span>
          </div>
          <span className="font-mono font-black text-[#4c4993] text-sm">
            = NT$ {previewParsed.total}
          </span>
        </div>
      )}

      {/* 留言輸入表單 */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="請輸入留言或記帳 (例: 白厄小卡*1=$60)"
            className="flex-1 bg-white border border-[#4c4993]/40 focus:border-[#4c4993] focus:ring-2 focus:ring-[#bfc9eb] rounded-xl px-4 py-2.5 text-sm text-[#161348] font-bold placeholder-[#4c4993]/50 outline-none transition shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="btn-noguchi-primary disabled:opacity-50 font-black px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">發布記帳</span>
          </button>
        </div>
      </form>

      {/* ⭐ ⭐ ⭐ NOGUCHI Palette 濃靛藍總計卡片 (Grand Total Summary Card) ⭐ ⭐ ⭐ */}
      <div className="mt-4 pt-4 border-t border-[#4c4993]/20">
        <div className="bg-gradient-to-r from-[#4c4993] via-[#5b57a6] to-[#2b2773] text-white p-4.5 rounded-2xl border border-[#4c4993] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl text-[#a1cdc4] border border-white/30 shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#a1cdc4] block">
                  專欄記帳總計 summary
                </span>
                <span className="text-xs text-white/90 font-mono font-bold">
                  已累積 {columnLedgerItemsCount} 筆記帳 (共 {columnTotalQty} 件品項)
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/80 font-bold mb-0.5">總花費累計</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#a1cdc4] tracking-tight drop-shadow-xs">
                NT$ {columnTotalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
