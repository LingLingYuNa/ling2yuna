import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import CommentLedger from '../components/CommentLedger';
import { generateColumnTextReport, downloadTextFile, exportCommentsToExcel } from '../utils/exportUtils';
import { ArrowLeft, Plus, Image as ImageIcon, Edit3, Trash2, Maximize2, Calculator, ChevronUp, ChevronDown, CheckSquare, Square, Heart, Download, FileText, FileSpreadsheet, Copy, Check } from 'lucide-react';

export default function ColumnDetailView() {
  const {
    currentColumn,
    setSelectedColumnId,
    columnComments,
    columnImages,
    columnTotalAmount,
    columnTotalQty,
    columnLedgerItemsCount,
    setIsImageModalOpen,
    setLightboxImage,
    setIsColumnModalOpen,
    setEditingColumn,
    handleDeleteColumn,
    handleDeleteImagesBatch,
    handleDeleteAllImages,
    handleToggleFavorite
  } = useApp();

  // 專欄最上方的專欄介紹摺疊狀態 (預設摺疊收合)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);

  // 展圖批次選擇刪除模式
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState([]);

  // 導出功能選單狀態
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Pinterest 雙欄【左一、右二】真瀑布流 (True Masonry) 分拆
  const leftColumnImages = useMemo(
    () => columnImages.filter((_, idx) => idx % 2 === 0),
    [columnImages]
  );
  const rightColumnImages = useMemo(
    () => columnImages.filter((_, idx) => idx % 2 === 1),
    [columnImages]
  );

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

  const toggleImageSelect = (id) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedImageIds.length === columnImages.length) {
      setSelectedImageIds([]);
    } else {
      setSelectedImageIds(columnImages.map((img) => img.id));
    }
  };

  const executeBatchDelete = async () => {
    if (selectedImageIds.length === 0) return;
    await handleDeleteImagesBatch(selectedImageIds);
    setSelectedImageIds([]);
    setIsSelectMode(false);
  };

  // ⭐ 導出此專欄名稱與留言為 TXT ⭐
  const handleExportTXT = () => {
    const reportText = generateColumnTextReport(currentColumn, columnComments);
    const filename = `${currentColumn.title || '專欄留言'}_留言清單.txt`;
    downloadTextFile(filename, reportText);
    setIsExportMenuOpen(false);
  };

  // ⭐ 導出此專欄名稱與留言為 Excel (.xlsx) ⭐
  const handleExportExcel = () => {
    const filename = `${currentColumn.title || '專欄留言'}_留言清單.xlsx`;
    exportCommentsToExcel(filename, [currentColumn], { [currentColumn.id]: columnComments });
    setIsExportMenuOpen(false);
  };

  // ⭐ 一鍵複製此專欄名稱與留言文字到剪貼簿 ⭐
  const handleCopyText = async () => {
    const reportText = generateColumnTextReport(currentColumn, columnComments);
    await navigator.clipboard.writeText(reportText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
    setIsExportMenuOpen(false);
  };

  // 單張照片卡片渲染子組件
  const renderImageCard = (img) => {
    const isSelected = selectedImageIds.includes(img.id);

    return (
      <div
        key={img.id}
        onClick={() => {
          if (isSelectMode) {
            toggleImageSelect(img.id);
          } else {
            setLightboxImage(img);
          }
        }}
        className={`group relative rounded-lg overflow-hidden border transition shadow-xs hover:shadow-md cursor-pointer w-full ${
          isSelectMode && isSelected
            ? 'border-red-600 ring-2 ring-red-400 bg-red-50'
            : 'border-[#4c4993]/30 bg-white hover:border-[#4c4993]'
        }`}
      >
        <img
          src={img.url}
          alt={img.caption || '專欄展圖'}
          className="w-full h-auto block object-contain rounded-lg group-hover:scale-[1.02] transition duration-300"
        />

        {isSelectMode ? (
          <div className="absolute top-2 right-2 z-20">
            {isSelected ? (
              <div className="p-1 bg-red-600 text-white rounded-md shadow-md">
                <CheckSquare className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1 bg-black/40 text-white/80 rounded-md shadow-md">
                <Square className="w-4 h-4" />
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-12">
      {/* 頂部導航與動作按鈕 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedColumnId(null)}
          className="inline-flex items-center gap-1.5 text-[#4c4993] hover:bg-[#bfc9eb]/30 text-xs font-extrabold bg-[#f4f5f1] px-3 py-1.5 rounded-lg border border-[#4c4993]/30 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#4c4993]" />
          <span>返回專欄總覽</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* ⭐ 匯出專欄名稱與留言選單 ⭐ */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="inline-flex items-center gap-1.5 text-[#161348] text-xs font-black bg-[#a1cdc4] hover:bg-[#8ebfb5] px-3 py-1.5 rounded-lg border border-[#a1cdc4] transition cursor-pointer shadow-xs"
              title="匯出專欄名稱與留言記帳內容"
            >
              <Download className="w-3.5 h-3.5 text-[#161348]" />
              <span>{copiedText ? '已複製內容！' : '匯出留言文案'}</span>
              <ChevronDown className="w-3 h-3 text-[#161348]" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-[#4c4993]/30 rounded-lg shadow-lg z-30 overflow-hidden animate-fade-in py-1">
                <button
                  onClick={handleExportTXT}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-[#161348] hover:bg-[#f4f5f1] flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#4c4993]" />
                  <span>導出 TXT 文字檔 (.txt)</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-[#161348] hover:bg-[#f4f5f1] flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#4c4993]" />
                  <span>導出 Excel 表格 (.xlsx)</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-[#161348] hover:bg-[#f4f5f1] flex items-center gap-2 cursor-pointer border-t border-[#4c4993]/10"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#4c4993]" />}
                  <span>複製留言文字到剪貼簿</span>
                </button>
              </div>
            )}
          </div>

          {/* 切換我的最愛按鈕 */}
          <button
            onClick={(e) => handleToggleFavorite(currentColumn.id, e)}
            className="inline-flex items-center gap-1.5 text-[#4c4993] text-xs font-black bg-[#f4f5f1] hover:bg-white px-3 py-1.5 rounded-lg border border-[#4c4993]/30 transition cursor-pointer shadow-xs"
            title={currentColumn.isFavorite ? '取消收藏我的最愛' : '加入我的最愛'}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                currentColumn.isFavorite
                  ? 'fill-[#e11d48] text-[#e11d48] scale-110'
                  : 'text-[#4c4993] hover:text-[#e11d48]'
              }`}
            />
            <span className="hidden sm:inline">
              {currentColumn.isFavorite ? '已加入最愛' : '加最愛'}
            </span>
          </button>

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

      {/* 專欄 Hero 標題區 */}
      <div className="relative rounded-lg overflow-hidden border border-[#4c4993]/30 bg-[#1f1b63] shadow-md transition-all duration-200">
        {isHeaderCollapsed ? (
          <div
            onClick={() => setIsHeaderCollapsed(false)}
            className="p-3.5 sm:p-4 text-white flex items-center justify-between cursor-pointer hover:bg-white/5 transition"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#a1cdc4] text-[#161348] shadow-xs">
                {currentColumn.category}
              </span>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight line-clamp-1 flex items-center gap-1.5">
                {currentColumn.isFavorite && (
                  <Heart className="w-4 h-4 fill-[#e11d48] text-[#e11d48] shrink-0" />
                )}
                <span>{currentColumn.title}</span>
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

                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1.5 drop-shadow-md flex items-center gap-2">
                  {currentColumn.isFavorite && (
                    <Heart className="w-6 h-6 fill-[#e11d48] text-[#e11d48] shrink-0 drop-shadow-xs" />
                  )}
                  <span>{currentColumn.title}</span>
                </h1>

                <p className="text-white/95 text-xs sm:text-sm max-w-3xl leading-relaxed font-medium drop-shadow-xs">
                  {currentColumn.description || '這個專欄暫無簡介備註。可在右上方編輯補充專欄簡介。'}
                </p>
              </div>

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

      {/* 響應式佈局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        
        {/* 區塊 1：留言記帳與金額總計區 */}
        <div className="lg:col-span-5 lg:order-2 w-full">
          <CommentLedger />
        </div>

        {/* 區塊 2：專欄展圖藝廊 (Pinterest 雙欄【左一、右二】真實原圖比例 True Masonry 瀑布流) */}
        <div className="lg:col-span-7 lg:order-1 w-full space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-black text-base text-[#4c4993] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#4c4993]" />
              專欄展圖藝廊 ({columnImages.length} 張)
            </h2>

            <div className="flex items-center space-x-2">
              {columnImages.length > 0 && (
                <>
                  {isSelectMode ? (
                    <div className="flex items-center space-x-1.5 animate-fade-in">
                      <button
                        onClick={toggleSelectAll}
                        className="text-[11px] font-bold text-[#4c4993] bg-[#f4f5f1] hover:bg-white px-2.5 py-1.5 rounded-lg border border-[#4c4993]/30 transition cursor-pointer"
                      >
                        {selectedImageIds.length === columnImages.length ? '取消全選' : '全選'}
                      </button>

                      <button
                        onClick={executeBatchDelete}
                        disabled={selectedImageIds.length === 0}
                        className="text-[11px] font-black text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>刪除已選 ({selectedImageIds.length})</span>
                      </button>

                      <button
                        onClick={() => { setIsSelectMode(false); setSelectedImageIds([]); }}
                        className="text-[11px] font-bold text-[#4c4993]/70 hover:text-[#4c4993] px-2 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setIsSelectMode(true)}
                        className="bg-[#f4f5f1] hover:bg-white text-[#4c4993] text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#4c4993]/30 transition flex items-center gap-1 cursor-pointer shadow-xs"
                        title="勾選多張照片一鍵批量刪除"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-[#4c4993]" />
                        <span className="hidden sm:inline">批次選取刪除</span>
                      </button>

                      <button
                        onClick={handleDeleteAllImages}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-300 transition flex items-center gap-1 cursor-pointer shadow-xs"
                        title="一鍵清空本專欄下的所有展圖"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span className="hidden sm:inline">一鍵清空展圖</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={() => setIsImageModalOpen(true)}
                className="bg-[#f4f5f1] hover:bg-white text-[#4c4993] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#4c4993]/40 transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#4c4993]" />
                <span>新增美圖</span>
              </button>
            </div>
          </div>

          {/* 經典 Pinterest 雙欄【左一、右二】真實原圖比例瀑布流 (True Masonry) */}
          {columnImages.length === 0 ? (
            <div className="bg-[#f4f5f1] rounded-lg p-8 text-center border border-dashed border-[#4c4993]/40">
              <ImageIcon className="w-10 h-10 text-[#4c4993]/50 mx-auto mb-2" />
              <p className="text-[#4c4993] font-black text-xs sm:text-sm">尚無上傳照片展圖</p>
              <p className="text-[11px] text-[#4c4993]/70 font-semibold mt-1">點擊上方「新增美圖」批量上傳宣圖或插畫照片</p>
            </div>
          ) : (
            <div className="flex gap-3 sm:gap-4 items-start w-full">
              {/* 左欄：第 1, 3, 5, 7... 張照片 */}
              <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0">
                {leftColumnImages.map((img) => renderImageCard(img))}
              </div>

              {/* 右欄：第 2, 4, 6, 8... 張照片 */}
              <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0">
                {rightColumnImages.map((img) => renderImageCard(img))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
