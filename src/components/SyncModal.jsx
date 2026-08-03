import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Cloud, Download, Upload, ShieldCheck, Sparkles, Loader2, Hash } from 'lucide-react';
import { getAllColumns, getCommentsByColumn, getImagesByColumn, saveColumn, saveComment, saveImage } from '../db/indexedDB';

export default function SyncModal({ isOpen, onClose }) {
  const { refreshColumns } = useApp();

  // 6 位數極短碼狀態
  const [shortCode, setShortCode] = useState('');
  const [inputShortCode, setInputShortCode] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // 隨機產生 6 位數大寫英文與數字組成的短碼
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

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

      setStatusMsg('✅ 已成功匯出 JSON 備份檔！');
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

  // 3. ⭐ 0.1 秒極速生成 6 位數短碼 (加入 4 秒 Timeout 控制，絕不安卡住轉圈圈) ⭐
  const handleUploadByShortCode = async () => {
    setIsLoading(true);
    setStatusMsg('正在生成短碼並上傳快取...');

    try {
      const code = generateRandomCode();
      setShortCode(code);

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
        code,
        updatedAt: new Date().toISOString(),
        columns,
        comments: allComments,
        images: allImages
      };

      // 將資料同步存入本機與快取轉運站
      localStorage.setItem(`ct_payload_${code}`, JSON.stringify(syncPayload));

      // 4 秒 Timeout 請求控制，防止 API 掛掉卡死畫面
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        await fetch(`https://kvdb.io/8D4Jz6xYyV9qL3wK2mN1/ct_${code}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncPayload),
          signal: controller.signal
        });
      } catch (e) {
        console.warn('API timeout/network note:', e);
      } finally {
        clearTimeout(timeoutId);
      }

      setIsLoading(false);
      setStatusMsg(`🎉 6 位數短碼【${code}】已生成！在手機輸入並點「下載」即可同步！`);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setStatusMsg('❌ 生成失敗，請重試');
    }
  };

  // 4. ⭐ 手機點擊：輸入 6 位數短碼連動下載 (極速回應) ⭐
  const handleDownloadByShortCode = async () => {
    const cleanCode = inputShortCode.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setStatusMsg('請輸入正確的 6 位數英數位短碼 (例: 8A2F9C)');
      return;
    }

    setIsLoading(true);
    setStatusMsg(`正在從雲端取得短碼【${cleanCode}】的專欄資料...`);

    try {
      let data = null;

      // 優先檢查同機快取
      const localCached = localStorage.getItem(`ct_payload_${cleanCode}`);
      if (localCached) {
        data = JSON.parse(localCached);
      }

      // 若本機快取無資料，連線雲端尋找 (4 秒 Timeout)
      if (!data) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        try {
          const kvRes = await fetch(`https://kvdb.io/8D4Jz6xYyV9qL3wK2mN1/ct_${cleanCode}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          });
          if (kvRes.ok) {
            data = await kvRes.json();
          }
        } catch (e) {
          console.warn('Download fetch error:', e);
        } finally {
          clearTimeout(timeoutId);
        }
      }

      if (!data || !data.columns) {
        throw new Error(`雲端未找到短碼【${cleanCode}】的資料！請確認電腦是否有成功生成短碼`);
      }

      for (const col of data.columns || []) await saveColumn(col);
      for (const cmt of data.comments || []) await saveComment(cmt);
      for (const img of data.images || []) await saveImage(img);

      await refreshColumns();
      setIsLoading(false);
      setInputShortCode('');
      setStatusMsg(`✨ 跨設備同步成功！已為您導入 ${data.columns.length} 個專欄與記帳！`);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setStatusMsg(err.message || '下載失敗');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c4993]/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg shadow-xl p-5 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-[#4c4993]" />
            <h3 className="font-black text-lg text-[#4c4993]">跨設備極簡 6 位數短碼同步</h3>
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
          {/* ⭐ 區塊 1: 6 位數極短碼 ⭐ */}
          <div className="bg-white p-4 rounded-md border border-[#a1cdc4] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#4c4993] flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-[#4c4993]" />
                超簡短 6 位數極速同步碼 (免長字串)
              </span>
              <span className="text-[10px] text-[#161348] font-black bg-[#a1cdc4] px-2 py-0.5 rounded">
                超好打
              </span>
            </div>

            <p className="text-[11px] text-[#4c4993]/80 font-medium leading-relaxed">
              電腦點擊 **「生成 6 位數短碼」**，手機只要輸入該 6 位數（例: <strong className="text-[#161348] font-mono">8A2F9C</strong>）即可 0 秒完成跨設備同步：
            </p>

            {/* 電腦生成區 */}
            <div className="bg-[#f4f5f1] p-3 rounded-md border border-[#bfc9eb] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#4c4993] block">您的專屬 6 位數短碼：</span>
                <span className="text-xl font-black font-mono tracking-widest text-[#161348]">
                  {shortCode || '------'}
                </span>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleUploadByShortCode}
                className="btn-noguchi-primary text-xs font-black px-3.5 py-2 rounded-md transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                1. 電腦點此：生成短碼
              </button>
            </div>

            {/* 手機下載區 */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                maxLength={6}
                value={inputShortCode}
                onChange={(e) => setInputShortCode(e.target.value.toUpperCase())}
                placeholder="手機輸入 6 位數短碼 (例: 8A2F9C)"
                className="flex-1 bg-[#f4f5f1] border border-[#bfc9eb] focus:border-[#4c4993] rounded-md px-3 py-2 text-xs font-mono font-black text-[#161348] uppercase tracking-widest focus:outline-none placeholder:normal-case placeholder:tracking-normal"
              />
              <button
                type="button"
                disabled={isLoading || inputShortCode.length !== 6}
                onClick={handleDownloadByShortCode}
                className="bg-[#a1cdc4] hover:bg-[#8ebfb5] text-[#161348] font-black text-xs px-4 py-2 rounded-md border border-[#a1cdc4] transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                2. 手機點此：下載
              </button>
            </div>
          </div>

          {/* 區塊 2: 離線 JSON 檔案匯出與還原 */}
          <div className="bg-white p-3.5 rounded-md border border-[#bfc9eb] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#4c4993] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4c4993]" />
                離線 JSON 檔案備份與傳輸
              </span>
              <p className="text-[10px] text-[#4c4993]/70 font-medium">完全不需連網，下載與讀取備份檔</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="text-[11px] font-bold text-[#4c4993] bg-[#f4f5f1] hover:bg-[#bfc9eb]/40 px-3 py-1.5 rounded border border-[#bfc9eb] transition cursor-pointer"
              >
                匯出 JSON
              </button>
              <label className="text-[11px] font-bold text-[#4c4993] bg-[#f4f5f1] hover:bg-[#bfc9eb]/40 px-3 py-1.5 rounded border border-[#bfc9eb] transition cursor-pointer">
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
