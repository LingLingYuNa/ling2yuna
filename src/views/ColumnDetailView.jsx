import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CommentLedger from '../components/CommentLedger';
import { ArrowLeft, Plus, Image as ImageIcon, Edit3, Trash2, Maximize2, Calculator, ChevronUp, ChevronDown } from 'lucide-react';

export default function ColumnDetailView() {
  const {
    currentColumn,
    setSelectedColumnId,
    columnImages,
    columnTotalAmount,
    columnTotalQty,
    columnLedgerItemsCount,
    setIsImageModalOpen,
    setLightboxImage,
    setIsColumnModalOpen,
    setEditingColumn,
    handleDeleteColumn
  } = useApp();

  // 專欄最上方的專欄介紹摺疊狀態 (預設摺疊收合，節省螢幕空間)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);

  if (!currentColumn) {
    return (
      <div className="text-center py-20 text-[#4c4993] font-bold">
        <p>請選擇或建立一個二次元展示專欄</p>
      </div>
    );
  }

  const handleEdit = () => {
    setEditingColumn(currentColumn);
    setIsColumnModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-12">
      {/* 頂部導航與動作按鈕 (2R 俐落微圓角 rounded-lg) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedColumnId(null)}
          className="inline-flex items-center gap-1.5 text-[#4c4993] hover:bg-[#bfc9eb]/30 text-xs font-extrabold bg-[#f4f5f1] px-3 py-1.5 rounded-lg border border-[#4c4993]/30 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#4c4993]" />
          <span>返回專欄總覽</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* 折疊/展開專欄介紹切換按鈕 */}
          <button
            onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
            className="inline-flex items-center gap-1 text-[#4c4993] text-xs font-extrabold bg-[#f4f5f1] hover:bg-white px-3 py-1.5 rounded-lg border border-[#4c4993]/30 transition cursor-pointer shadow-xs"
            title={isHeaderCollapsed ? '展開專欄介紹' : '摺疊專欄介紹'}
          >
            {isHeaderCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#4c4993]" />
                <span className="hidden sm:inline">展開介紹</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#4c4993]" />
                <span className="hidden sm:inline">摺疊介紹</span>
              </>
            )}
          </button>

          <button
            onClick={handleEdit}
            className="p-1.5 bg-[#f4f5f1] hover:bg-white text-[#4c4993] rounded-lg border border-[#4c4993]/30 transition cursor-pointer shadow-xs"
            title="編輯專欄資訊"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteColumn(currentColumn.id)}
            className="p-1.5 bg-[#f4f5f1] hover:bg-red-100 text-red-700 rounded-lg border border-red-300 transition cursor-pointer shadow-xs"
            title="刪除此專欄"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ⭐ 專欄 Hero 標題區 (2R 俐落微圓角 rounded-lg) ⭐ */}
      <div className="relative rounded-lg overflow-hidden border border-[#4c4993]/30 bg-[#1f1b63] shadow-md transition-all duration-200">
        {/* 折疊狀態 (Micro Bar) */}
        {isHeaderCollapsed ? (
          <div
            onClick={() => setIsHeaderCollapsed(false)}
            className="p-3.5 sm:p-4 text-white flex items-center justify-between cursor-pointer hover:bg-white/5 transition"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#a1cdc4] text-[#161348] shadow-xs">
                {currentColumn.category}
              </span>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight line-clamp-1">
                {currentColumn.title}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold text-[#a1cdc4] hidden sm:inline">
                累計: NT$ {columnTotalAmount.toLocaleString()}
              </span>
              <div className="text-xs text-white/80 flex items-center gap-1 font-bold">
                <span>點擊展開介紹</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ) : (
          /* 展開狀態 */
          <div>
            {currentColumn.coverImage ? (
              <div className="w-full relative overflow-hidden flex items-center justify-center bg-[#161348]">
                <img
                  src={currentColumn.coverImage}
                  alt={currentColumn.title}
                  className="w-full h-auto max-h-[380px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161348] via-[#1f1b63]/85 to-[#1f1b63]/30" />
              </div>
            ) : (
              <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-[#161348] via-[#1f1b63] to-[#2d287d]" />
            )}

            <div className="p-5 sm:p-6 -mt-20 relative z-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded bg-[#a1cdc4] text-[#161348] shadow-xs border border-white/60">
                    {currentColumn.category}
                  </span>
                  {(currentColumn.tags || []).map((t, idx) => (
                    <span key={idx} className="text-xs font-bold text-[#161348] bg-[#f4f5f1] px-2 py-0.5 rounded border border-white/80 shadow-xs">
                      #{t}
                    </span>
                  ))}
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1.5 drop-shadow-md">
                  {currentColumn.title}
                </h1>

                <p className="text-white/95 text-xs sm:text-sm max-w-3xl leading-relaxed font-medium drop-shadow-xs">
                  {currentColumn.description || '這個專欄暫無簡介備註。可在右上方編輯補充專欄簡介。'}
                </p>
              </div>

              {/* 右下角總花費與收合按鈕 (2R 導角) */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="bg-[#f4f5f1] border border-white/40 p-3 rounded-lg text-[#161348] shadow-md w-full sm:w-auto">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#4c4993] flex items-center gap-1 mb-0.5">
                    <Calculator className="w-3 h-3 text-[#4c4993]" />
                    專欄目前總花費
                  </div>
                  <div className="text-xl font-black font-mono text-[#4c4993]">
                    NT$ {columnTotalAmount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#4c4993]/80 font-bold mt-0.5">
                    共 {columnLedgerItemsCount} 筆記帳 ({columnTotalQty} 件品項)
                  </div>
                </div>

                <button
                  onClick={() => setIsHeaderCollapsed(true)}
                  className="text-xs text-white/80 hover:text-white flex items-center gap-1 cursor-pointer font-bold pt-0.5"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>摺疊收合介紹</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 響應式佈局：手機版留言在上方，電腦版留言在展圖右邊 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        
        {/* 區塊 1：留言記帳與金額總計區 (手機版: 在上方 / 電腦版: 在右側 lg:col-span-5 lg:order-2) */}
        <div className="lg:col-span-5 lg:order-2 w-full">
          <CommentLedger />
        </div>

        {/* 區塊 2：專欄展圖藝廊 (手機版: 在下方 / 電腦版: 在左側 lg:col-span-7 lg:order-1) */}
        <div className="lg:col-span-7 lg:order-1 w-full space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base text-[#4c4993] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#4c4993]" />
              專欄展圖藝廊 ({columnImages.length} 張)
            </h2>
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="bg-[#f4f5f1] hover:bg-white text-[#4c4993] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#4c4993]/40 transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#4c4993]" />
              <span>新增美圖</span>
            </button>
          </div>

          {/* ⭐ 手機版與電腦版皆採用 2R 微圓角 (rounded-lg) 雙欄瀑布流排版！ ⭐ */}
          {columnImages.length === 0 ? (
            <div className="bg-[#f4f5f1] rounded-lg p-8 text-center border border-dashed border-[#4c4993]/40">
              <ImageIcon className="w-10 h-10 text-[#4c4993]/50 mx-auto mb-2" />
              <p className="text-[#4c4993] font-black text-xs sm:text-sm">尚無上傳照片展圖</p>
              <p className="text-[11px] text-[#4c4993]/70 font-semibold mt-1">點擊上方「新增美圖」批量上傳宣圖或插畫照片</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-2 lg:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
              {columnImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxImage(img)}
                  className="break-inside-avoid group relative rounded-lg overflow-hidden border border-[#4c4993]/30 bg-white cursor-pointer hover:border-[#4c4993] transition shadow-xs hover:shadow-md mb-3 sm:mb-4"
                >
                  <img
                    src={img.url}
                    alt={img.caption || '專欄展圖'}
                    className="w-full h-auto block object-contain rounded-lg group-hover:scale-[1.02] transition duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#161348]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-between">
                    <div className="self-end">
                      <span className="p-1.5 bg-[#f4f5f1] rounded-md text-[#161348] font-bold inline-block shadow-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-[10px] sm:text-xs line-clamp-2">
                        {img.caption || '點擊放大全螢幕檢視'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
