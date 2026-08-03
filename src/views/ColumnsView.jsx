import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ColumnDetailView from './ColumnDetailView';
import ExcelImportModal from '../components/ExcelImportModal';
import { Plus, FolderHeart, ArrowRight, Sparkles, Image as ImageIcon, FileSpreadsheet, ArrowUpDown, Clock } from 'lucide-react';

export default function ColumnsView() {
  const { columns, selectedColumnId, setSelectedColumnId, setIsColumnModalOpen, setEditingColumn } = useApp();
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // 專欄時間與花費排序模式: 'newest' | 'oldest' | 'amount_desc' | 'name'
  const [sortBy, setSortBy] = useState('newest');

  // 計算動態排序後的專欄列表
  const sortedColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];
    
    return [...columns].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortBy === 'amount_desc') {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      } else if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '', 'zh-TW');
      }
      return 0;
    });
  }, [columns, sortBy]);

  if (selectedColumnId) {
    return <ColumnDetailView />;
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* 標題與簡介區 - 2R 俐落微圓角 (rounded-lg) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#f4f5f1] via-[#e8ebf7] to-[#d6dedf] p-5 rounded-lg border border-[#bfc9eb] shadow-xs">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <FolderHeart className="w-5 h-5 text-[#4c4993]" />
            <h2 className="text-lg sm:text-xl font-black text-[#4c4993] tracking-tight">
              二次元專欄展示牆
            </h2>
          </div>
          <p className="text-[#4c4993] text-xs font-semibold">
            建立專屬的主題專欄藝廊，上傳宣圖與擺設照，搭配「留言即記帳」自動精算總花費
          </p>
        </div>

        {/* 動作按鈕區: 時間排序 + Excel 匯入 + 建立專欄 */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* ⭐ 時間與花費動態排序切換選單 ⭐ */}
          <div className="relative inline-flex items-center bg-[#f4f5f1] border border-[#4c4993]/30 rounded-lg px-2.5 py-1.5 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#4c4993] mr-1.5 shrink-0" />
            <span className="text-[11px] font-black text-[#4c4993] mr-1 hidden sm:inline">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#161348] focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest">🕒 時間：由新到舊 (最新建立)</option>
              <option value="oldest">⏳ 時間：由舊到新 (最早建立)</option>
              <option value="amount_desc">💰 依花費金額：高到低</option>
              <option value="name">🔤 依專欄名稱字典序</option>
            </select>
          </div>

          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="bg-[#f4f5f1] hover:bg-white text-[#4c4993] font-black text-xs px-3 py-1.5 rounded-lg border border-[#4c4993]/30 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="從 Excel (.xlsx, .csv) 批量匯入專欄"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#4c4993]" />
            <span>Excel 匯入</span>
          </button>

          <button
            onClick={() => {
              setEditingColumn(null);
              setIsColumnModalOpen(true);
            }}
            className="btn-noguchi-primary font-black text-xs px-3.5 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#ffffff]" />
            <span>建立展示專欄</span>
          </button>
        </div>
      </div>

      {/* ⭐ 專欄列表網格：改用 Row-First CSS Grid (grid-cols-2 lg:grid-cols-3)，確保排序依照左 1、右 2、下左 3、下右 4 順序呈現！ ⭐ */}
      {sortedColumns.length === 0 ? (
        <div className="bg-[#f4f5f1] rounded-lg p-10 text-center border-2 border-dashed border-[#bfc9eb] shadow-xs">
          <div className="w-12 h-12 bg-[#a1cdc4]/30 rounded-lg flex items-center justify-center mx-auto mb-3 border border-[#a1cdc4]">
            <Sparkles className="w-6 h-6 text-[#4c4993]" />
          </div>
          <h3 className="text-base font-black text-[#4c4993] mb-1.5">專欄牆目前尚無資料</h3>
          <p className="text-xs text-[#4c4993] font-bold max-w-md mx-auto mb-5">
            點擊下方「建立第一個專欄」或「Excel 匯入」開始新增您的第一個主題展示牆！
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="bg-[#f4f5f1] hover:bg-white text-[#4c4993] font-black text-xs px-4 py-2.5 rounded-lg border border-[#4c4993]/30 transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#4c4993]" />
              <span>Excel 批量匯入</span>
            </button>
            <button
              onClick={() => {
                setEditingColumn(null);
                setIsColumnModalOpen(true);
              }}
              className="btn-noguchi-primary font-black text-xs px-5 py-2.5 rounded-lg transition inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>建立第一個專欄</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 items-start">
          {sortedColumns.map((col) => (
            <div
              key={col.id}
              onClick={() => setSelectedColumnId(col.id)}
              className="group glass-card rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between h-full"
            >
              <div>
                {/* 封面圖 */}
                <div className="w-full relative overflow-hidden bg-[#e8ebf7] min-h-[110px] flex items-center justify-center">
                  {col.coverImage ? (
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      className="w-full h-auto object-contain max-h-[360px] group-hover:scale-102 transition duration-300"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-7 h-7 text-[#4c4993]/40 mx-auto mb-1" />
                      <span className="text-[10px] text-[#4c4993] font-black">專欄展示圖</span>
                    </div>
                  )}

                  {/* 頂部左側：分類標籤 */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#4c4993] text-white shadow-xs border border-white/40">
                      {col.category}
                    </span>
                  </div>

                  {/* 頂部右側：目前總花費 */}
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#a1cdc4] text-[#161348] shadow-xs border border-white/60 font-mono flex items-center gap-1">
                      NT$ {(col.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 專欄內文 */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-black text-sm sm:text-base text-[#4c4993] group-hover:text-[#2b2773] transition mb-1 line-clamp-1">
                    {col.title}
                  </h3>
                  <p className="text-[#4c4993]/90 text-[10px] sm:text-xs line-clamp-2 leading-relaxed mb-2 font-semibold">
                    {col.description || '無簡介說明'}
                  </p>

                  {/* 標籤 */}
                  {col.tags && col.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {col.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] text-[#161348] bg-[#a1cdc4]/40 px-1.5 py-0.5 rounded border border-[#a1cdc4] font-extrabold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 底部指引 (顯示建立日期) */}
              <div className="px-3 py-2 border-t border-[#bfc9eb]/60 bg-[#f4f5f1] flex items-center justify-between text-[10px] sm:text-xs text-[#4c4993] mt-auto">
                <div className="flex items-center gap-1 text-[#4c4993]/80 font-mono font-bold">
                  <Clock className="w-3 h-3 text-[#4c4993]" />
                  <span>{new Date(col.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#4c4993] group-hover:translate-x-1 transition shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Excel 匯入 Modal */}
      <ExcelImportModal isOpen={isExcelModalOpen} onClose={() => setIsExcelModalOpen(false)} />
    </div>
  );
}
