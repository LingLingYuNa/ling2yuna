import React from 'react';
import { useApp } from '../context/AppContext';
import ColumnDetailView from './ColumnDetailView';
import { Plus, FolderHeart, ArrowRight, MessageSquare, Sparkles, Image as ImageIcon, Calculator, Tag } from 'lucide-react';

export default function ColumnsView() {
  const { columns, selectedColumnId, setSelectedColumnId, setIsColumnModalOpen, setEditingColumn } = useApp();

  if (selectedColumnId) {
    return <ColumnDetailView />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 標題與簡介區 - Noguchi Blue Soft Gradient Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#f4f5f1] via-[#e8ebf7] to-[#d6dedf] p-6 rounded-3xl border border-[#bfc9eb] shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <FolderHeart className="w-5 h-5 text-[#4c4993]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#4c4993] tracking-tight">
              二次元專欄展示牆
            </h2>
          </div>
          <p className="text-[#4c4993] text-xs sm:text-sm font-semibold">
            建立專屬的主題專欄藝廊，上傳宣圖與擺設照，搭配「留言即記帳」自動精算總花費
          </p>
        </div>

        <button
          onClick={() => {
            setEditingColumn(null);
            setIsColumnModalOpen(true);
          }}
          className="btn-noguchi-primary font-black text-sm px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>建立展示專欄</span>
        </button>
      </div>

      {/* 專欄列表網格 (空白狀態 vs 有專欄狀態) */}
      {columns.length === 0 ? (
        <div className="bg-[#f4f5f1] rounded-3xl p-12 text-center border-2 border-dashed border-[#bfc9eb] shadow-xs">
          <div className="w-16 h-16 bg-[#a1cdc4]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#a1cdc4]">
            <Sparkles className="w-8 h-8 text-[#4c4993]" />
          </div>
          <h3 className="text-lg font-black text-[#4c4993] mb-2">專欄牆目前尚無資料</h3>
          <p className="text-xs sm:text-sm text-[#4c4993] font-bold max-w-md mx-auto mb-6">
            點擊下方「建立第一個專欄」開始新增您的第一個主題展示牆，上傳宣圖美圖並體驗隨手留言記帳！
          </p>
          <button
            onClick={() => {
              setEditingColumn(null);
              setIsColumnModalOpen(true);
            }}
            className="btn-noguchi-primary font-black text-sm px-6 py-3 rounded-xl transition inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>建立第一個專欄</span>
          </button>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {columns.map((col) => (
            <div
              key={col.id}
              onClick={() => setSelectedColumnId(col.id)}
              className="break-inside-avoid group glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* 封面圖 (保留原圖尺寸比例) */}
                <div className="w-full relative overflow-hidden bg-[#e8ebf7] min-h-[140px] flex items-center justify-center">
                  {col.coverImage ? (
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      className="w-full h-auto object-contain max-h-[360px] group-hover:scale-102 transition duration-500"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon className="w-10 h-10 text-[#4c4993]/40 mx-auto mb-1" />
                      <span className="text-xs text-[#4c4993] font-black">專欄展示圖</span>
                    </div>
                  )}

                  {/* 頂部左側：分類標籤 */}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#4c4993] text-white shadow-md border border-white/40">
                      {col.category}
                    </span>
                  </div>

                  {/* ⭐ 頂部右側：醒目展示目前總花費金額 ⭐ */}
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#a1cdc4] text-[#161348] shadow-md border border-white/60 font-mono flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5 text-[#161348]" />
                      NT$ {(col.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 專欄內文 */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-black text-lg text-[#4c4993] group-hover:text-[#2b2773] transition">
                      {col.title}
                    </h3>
                  </div>

                  <p className="text-[#4c4993]/90 text-xs line-clamp-3 leading-relaxed mb-4 font-semibold">
                    {col.description || '無簡介說明'}
                  </p>

                  {/* 標籤 */}
                  {col.tags && col.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {col.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-[#161348] bg-[#a1cdc4]/40 px-2 py-0.5 rounded border border-[#a1cdc4] font-extrabold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 底部：醒目展示總花費累計與進入指引 */}
              <div className="px-5 py-3 border-t border-[#bfc9eb]/60 bg-[#f4f5f1] flex items-center justify-between text-xs text-[#4c4993]">
                <div className="flex items-center gap-1.5 font-black text-[#4c4993]">
                  <Calculator className="w-4 h-4 text-[#4c4993]" />
                  <span>目前花費: <strong className="font-mono text-sm text-[#161348]">NT$ {(col.totalAmount || 0).toLocaleString()}</strong></span>
                  <span className="text-[10px] text-[#4c4993]/70 font-normal">({col.commentsCount || 0} 則記帳)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#4c4993] group-hover:translate-x-1 transition shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
