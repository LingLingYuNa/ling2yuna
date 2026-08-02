import React from 'react';
import { useApp } from '../context/AppContext';
import CommentLedger from '../components/CommentLedger';
import { ArrowLeft, Plus, Image as ImageIcon, Edit3, Trash2, Maximize2, Calculator } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 頂部導航與標題 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedColumnId(null)}
          className="inline-flex items-center gap-1.5 text-[#4c4993] hover:bg-[#bfc9eb]/30 text-xs font-extrabold bg-[#f4f5f1] px-3.5 py-2 rounded-xl border border-[#4c4993]/30 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#4c4993]" />
          <span>返回專欄總覽</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-[#f4f5f1] hover:bg-white text-[#4c4993] rounded-xl border border-[#4c4993]/30 transition cursor-pointer shadow-xs"
            title="編輯專欄資訊"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteColumn(currentColumn.id)}
            className="p-2 bg-[#f4f5f1] hover:bg-red-100 text-red-700 rounded-xl border border-red-300 transition cursor-pointer shadow-xs"
            title="刪除此專欄"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 專欄 Hero 標題區 (顯示專欄標題 + 專欄總花費) */}
      <div className="relative rounded-3xl overflow-hidden border border-[#4c4993]/30 bg-[#1f1b63] shadow-xl min-h-[160px]">
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
          <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-[#161348] via-[#1f1b63] to-[#2d287d]" />
        )}

        <div className="p-6 sm:p-8 -mt-24 relative z-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* 分類標籤：薄荷綠底 + 濃深藍黑字 */}
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[#a1cdc4] text-[#161348] shadow-md border border-white/60">
                {currentColumn.category}
              </span>
              {(currentColumn.tags || []).map((t, idx) => (
                /* 標籤：米白底 + 濃靛藍字 */
                <span key={idx} className="text-xs font-bold text-[#161348] bg-[#f4f5f1] px-2.5 py-0.5 rounded-md border border-white/80 shadow-xs">
                  #{t}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              {currentColumn.title}
            </h1>

            <p className="text-white/95 text-sm max-w-3xl leading-relaxed font-medium drop-shadow-xs">
              {currentColumn.description || '這個專欄暫無簡介備註。可在右上方編輯補充專欄簡介。'}
            </p>
          </div>

          {/* ⭐ Hero 右下角醒目總花費卡片 ⭐ */}
          <div className="bg-[#f4f5f1] border border-white/40 p-3.5 rounded-2xl text-[#161348] shadow-xl shrink-0 self-start md:self-auto">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#4c4993] flex items-center gap-1 mb-0.5">
              <Calculator className="w-3.5 h-3.5 text-[#4c4993]" />
              專欄目前總花費
            </div>
            <div className="text-2xl font-black font-mono text-[#4c4993]">
              NT$ {columnTotalAmount.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#4c4993]/80 font-bold mt-0.5">
              共 {columnLedgerItemsCount} 筆記帳 ({columnTotalQty} 件品項)
            </div>
          </div>
        </div>
      </div>

      {/* 響應式佈局：手機版留言在上方，電腦版留言在展圖右邊 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 區塊 1：留言記帳與金額總計區 (手機版: 在上方 / 電腦版: 在右側 lg:col-span-5 lg:order-2) */}
        <div className="lg:col-span-5 lg:order-2 w-full">
          <CommentLedger />
        </div>

        {/* 區塊 2：專欄展圖藝廊 (手機版: 在下方 / 電腦版: 在左側 lg:col-span-7 lg:order-1) */}
        <div className="lg:col-span-7 lg:order-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg text-[#4c4993] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#4c4993]" />
              專欄展圖藝廊 ({columnImages.length} 張)
            </h2>
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="bg-[#f4f5f1] hover:bg-white text-[#4c4993] text-xs font-extrabold px-3.5 py-2 rounded-xl border border-[#4c4993]/40 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#4c4993]" />
              <span>新增美圖</span>
            </button>
          </div>

          {/* Pinterest 瀑布流 (Masonry Layout) */}
          {columnImages.length === 0 ? (
            <div className="bg-[#f4f5f1] rounded-2xl p-10 text-center border border-dashed border-[#4c4993]/40">
              <ImageIcon className="w-12 h-12 text-[#4c4993]/50 mx-auto mb-3" />
              <p className="text-[#4c4993] font-black text-sm">尚無上傳照片展圖</p>
              <p className="text-xs text-[#4c4993]/70 font-semibold mt-1">點擊上方「新增美圖」批量上傳宣圖或插畫照片</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 gap-4 space-y-4">
              {columnImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxImage(img)}
                  className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-[#4c4993]/30 bg-white cursor-pointer hover:border-[#4c4993] transition shadow-md hover:shadow-xl"
                >
                  <img
                    src={img.url}
                    alt={img.caption || '專欄展圖'}
                    className="w-full h-auto block object-contain rounded-2xl group-hover:scale-[1.02] transition duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#161348]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-between">
                    <div className="self-end">
                      <span className="p-2 bg-[#f4f5f1] rounded-xl text-[#161348] font-bold inline-block shadow-md">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs line-clamp-2">
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
