import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Cloud, Download, Upload, ShieldCheck, Sparkles } from 'lucide-react';
import { getAllColumns, getCommentsByColumn, getImagesByColumn, saveColumn, saveComment, saveImage, clearAllData } from '../db/indexedDB';

export default function SyncModal({ isOpen, onClose }) {
  const { refreshColumns } = useApp();

  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // 1. 匯出全部資料為完整 JSON 備份檔 (包含高畫質圖片與記帳)
  const handleExportJSON = async () => {
    setIsLoading(true);
    setStatusMsg('正在打包專欄、高畫質展圖與記帳紀錄...');

    try {
      const columns = await getAllColumns();
      const allComments = [];
      const allImages = [];

      for (const col of columns) {
        const cmts = await getCommentsByColumn(col.id);
        const imgs = await getImagesByColumn(col.id);
        allComments.push(...cmts);
        allImages.push(...imgs);
      }

      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        columns,
        comments: allComments,
        images: allImages
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `CollectTrack_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setIsLoading(false);
      setStatusMsg('🎉 已成功匯出 JSON 備份檔！傳送到手機即可點擊「匯入」連動！');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setStatusMsg('❌ 匯出失敗：' + err.message);
    }
  };

  // 2. ⭐ 從 JSON 檔案匯入資料 (先完全清空舊資料再 100% 覆蓋同步) ⭐
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMsg('正在進行清空舊數據並 100% 覆蓋導入...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.columns || !Array.isArray(data.columns)) {
          throw new Error('備份檔格式不正確');
        }

        // ⭐ 關鍵修正：匯入時先完全清空該裝置本機的舊資料，確保 100% 乾淨覆蓋！ ⭐
        await clearAllData();

        for (const col of data.columns) await saveColumn(col);
        if (data.comments && Array.isArray(data.comments)) {
          for (const cmt of data.comments) await saveComment(cmt);
        }
        if (data.images && Array.isArray(data.images)) {
          for (const img of data.images) await saveImage(img);
        }

        await refreshColumns();
        setIsLoading(false);
        setStatusMsg(`✨ 覆蓋同步成功！已清空舊資料並還原 ${data.columns.length} 個專欄與完整記帳！`);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        setStatusMsg('❌ 匯入失敗：' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c4993]/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg shadow-xl p-5 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-[#4c4993]" />
            <h3 className="font-black text-lg text-[#4c4993]">跨設備資料覆蓋同步與備份</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#4c4993]/60 hover:text-[#4c4993] p-1 rounded hover:bg-[#bfc9eb]/30 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 狀態訊息通知 */}
        {statusMsg && (
          <div className="my-2.5 p-2.5 bg-white rounded-md border border-[#4c4993]/30 text-xs font-bold text-[#4c4993] flex items-center gap-2 animate-fade-in shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#4c4993] shrink-0" />
            <span className="leading-relaxed">{statusMsg}</span>
          </div>
        )}

        <div className="space-y-4 pt-3 overflow-y-auto pr-1 flex-1">
          {/* 說明說明卡片 */}
          <div className="bg-[#e8ebf7] p-3.5 rounded-md border border-[#bfc9eb] space-y-2">
            <div className="flex items-center space-x-2 text-[#4c4993] font-black text-xs">
              <ShieldCheck className="w-4 h-4 text-[#4c4993]" />
              <span>完全覆蓋同步 (Full Overwrite Sync)</span>
            </div>
            <p className="text-[11px] text-[#4c4993]/90 font-medium leading-relaxed">
              為了確保跨設備間資料 100% 保持完全一致，匯入 JSON 時將 **會先清空該裝置上的舊紀錄**，再完全覆蓋為電腦備份檔中的最新專欄與記帳！
            </p>
          </div>

          {/* 步驟 1: 電腦匯出 */}
          <div className="bg-white p-4 rounded-md border border-[#bfc9eb] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#4c4993] flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#4c4993]" />
                1. 電腦端：匯出 JSON 備份檔
              </span>
              <span className="text-[10px] text-[#161348] font-black bg-[#a1cdc4] px-2 py-0.5 rounded">
                100% 完整無損
              </span>
            </div>

            <p className="text-[11px] text-[#4c4993]/80 font-medium">
              點擊下方按鈕將電腦上的所有專欄、展圖與 LingLing_YuNa 留言記帳打包下載為 `.json` 檔案：
            </p>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleExportJSON}
              className="w-full btn-noguchi-primary text-xs font-black py-2.5 rounded-md transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-white" />
              <span>點此下載 CollectTrack JSON 備份檔</span>
            </button>
          </div>

          {/* 步驟 2: 手機覆蓋匯入 */}
          <div className="bg-white p-4 rounded-md border border-[#bfc9eb] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#4c4993] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#4c4993]" />
                2. 手機端：選擇 JSON 檔 (完全清空舊資料並覆蓋)
              </span>
              <span className="text-[10px] text-[#161348] font-black bg-[#a1cdc4] px-2 py-0.5 rounded">
                完全覆蓋還原
              </span>
            </div>

            <p className="text-[11px] text-[#4c4993]/80 font-medium">
              將 `.json` 備份檔傳至手機後，點擊下方選擇檔案，將會自動清空本機舊資料並 100% 覆蓋還原：
            </p>

            <label className="w-full bg-[#a1cdc4] hover:bg-[#8ebfb5] text-[#161348] font-black text-xs py-2.5 rounded-md border border-[#a1cdc4] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              <Upload className="w-4 h-4 text-[#161348]" />
              <span>點此選擇 JSON 備份檔並覆蓋匯入</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#bfc9eb]/50 text-right">
          <button
            onClick={onClose}
            className="bg-[#4c4993] text-white font-black text-xs px-4 py-1.5 rounded-md transition cursor-pointer shadow-xs"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
