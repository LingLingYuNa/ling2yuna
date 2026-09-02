import React, { useState, useMemo, useLayoutEffect } from 'react';
import { useApp } from '../context/AppContext';
import ColumnDetailView from './ColumnDetailView';
import ExcelImportModal from '../components/ExcelImportModal';
import FolderModal from '../components/FolderModal';
import { generateAllColumnsTextReport, downloadTextFile, exportCommentsToExcel } from '../utils/exportUtils';
import { getCommentsByColumn } from '../db/indexedDB';
import { Plus, FolderHeart, ArrowRight, Sparkles, Image as ImageIcon, FileSpreadsheet, ArrowUpDown, Clock, RefreshCw, Heart, Search, X, MapPin, ChevronDown, ChevronUp, Maximize2, Download, FileText, Copy, Check, Folder, FolderPlus, Edit3, Trash2, Tag, ArrowRightLeft, Settings } from 'lucide-react';

export default function ColumnsView() {
  const {
    columns,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    selectedColumnId,
    setSelectedColumnId,
    setIsColumnModalOpen,
    setEditingColumn,
    setIsFolderModalOpen,
    setEditingFolder,
    handleDeleteFolder,
    handleDeleteTodayExcelColumns,
    handleToggleFavorite,
    setLightboxImage
  } = useApp();

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // 攤位對照圖摺疊狀態 (預設展開供對照)
  const [showBoothMap, setShowBoothMap] = useState(true);

  // 專欄搜尋與排序模式
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated_desc');

  // 全站導出選單狀態
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 自動恢復回到上一頁時的滾動位置
  useLayoutEffect(() => {
    if (!selectedColumnId) {
      const savedPos = sessionStorage.getItem('collecttrack_scroll_pos');
      if (savedPos !== null) {
        const top = parseInt(savedPos, 10);
        if (!isNaN(top)) {
          setTimeout(() => {
            window.scrollTo({ top, behavior: 'instant' });
          }, 0);
        }
      }
    }
  }, [selectedColumnId]);

  // 全站專欄名與留言導出處理函數
  const fetchAllCommentsMap = async () => {
    const commentsMap = {};
    for (const col of columns) {
      const cmts = await getCommentsByColumn(col.id);
      commentsMap[col.id] = cmts;
    }
    return commentsMap;
  };

  const handleExportAllTXT = async () => {
    setIsExporting(true);
    try {
      const commentsMap = await fetchAllCommentsMap();
      const reportText = generateAllColumnsTextReport(columns, commentsMap);
      downloadTextFile(`CollectTrack_全專欄留言總匯.txt`, reportText);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      setIsExportMenuOpen(false);
    }
  };

  const handleExportAllExcel = async () => {
    setIsExporting(true);
    try {
      const commentsMap = await fetchAllCommentsMap();
      exportCommentsToExcel(`CollectTrack_全專欄留言總匯.xlsx`, columns, commentsMap);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      setIsExportMenuOpen(false);
    }
  };

  const handleCopyAllText = async () => {
    setIsExporting(true);
    try {
      const commentsMap = await fetchAllCommentsMap();
      const reportText = generateAllColumnsTextReport(columns, commentsMap);
      await navigator.clipboard.writeText(reportText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Copy error:', err);
    } finally {
      setIsExporting(false);
      setIsExportMenuOpen(false);
    }
  };

  // 1. 依據 selectedFolderId 過濾屬於當前場次/資料夾的專欄
  const folderFilteredColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];
    if (selectedFolderId === 'ALL') return columns;
    if (selectedFolderId === 'UNASSIGNED') {
      return columns.filter(c => !c.folderId);
    }
    return columns.filter(c => c.folderId === selectedFolderId);
  }, [columns, selectedFolderId]);

  // 2. 計算目前場次/資料夾的累積總花費
  const currentFolderTotalAmount = useMemo(() => {
    return folderFilteredColumns.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  }, [folderFilteredColumns]);

  // 3. 關鍵字搜尋過濾與排序
  const filteredAndSortedColumns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = folderFilteredColumns.filter((col) => {
      if (!query) return true;
      const matchTitle = (col.title || '').toLowerCase().includes(query);
      const matchDesc = (col.description || '').toLowerCase().includes(query);
      const matchCategory = (col.category || '').toLowerCase().includes(query);
      const matchTags = (col.tags || []).some(t => t.toLowerCase().includes(query));
      return matchTitle || matchDesc || matchCategory || matchTags;
    });

    return result.sort((a, b) => {
      if (sortBy === 'favorite') {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      } else if (sortBy === 'updated_desc') {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      } else if (sortBy === 'updated_asc') {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeA - timeB;
      } else if (sortBy === 'newest') {
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
  }, [folderFilteredColumns, searchQuery, sortBy]);

  const favoriteCount = useMemo(() => columns.filter(c => c.isFavorite).length, [columns]);

  // 取得目前選取的場次資料夾物件
  const activeFolder = folders.find(f => f.id === selectedFolderId);

  if (selectedColumnId) {
    return <ColumnDetailView />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-12">
      
      {/* 頂端：同人展/場次攤位對照圖區塊 */}
      <div className="bg-white rounded-lg border border-[#4c4993]/30 overflow-hidden shadow-xs">
        <div
          onClick={() => setShowBoothMap(!showBoothMap)}
          className="px-4 py-3 bg-gradient-to-r from-[#161348] to-[#2d287d] text-white flex items-center justify-between cursor-pointer hover:bg-opacity-90 transition select-none"
        >
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#a1cdc4] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-black tracking-tight">
              📍 展場攤位對照圖 (C / D / E 區 攤位號碼表)
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-[#a1cdc4]">
            <span>{showBoothMap ? '點擊收合' : '點擊展開查看'}</span>
            {showBoothMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {showBoothMap && (
          <div className="p-3 sm:p-4 bg-[#f4f5f1] border-t border-[#4c4993]/20 flex flex-col items-center justify-center animate-fade-in">
            <div className="relative group max-w-xl w-full rounded-lg overflow-hidden border border-[#bfc9eb] bg-[#f4f5f1] shadow-xs">
              <img
                src="/booth_map.jpg"
                alt="展場攤位對照圖 (C, D, E 區)"
                className="w-full h-auto object-contain max-h-[480px] mx-auto block cursor-pointer"
                onClick={() => setLightboxImage({ url: '/booth_map.jpg', caption: '📍 展場攤位對照圖 (C / D / E 區)' })}
              />
              <div
                onClick={() => setLightboxImage({ url: '/booth_map.jpg', caption: '📍 展場攤位對照圖 (C / D / E 區)' })}
                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
              >
                <span className="bg-[#161348] text-white text-xs font-black px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5 text-[#a1cdc4]" />
                  點擊放大對照圖
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[#4c4993]/80 font-bold mt-2 text-center">
              💡 提示：點擊圖片可放大全螢幕查看或在新分頁中開啟對照
            </p>
          </div>
        )}
      </div>

      {/* 核心同人展場次 / 資料夾頁籤列 (Folder Tabs Bar) */}
      <div className="bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg p-2.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <Folder className="w-4 h-4 text-[#4c4993]" />
            <span className="text-xs font-black text-[#4c4993]">場次 / 資料夾分類</span>
          </div>

          <button
            onClick={() => {
              setEditingFolder(null);
              setIsFolderModalOpen(true);
            }}
            className="text-xs font-black text-[#161348] bg-[#a1cdc4] hover:bg-[#8ebfb5] px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#161348]" />
            <span>新增場次資料夾</span>
          </button>
        </div>

        {/* 橫向可滾動資料夾頁籤列表 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
          {/* 全部場次 */}
          <button
            onClick={() => setSelectedFolderId('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition flex items-center gap-1.5 cursor-pointer border ${
              selectedFolderId === 'ALL'
                ? 'bg-[#4c4993] text-white border-[#4c4993] shadow-xs'
                : 'bg-white text-[#4c4993] border-[#bfc9eb] hover:bg-[#e8ebf7]'
            }`}
          >
            <span>📁 全部專欄</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {columns.length}
            </span>
          </button>

          {/* 各個展覽/同人場次資料夾 */}
          {folders.map((f) => {
            const count = columns.filter(c => c.folderId === f.id).length;
            const isSelected = selectedFolderId === f.id;

            return (
              <div
                key={f.id}
                className={`group relative inline-flex items-center rounded-lg border transition shrink-0 ${
                  isSelected
                    ? 'bg-[#4c4993] text-white border-[#4c4993] shadow-xs'
                    : 'bg-white text-[#4c4993] border-[#bfc9eb] hover:bg-[#e8ebf7]'
                }`}
              >
                <button
                  onClick={() => setSelectedFolderId(f.id)}
                  className="px-3 py-1.5 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📁 {f.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20' : 'bg-[#bfc9eb]/40'}`}>
                    {count}
                  </span>
                </button>

                {/* Hover 動作按鈕：編輯與刪除資料夾 */}
                <div className="hidden group-hover:flex items-center space-x-1 pr-1.5 pl-0.5">
                  <button
                    onClick={() => {
                      setEditingFolder(f);
                      setIsFolderModalOpen(true);
                    }}
                    className="p-1 text-white/80 hover:text-white rounded hover:bg-white/20 transition cursor-pointer"
                    title="編輯資料夾內容與批量歸納轉移"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(f.id)}
                    className="p-1 text-white/80 hover:text-red-300 rounded hover:bg-white/20 transition cursor-pointer"
                    title="刪除資料夾 (專欄歸類回未分類)"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 標題與搜尋/動作區 */}
      <div className="bg-gradient-to-r from-[#f4f5f1] via-[#e8ebf7] to-[#d6dedf] p-4 sm:p-5 rounded-lg border border-[#bfc9eb] shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <FolderHeart className="w-5 h-5 text-[#4c4993]" />
              <h2 className="text-lg sm:text-xl font-black text-[#4c4993] tracking-tight flex items-center gap-2">
                <span>{activeFolder ? `📁 ${activeFolder.name}` : '二次元專欄展示牆'}</span>
                
                {activeFolder && (
                  <button
                    onClick={() => {
                      setEditingFolder(activeFolder);
                      setIsFolderModalOpen(true);
                    }}
                    className="text-xs font-black text-[#161348] bg-[#a1cdc4] hover:bg-[#8ebfb5] px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer shadow-xs border border-[#a1cdc4]"
                    title="一鍵編輯資料夾名稱與批量將專欄歸納至其他資料夾"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#161348]" />
                    <span>一鍵管理 / 批量歸納</span>
                  </button>
                )}
              </h2>
            </div>
            <p className="text-[#4c4993] text-xs font-semibold">
              {activeFolder
                ? activeFolder.description || `包含 ${folderFilteredColumns.length} 個專欄紀錄`
                : '建立專屬的主題專欄藝廊，上傳宣圖與擺設照，搭配「留言即記帳」自動精算總花費'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* 目前場次總金額統計 */}
            <div className="bg-white border border-[#4c4993]/30 px-3 py-1 rounded-lg text-right shadow-xs">
              <span className="text-[10px] font-black text-[#4c4993] block">
                {activeFolder ? `${activeFolder.name} 累積金額` : '專欄牆總累計'}
              </span>
              <span className="text-xs font-black font-mono text-[#161348]">
                NT$ {currentFolderTotalAmount.toLocaleString()}
              </span>
            </div>

            {/* 全站導出專欄與留言選單 */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                disabled={isExporting}
                className="bg-[#a1cdc4] hover:bg-[#8ebfb5] text-[#161348] font-black text-xs px-3 py-1.5 rounded-lg border border-[#a1cdc4] transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                title="只導出專欄名稱與內部留言內容"
              >
                <Download className="w-3.5 h-3.5 text-[#161348]" />
                <span>{copiedText ? '已複製全部內容！' : '導出專欄與留言'}</span>
                <ChevronDown className="w-3 h-3 text-[#161348]" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-[#4c4993]/30 rounded-lg shadow-lg z-30 overflow-hidden animate-fade-in py-1">
                  <button
                    onClick={handleExportAllTXT}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-[#161348] hover:bg-[#f4f5f1] flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#4c4993]" />
                    <span>導出全部留言 TXT (.txt)</span>
                  </button>
                  <button
                    onClick={handleExportAllExcel}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-[#161348] hover:bg-[#f4f5f1] flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#4c4993]" />
                    <span>導出全部留言 Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleCopyAllText}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-[#161348] hover:bg-[#f4f5f1] flex items-center gap-2 cursor-pointer border-t border-[#4c4993]/10"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#4c4993]" />}
                    <span>複製全部專欄與留言文字</span>
                  </button>
                </div>
              )}
            </div>

            {/* ⭐ 一鍵清理今天 Excel 匯入按鈕 ⭐ */}
            <button
              onClick={handleDeleteTodayExcelColumns}
              className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-red-300 transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="一鍵清理復原今天由 Excel 批量匯入的所有專欄"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">清理今天 Excel 匯入</span>
            </button>

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
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>建立展示專欄</span>
            </button>
          </div>
        </div>

        {/* 專欄關鍵字搜尋列 & 排序過濾下拉選單 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 border-t border-[#4c4993]/15">
          {/* 搜尋框 */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4c4993]/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋專欄標題、簡介、分類、標籤 (如: 立牌, 徽章, 谷子)..."
              className="w-full bg-white border border-[#4c4993]/30 focus:border-[#4c4993] rounded-lg pl-9 pr-8 py-1.5 text-xs font-bold text-[#161348] focus:outline-none shadow-xs placeholder:text-[#4c4993]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4c4993]/60 hover:text-[#4c4993] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 排序選單 */}
          <div className="relative inline-flex items-center bg-white border border-[#4c4993]/30 rounded-lg px-2.5 py-1.5 shadow-xs shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#4c4993] mr-1.5 shrink-0" />
            <span className="text-[11px] font-black text-[#4c4993] mr-1">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#161348] focus:outline-none cursor-pointer pr-1"
            >
              <option value="updated_desc">🔄 內容更新時間：最新在前</option>
              <option value="favorite">❤️ 我的最愛專欄優先 (共 {favoriteCount} 個)</option>
              <option value="newest">🕒 專欄建立時間：由新到舊</option>
              <option value="oldest">⏳ 專欄建立時間：由舊到新</option>
              <option value="amount_desc">💰 依花費金額：高到低</option>
              <option value="name">🔤 依專欄名稱字典序</option>
            </select>
          </div>
        </div>
      </div>

      {/* 專欄搜尋過濾結果提示 */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-[#4c4993] font-bold px-1">
          <span>搜尋「<strong className="text-[#161348]">{searchQuery}</strong>」結果：找到 {filteredAndSortedColumns.length} 個相符專欄</span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] text-[#4c4993]/80 hover:text-[#4c4993] underline cursor-pointer"
          >
            清除搜尋
          </button>
        </div>
      )}

      {/* 嚴格左一右二橫向 Row-First CSS Grid (grid-cols-2 lg:grid-cols-3) */}
      {filteredAndSortedColumns.length === 0 ? (
        <div className="bg-[#f4f5f1] rounded-lg p-10 text-center border-2 border-dashed border-[#bfc9eb] shadow-xs">
          <div className="w-12 h-12 bg-[#a1cdc4]/30 rounded-lg flex items-center justify-center mx-auto mb-3 border border-[#a1cdc4]">
            <Sparkles className="w-6 h-6 text-[#4c4993]" />
          </div>
          <h3 className="text-base font-black text-[#4c4993] mb-1.5">
            {searchQuery ? '找不到相符的專欄' : '此場次 / 資料夾內尚無專欄'}
          </h3>
          <p className="text-xs text-[#4c4993] font-bold max-w-md mx-auto mb-5">
            {searchQuery ? '請嘗試更換搜尋關鍵字或點擊右上角清除搜尋' : '點擊「建立第一個專欄」開始在此場次新增您的主題展示牆！'}
          </p>
          {!searchQuery && (
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
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 items-start">
          {filteredAndSortedColumns.map((col) => {
            const folderObj = folders.find(f => f.id === col.folderId);

            return (
              <div
                key={col.id}
                onClick={() => setSelectedColumnId(col.id)}
                className="group glass-card rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between h-full relative"
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
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#4c4993] text-white shadow-xs border border-white/40">
                        {col.category}
                      </span>
                      {folderObj && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#161348]/85 text-[#a1cdc4] border border-white/30 backdrop-blur-xs">
                          📁 {folderObj.name}
                        </span>
                      )}
                    </div>

                    {/* 頂部右側：我的最愛愛心按鈕 */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(col.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition cursor-pointer backdrop-blur-xs border border-white/40 shadow-md group/heart"
                      title={col.isFavorite ? '取消收藏我的最愛' : '加入我的最愛'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform group-hover/heart:scale-110 ${
                          col.isFavorite
                            ? 'fill-[#e11d48] text-[#e11d48]'
                            : 'text-white/90 hover:text-white'
                        }`}
                      />
                    </button>

                    {/* 封面圖下方花費膠囊 */}
                    <div className="absolute bottom-2 right-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#a1cdc4] text-[#161348] shadow-xs border border-white/60 font-mono flex items-center gap-1">
                        NT$ {(col.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 專欄內文 */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-black text-sm sm:text-base text-[#4c4993] group-hover:text-[#2b2773] transition mb-1 line-clamp-1 flex items-center gap-1">
                      {col.isFavorite && (
                        <Heart className="w-3.5 h-3.5 fill-[#e11d48] text-[#e11d48] shrink-0" />
                      )}
                      <span>{col.title}</span>
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

                {/* 底部指引 */}
                <div className="px-3 py-2 border-t border-[#bfc9eb]/60 bg-[#f4f5f1] flex items-center justify-between text-[10px] sm:text-xs text-[#4c4993] mt-auto">
                  <div className="flex items-center gap-1 text-[#4c4993]/80 font-mono font-bold" title="內容最後更新時間">
                    <RefreshCw className="w-3 h-3 text-[#4c4993]" />
                    <span>{new Date(col.updatedAt || col.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4c4993] group-hover:translate-x-1 transition shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Excel 匯入 Modal */}
      <ExcelImportModal isOpen={isExcelModalOpen} onClose={() => setIsExcelModalOpen(false)} />

      {/* 場次資料夾 Modal */}
      <FolderModal
        isOpen={useApp().isFolderModalOpen}
        onClose={() => useApp().setIsFolderModalOpen(false)}
        editingFolder={useApp().editingFolder}
      />
    </div>
  );
}
