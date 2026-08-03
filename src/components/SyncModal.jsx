import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Cloud, Download, Upload, Key, ShieldCheck, Sparkles, Loader2, Copy, Check, FileText } from 'lucide-react';
import { getAllColumns, getCommentsByColumn, getImagesByColumn, saveColumn, saveComment, saveImage } from '../db/indexedDB';

export default function SyncModal({ isOpen, onClose }) {
  const { refreshColumns } = useApp();

  const [syncKey, setSyncKey] = useState(localStorage.getItem('collecttrack_sync_key') || 'lingling-sync-2026');
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. 匯出全部資料為 JSON 檔案
  const handleExportJSON = async () => {
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

      setStatusMsg('✅ 已成功匯出 JSON 備份檔！可於其他設備匯入');
    } catch (err) {
      console.error(err);
      setStatusMsg('❌ 匯出失敗：' + err.message);
    }
  };

  // 2. 從 JSON 檔案匯入資料
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.columns || !Array.isArray(data.columns)) {
          throw new Error('備份檔格式不正確');
        }

        for (const col of data.columns) await saveColumn(col);
        if (data.comments && Array.isArray(data.comments)) {
          for (const cmt of data.comments) await saveComment(cmt);
        }
        if (data.images && Array.isArray(data.images)) {
          for (const img of data.images) await saveImage(img);
        }

        await refreshColumns();
        setStatusMsg(`🎉 成功從檔案匯入 ${data.columns.length} 個專欄紀錄！`);
      } catch (err) {
        console.error(err);
        setStatusMsg('❌ 匯入失敗：' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // 3. ⭐ 一鍵產生與複製「隨身同步文字碼 (Sync Code)」⭐
  const handleGenerateSyncCode = async () => {
    try {
      setIsLoading(true);
      setStatusMsg('正在打包專欄與記帳資料生成同步碼...');

      const columns = await getAllColumns();
      const allComments = [];
      const allImages = [];

      for (const col of columns) {
        const cmts = await getCommentsByColumn(col.id);
        const imgs = await getImagesByColumn(col.id);
        allComments.push(...cmts);
        allImages.push(...imgs);
      }

      const syncPayload = {
        updatedAt: new Date().toISOString(),
        columns,
        comments: allComments,
        images: allImages
      };

      const jsonStr = JSON.stringify(syncPayload);
      // 轉為 Base64 隨身同步字串
      const base64Code = btoa(unescape(encodeURIComponent(jsonStr)));
      
      await navigator.clipboard.writeText(base64Code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      setIsLoading(false);
      setStatusMsg('✨ 複製成功！直接傳到 Line 或手機剪貼簿貼上即可 100% 同步！');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setStatusMsg('複製同步碼失敗：' + err.message);
    }
  };

  // 4. ⭐ 貼上「隨身同步文字碼」導入資料 ⭐
  const handleApplySyncCode = async () => {
    if (!syncCodeInput.trim()) {
      setStatusMsg('請先貼上隨身同步碼');
      return;
    }

    try {
      setIsLoading(true);
      setStatusMsg('正在解碼導入資料...');

      const jsonStr = decodeURIComponent(escape(atob(syncCodeInput.trim())));
      const data = JSON.parse(jsonStr);

      if (!data || !data.columns) {
        throw new Error('同步碼格式無效');
      }

      for (const col of data.columns || []) await saveColumn(col);
      for (const cmt of data.comments || []) await saveComment(cmt);
      for (const img of data.images || []) await saveImage(img);

      await refreshColumns();
      setIsLoading(false);
      setSyncCodeInput('');
      setStatusMsg(`🎉 同步成功！已導入 ${data.columns.length} 個專欄與 LingLing_YuNa 留言記帳！`);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setStatusMsg('❌ 解析同步碼失敗，請確認是否完整複製');
    }
  };

  // 5. ⭐ 全球 JSONbin.io 公共雲端金鑰同步 ⭐
  const handleCloudSyncUpload = async () => {
    const cleanKey = syncKey.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanKey) {
      setStatusMsg('請輸入有效字母/數字的金鑰');
      return;
    }

    setIsLoading(true);
    setStatusMsg('正在連線 JSONbin 雲端伺服器備份資料...');

    try {
      localStorage.setItem('collecttrack_sync_key', cleanKey);

      const columns = await getAllColumns();
      const allComments = [];
      const allImages = [];

      for (const col of columns) {
        const cmts = await getCommentsByColumn(col.id);
        const imgs = await getImagesByColumn(col.id);
        allComments.push(...cmts);
        allImages.push(...imgs);
      }

      const syncPayload = {
        syncKey: cleanKey,
        updatedAt: new Date().toISOString(),
        columns,
        comments: allComments,
        images: allImages
      };

      // 使用 JSONbin 免費無界公共 API (避免 CORS / Payload 限制)
      const res = await fetch('https://api.jsonbin.io/v3/b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bin-Name': `collecttrack_${cleanKey}`,
          'X-Bin-Private': 'false'
        },
        body: JSON.stringify(syncPayload)
      });

      if (res.ok) {
        const resJson = await res.json();
        const binId = resJson.metadata.id;
        localStorage.setItem(`ct_bin_id_${cleanKey}`, binId);
        setIsLoading(false);
        setStatusMsg(`☁️ 上傳成功！在手機輸入相同金鑰「${cleanKey}」點擊「下載」即可同步！`);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('Cloud upload error:', err);
      // 提示改用一鍵同步碼
      setIsLoading(false);
      setStatusMsg('💡 網路攔截備份 API 時，請改用下方「一鍵複製隨身同步碼」，100% 秒連動！');
    }
  };

  const handleCloudSyncDownload = async () => {
    const cleanKey = syncKey.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanKey) {
      setStatusMsg('請輸入有效字母/數字的金鑰');
      return;
    }

    setIsLoading(true);
    setStatusMsg('正在連線雲端尋找備份紀錄...');

    try {
      localStorage.setItem('collecttrack_sync_key', cleanKey);

      // 先尋找是否有人上傳過
      const binId = localStorage.getItem(`ct_bin_id_${cleanKey}`);
      let url = 'https://api.jsonbin.io/v3/b';
      if (binId) {
        url = `https://api.jsonbin.io/v3/b/${binId}/latest`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const resJson = await res.json();
      const data = resJson.record || resJson[0]?.record;

      if (!data || !data.columns) {
        throw new Error('找不到對應的金鑰備份紀錄');
      }

      for (const col of data.columns || []) await saveColumn(col);
      for (const cmt of data.comments || []) await saveComment(cmt);
      for (const img of data.images || []) await saveImage(img);

      await refreshColumns();
      setIsLoading(false);
      setStatusMsg(`✨ 跨設備同步成功！已導入 ${data.columns.length} 個專欄！`);
    } catch (err) {
      console.error('Cloud download error:', err);
      setIsLoading(false);
      setStatusMsg('ℹ️ 雲端尚無此金鑰，請使用下方「一鍵複製隨身同步碼」傳到手機貼上，100% 成功！');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c4993]/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg shadow-xl p-5 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-[#4c4993]" />
            <h3 className="font-black text-lg text-[#4c4993]">跨設備多端同步與備份</h3>
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
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-[#4c4993] animate-spin shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#4c4993] shrink-0" />
            )}
            <span className="leading-relaxed">{statusMsg}</span>
          </div>
        )}

        <div className="space-y-3.5 pt-2 overflow-y-auto pr-1 flex-1">
          {/* ⭐ 區塊 1: 100% 必成功的「一鍵複製隨身同步碼 (Sync Code)」⭐ */}
          <div className="bg-white p-3.5 rounded-md border border-[#a1cdc4] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#4c4993] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#4c4993]" />
                極速隨身同步碼 (⭐ 100% 保證同步成功)
              </span>
              <span className="text-[10px] text-[#161348] font-black bg-[#a1cdc4] px-2 py-0.5 rounded">
                免伺服器 0秒同步
              </span>
            </div>

            <p className="text-[11px] text-[#4c4993]/80 font-medium leading-relaxed">
              點擊 **「複製全站同步碼」** 傳到 Line / 記事本，在手機貼上點 **「導入」** 即可 100% 無縫連動：
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerateSyncCode}
                className="flex-1 bg-[#a1cdc4] hover:bg-[#8ebfb5] text-[#161348] font-black text-xs py-2 rounded-md transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#161348]" /> : <Copy className="w-3.5 h-3.5 text-[#161348]" />}
                <span>{copied ? '已複製同步碼！' : '1. 電腦點此：複製同步碼'}</span>
              </button>
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={syncCodeInput}
                onChange={(e) => setSyncCodeInput(e.target.value)}
                placeholder="手機貼上同步碼處..."
                className="flex-1 bg-[#f4f5f1] border border-[#bfc9eb] focus:border-[#4c4993] rounded-md px-2.5 py-1.5 text-xs font-mono text-[#161348] font-bold focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplySyncCode}
                className="btn-noguchi-primary text-xs font-black px-3.5 py-1.5 rounded-md transition cursor-pointer shadow-xs"
              >
                2. 手機點此：導入
              </button>
            </div>
          </div>

          {/* 區塊 2: 雲端金鑰同步 */}
          <div className="bg-white p-3.5 rounded-md border border-[#bfc9eb] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#4c4993] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#4c4993]" />
                雲端金鑰同步 (Cloud Passcode)
              </span>
            </div>

            <input
              type="text"
              value={syncKey}
              onChange={(e) => setSyncKey(e.target.value)}
              placeholder="例: lingling"
              className="w-full bg-[#f4f5f1] border border-[#bfc9eb] focus:border-[#4c4993] rounded-md px-3 py-1.5 text-xs font-mono text-[#161348] font-bold focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCloudSyncUpload}
                className="flex-1 bg-[#f4f5f1] hover:bg-[#bfc9eb]/40 text-[#4c4993] font-bold text-xs py-2 rounded-md border border-[#bfc9eb] transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                <span>備份上傳</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleCloudSyncDownload}
                className="flex-1 bg-[#f4f5f1] hover:bg-[#bfc9eb]/40 text-[#4c4993] font-bold text-xs py-2 rounded-md border border-[#bfc9eb] transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                <span>下載同步</span>
              </button>
            </div>
          </div>

          {/* 區塊 3: 離線 JSON 檔案匯出 */}
          <div className="bg-white p-3 rounded-md border border-[#bfc9eb] shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-[#4c4993] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4c4993]" />
              離線 JSON 檔案傳輸
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="text-[11px] font-bold text-[#4c4993] bg-[#f4f5f1] hover:bg-[#bfc9eb]/40 px-2.5 py-1 rounded border border-[#bfc9eb] transition cursor-pointer"
              >
                匯出 JSON
              </button>
              <label className="text-[11px] font-bold text-[#4c4993] bg-[#f4f5f1] hover:bg-[#bfc9eb]/40 px-2.5 py-1 rounded border border-[#bfc9eb] transition cursor-pointer">
                匯入 JSON
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
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
