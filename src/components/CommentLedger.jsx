import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Plus, Trash2, Edit3, Calculator, Sparkles, Tag, ShoppingBag, Check, X } from 'lucide-react';
import { parseLedgerComment } from '../utils/ledgerParser';

export default function CommentLedger() {
  const {
    columnComments,
    columnTotalAmount,
    columnTotalQty,
    columnLedgerItemsCount,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [authorVal, setAuthorVal] = useState('LingLing_YuNa');
  const [previewParsed, setPreviewParsed] = useState(null);

  // 編輯狀態
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

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

  // 開始編輯留言
  const startEdit = (cmt) => {
    setEditingId(cmt.id);
    setEditingText(cmt.text);
  };

  // 儲存編輯留言
  const saveEdit = (id) => {
    if (editingText.trim()) {
      handleUpdateComment(id, editingText.trim());
    }
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="bg-[#f4f5f1] backdrop-blur-md rounded-lg p-4 border border-[#4c4993]/30 shadow-xs flex flex-col h-full">
      {/* 標題欄 */}
      <div className="flex items-center justify-between mb-3.5 border-b border-[#4c4993]/20 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#4c4993] rounded-md text-white shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-base text-[#4c4993] flex items-center gap-1.5">
              專欄留言與記帳紀錄
              <span className="text-[11px] bg-[#4c4993] text-white px-2 py-0.5 rounded-full font-mono font-bold shadow-xs">
                {columnComments.length} 則
              </span>
            </h3>
            <p className="text-[11px] text-[#4c4993] font-bold">輸入 `品項*數量=$金額` 自動辨識並加總金額</p>
          </div>
        </div>

        {/* 智慧語法提示 (2R 微圓角) */}
        <div className="hidden sm:flex items-center text-xs text-[#161348] font-bold bg-[#a1cdc4]/40 px-2.5 py-1 rounded-md border border-[#a1cdc4]">
          <Sparkles className="w-3.5 h-3.5 text-[#4c4993] mr-1 animate-pulse" />
          支援 `品項*數量=$金額`
        </div>
      </div>

      {/* 留言紀錄列表 */}
      <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2.5 pr-1 mb-3">
        {columnComments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-[#4c4993]/40">
            <ShoppingBag className="w-8 h-8 text-[#4c4993]/60 mx-auto mb-1.5" />
            <p className="text-[#4c4993] font-black text-xs">此專欄尚無留言記帳紀錄</p>
            <p className="text-[11px] text-[#4c4993] font-bold mt-0.5">在下方輸入記帳文字開始記錄吧！</p>
          </div>
        ) : (
          columnComments.map((cmt) => (
            <div
              key={cmt.id}
              className="bg-white rounded-lg p-3 border border-[#4c4993]/30 shadow-xs hover:border-[#4c4993] transition flex items-start justify-between group"
            >
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-black text-xs text-[#4c4993]">{cmt.author}</span>
                  <span className="text-[10px] text-[#4c4993]/70 font-mono font-bold">
                    {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {cmt.parsed?.isLedger && (
                    <span className="text-[9px] bg-[#a1cdc4] text-[#161348] px-1.5 py-0.5 rounded font-black border border-[#a1cdc4]">
                      已記帳
                    </span>
                  )}
                </div>

                {/* 編輯模式 vs 正常展示模式 */}
                {editingId === cmt.id ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 bg-[#f4f5f1] border border-[#4c4993] rounded-md px-2.5 py-1 text-xs font-bold text-[#161348] focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(cmt.id)}
                      className="p-1 bg-[#4c4993] text-white rounded-md hover:bg-[#363373] transition cursor-pointer"
                      title="儲存修改"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition cursor-pointer"
                      title="取消"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-[#161348] text-xs sm:text-sm font-bold">{cmt.text}</p>

                    {/* 智慧解析詳細標籤 */}
                    {cmt.parsed?.isLedger && (
                      <div className="mt-1.5 inline-flex items-center gap-2 bg-[#f4f5f1] px-2.5 py-1 rounded-md text-[11px] font-mono border border-[#4c4993]/30">
                        <span className="text-[#4c4993] font-black flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#4c4993]" />
                          {cmt.parsed.name}
                        </span>
                        <span className="text-[#4c4993] font-extrabold">×{cmt.parsed.qty}</span>
                        <span className="text-[#4c4993] font-black ml-auto">
                          NT$ {cmt.parsed.total.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 動作按鈕區 */}
              {editingId !== cmt.id && (
                <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition">
                  <button
                    onClick={() => startEdit(cmt)}
                    className="text-[#4c4993]/70 hover:text-[#4c4993] p-1 rounded-md hover:bg-[#bfc9eb]/30 transition cursor-pointer"
                    title="編輯留言"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(cmt.id)}
                    className="text-[#4c4993]/70 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition cursor-pointer"
                    title="刪除留言"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 智慧即時預覽 Banner */}
      {previewParsed && previewParsed.isLedger && (
        <div className="mb-2.5 bg-[#a1cdc4]/40 border border-[#a1cdc4] rounded-md p-2 flex items-center justify-between text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-1.5 text-[#161348] font-bold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#4c4993]" />
            <span>辨識成功：<strong className="text-[#4c4993] font-black">{previewParsed.name}</strong> × {previewParsed.qty}</span>
          </div>
          <span className="font-mono font-black text-[#4c4993] text-xs">
            = NT$ {previewParsed.total}
          </span>
        </div>
      )}

      {/* 留言輸入表單 (2R 微圓角) */}
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="請輸入留言或記帳 (例: 宣圖周邊*1=$60)"
            className="flex-1 bg-white border border-[#4c4993]/40 focus:border-[#4c4993] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#161348] font-bold placeholder-[#4c4993]/50 outline-none transition shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="btn-noguchi-primary disabled:opacity-50 font-black px-4 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">發布記帳</span>
          </button>
        </div>
      </form>

      {/* ⭐ 濃靛藍總計卡片 (2R 導角 rounded-lg) ⭐ */}
      <div className="mt-3 pt-3 border-t border-[#4c4993]/20">
        <div className="bg-gradient-to-r from-[#4c4993] via-[#5b57a6] to-[#2b2773] text-white p-3.5 rounded-lg border border-[#4c4993] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-md text-[#a1cdc4] border border-white/30 shadow-xs">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#a1cdc4] block">
                  專欄記帳總計 summary
                </span>
                <span className="text-[11px] text-white/90 font-mono font-bold">
                  已累積 {columnLedgerItemsCount} 筆記帳 (共 {columnTotalQty} 件品項)
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-white/80 font-bold mb-0.5">總花費累計</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-[#a1cdc4] tracking-tight drop-shadow-xs">
                NT$ {columnTotalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
