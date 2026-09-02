import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  getSavedGoogleUser,
  requestGoogleAccessToken,
  logoutGoogle,
  uploadToGoogleDrive,
  downloadFromGoogleDrive,
  getSavedClientId,
  saveClientId
} from '../utils/googleDriveSync';
import { X, Cloud, Download, Upload, RefreshCw, Check, AlertCircle, FileJson, Copy, ShieldCheck, LogOut, Settings, ExternalLink, Key } from 'lucide-react';

export default function SyncModal({ isOpen, onClose }) {
  const { exportFullBackupJSON, importFullBackupJSON } = useApp();

  // Google Drive 同步狀態
  const [googleUser, setGoogleUser] = useState(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null); // { type: 'success'|'error', text: '' }
  const [lastSyncTime, setLastSyncTime] = useState('');

  // Client ID 設定狀態
  const [clientIdInput, setClientIdInput] = useState('');
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGoogleUser(getSavedGoogleUser());
      setLastSyncTime(localStorage.getItem('collecttrack_gdrive_last_sync') || '');
      setSyncStatusMsg(null);
      const savedId = getSavedClientId();
      setClientIdInput(savedId);
      if (!savedId) {
        setShowConfigPanel(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 儲存設定 Client ID
  const handleSaveClientId = () => {
    if (!clientIdInput.trim()) {
      alert('請輸入有效的 Google OAuth Client ID');
      return;
    }
    saveClientId(clientIdInput.trim());
    setSyncStatusMsg({ type: 'success', text: '✅ Client ID 已成功儲存！現在可以點擊授權登入囉。' });
    setShowConfigPanel(false);
  };

  // 複製目前的 Vercel 網址供設定 JavaScript origins 使用
  const handleCopyOrigin = () => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(origin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  // 登入 Google 帳號授權 appDataFolder
  const handleGoogleLogin = async () => {
    const currentId = getSavedClientId();
    if (!currentId) {
      setShowConfigPanel(true);
      setSyncStatusMsg({ type: 'error', text: '請先在下方填入您的 Google OAuth Client ID 即可開始使用！' });
      return;
    }

    setIsAuthorizing(true);
    setSyncStatusMsg(null);
    try {
      const { user } = await requestGoogleAccessToken();
      setGoogleUser(user);
      setSyncStatusMsg({ type: 'success', text: `成功連結 Google 帳號 (${user.email || user.name})！` });
    } catch (err) {
      console.error('Google login failed:', err);
      if (err.message === 'MISSING_CLIENT_ID') {
        setShowConfigPanel(true);
        setSyncStatusMsg({ type: 'error', text: '請先設定 Client ID 才能連接 Google 雲端。' });
      } else {
        setSyncStatusMsg({ type: 'error', text: 'Google 授權失敗 (請確認已將目前的網址加到 Google Console 的已核准來源)。' });
      }
    } finally {
      setIsAuthorizing(false);
    }
  };

  // 登出 Google 帳號
  const handleGoogleLogout = () => {
    logoutGoogle();
    setGoogleUser(null);
    setSyncStatusMsg({ type: 'success', text: '已順利登出 Google 帳號。' });
  };

  // 上傳數據至 Google Drive 隱藏區
  const handleUploadToCloud = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const backupData = await exportFullBackupJSON();
      const { syncTime } = await uploadToGoogleDrive(backupData);
      setLastSyncTime(syncTime);
      setSyncStatusMsg({ type: 'success', text: '☁️ 已成功將最新數據同步備份至 Google 雲端硬碟！' });
    } catch (err) {
      console.error('Upload error:', err);
      if (err.message && err.message.includes('過期')) {
        setSyncStatusMsg({ type: 'error', text: 'Google 登入憑證已過期，請重新點擊登入！' });
      } else {
        setSyncStatusMsg({ type: 'error', text: `雲端上傳失敗: ${err.message || '請重新登入 Google 帳號'}` });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // 從 Google Drive 隱藏區下載並覆蓋還原
  const handleDownloadFromCloud = async () => {
    if (!window.confirm('⚠️ 警告：從 Google 雲端還原將會使用雲端檔案【完全覆蓋】本機設備的所有數據！確定要繼續嗎？')) {
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const { backupDataObj, modifiedTime } = await downloadFromGoogleDrive();
      await importFullBackupJSON(backupDataObj);
      setLastSyncTime(modifiedTime);
      setSyncStatusMsg({ type: 'success', text: '🎉 已成功從 Google 雲端下載並還原全量專欄與留言數據！' });
    } catch (err) {
      console.error('Download error:', err);
      if (err.message && err.message.includes('過期')) {
        setSyncStatusMsg({ type: 'error', text: 'Google 登入憑證已過期，請重新點擊登入！' });
      } else {
        setSyncStatusMsg({ type: 'error', text: `雲端還原失敗: ${err.message || '找不到雲端備份檔'}` });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // 手動本地下載 JSON
  const handleDownloadLocalJSON = async () => {
    const backupData = await exportFullBackupJSON();
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CollectTrack_完整備份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 手動選擇備份 JSON 上傳還原
  const handleUploadLocalJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('確定要導入此 JSON 備份檔並覆蓋本機現有資料嗎？')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result);
        await importFullBackupJSON(json);
        alert('已成功還原備份資料！');
        onClose();
      } catch (err) {
        alert('備份檔案格式錯誤或損毀：' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c4993]/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg shadow-xl p-5 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-[#4c4993]" />
            <h3 className="font-black text-lg text-[#4c4993]">跨設備雲端同步與備份</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#4c4993]/60 hover:text-[#4c4993] p-1.5 rounded-lg hover:bg-[#bfc9eb]/40 transition cursor-pointer border border-[#bfc9eb]/60 bg-white shadow-xs"
          >
            <X className="w-4 h-4 text-[#4c4993]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="pt-4 space-y-5 overflow-y-auto pr-1">

          {/* ⭐ 方案 A：Google Drive 隱藏應用區 (appDataFolder) 雲端同步卡片 ⭐ */}
          <div className="bg-gradient-to-br from-[#161348] via-[#2d287d] to-[#4c4993] text-white p-4 rounded-lg shadow-md space-y-3 relative overflow-hidden border border-[#a1cdc4]">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <Cloud className="w-4 h-4 text-[#a1cdc4]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Google Drive 雲端同步</span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#a1cdc4] text-[#161348]">方案 A 隱私區</span>
                  </h4>
                  <p className="text-[10px] text-[#a1cdc4] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>資料隱藏加密存於專屬 AppData，保障隱私</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setShowConfigPanel(!showConfigPanel)}
                  className="text-[11px] text-white/80 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition cursor-pointer border border-white/20"
                  title="設定 Google API Client ID"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{showConfigPanel ? '收合設定' : '設定 Client ID'}</span>
                </button>

                {googleUser && (
                  <button
                    type="button"
                    onClick={handleGoogleLogout}
                    className="text-[11px] text-white/70 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition cursor-pointer"
                    title="登出 Google 帳號"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>登出</span>
                  </button>
                )}
              </div>
            </div>

            {/* 提示訊息 Toast */}
            {syncStatusMsg && (
              <div className={`p-2.5 rounded text-xs font-black flex items-center gap-1.5 ${
                syncStatusMsg.type === 'success'
                  ? 'bg-green-500/20 text-green-200 border border-green-400/40'
                  : 'bg-red-500/20 text-red-200 border border-red-400/40'
              }`}>
                {syncStatusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{syncStatusMsg.text}</span>
              </div>
            )}

            {/* ⚙️ Client ID 設定面板 (1 分鐘免費引導) */}
            {showConfigPanel && (
              <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-lg border border-white/30 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-[#a1cdc4]" />
                    設定您的 Google OAuth Client ID
                  </span>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#a1cdc4] hover:underline flex items-center gap-0.5 font-bold"
                  >
                    前往 Google Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1.5 text-[11px] text-white/90">
                  <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/10 font-bold">
                    <span>1. 複製此網址填入「已核准 JavaScript 來源」:</span>
                    <button
                      type="button"
                      onClick={handleCopyOrigin}
                      className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] font-black text-[#a1cdc4] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedOrigin ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOrigin ? '已複製網址' : '複製網址'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#a1cdc4] font-semibold">
                    2. 在 Google Console 建立「Web 應用程式 ID」，並將產生的 Client ID 貼在下方：
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="貼上格式如: xxxx.apps.googleusercontent.com"
                    className="flex-1 bg-white text-[#161348] border border-white/40 focus:border-[#a1cdc4] rounded px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveClientId}
                    className="bg-[#a1cdc4] hover:bg-[#8ebfb5] text-[#161348] font-black text-xs px-3 py-1.5 rounded transition cursor-pointer shrink-0 shadow-xs"
                  >
                    儲存 Key
                  </button>
                </div>
              </div>
            )}

            {/* 登入 / 動作操作區 */}
            {!googleUser ? (
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-xs flex flex-col items-center text-center space-y-2.5">
                <p className="text-xs text-white/90 font-medium">
                  連結您自己的 Google 帳號，即可在手機與電腦間自動同步所有專欄與留言記帳數據！
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isAuthorizing}
                  className="w-full bg-white hover:bg-gray-100 text-[#161348] font-black text-xs py-2 rounded-md transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Cloud className="w-4 h-4 text-[#4c4993]" />
                  <span>{isAuthorizing ? '正在開啟 Google 授權...' : '連結 Google 帳號開啟雲端同步'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 顯示登入使用者資訊 */}
                <div className="flex items-center justify-between text-xs bg-white/10 px-3 py-2 rounded-md font-bold">
                  <div className="flex items-center space-x-2 truncate">
                    {googleUser.picture ? (
                      <img src={googleUser.picture} alt="avatar" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#a1cdc4] text-[#161348] font-black text-[10px] flex items-center justify-center">
                        G
                      </div>
                    )}
                    <span className="truncate text-white">{googleUser.email || googleUser.name}</span>
                  </div>

                  {lastSyncTime && (
                    <span className="text-[10px] text-[#a1cdc4] font-mono shrink-0 ml-2">
                      上次同步: {new Date(lastSyncTime).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* 雲端上傳與還原動作按鈕 */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleUploadToCloud}
                    disabled={isSyncing}
                    className="bg-[#a1cdc4] hover:bg-[#8ebfb5] text-[#161348] font-black text-xs py-2 px-3 rounded-md transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isSyncing ? '上傳中...' : '📤 上傳最新數據到雲端'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadFromCloud}
                    disabled={isSyncing}
                    className="bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2 px-3 rounded-md transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/30 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-[#a1cdc4]" />
                    <span>{isSyncing ? '下載中...' : '📥 從雲端下載還原'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 📂 手動本地備份與復原 JSON 區塊 */}
          <div className="pt-2 border-t border-[#bfc9eb]/60 space-y-3">
            <h4 className="text-xs font-black text-[#4c4993] flex items-center justify-between">
              <span>手動檔案備份 (.json)</span>
              <span className="text-[10px] text-[#4c4993]/70 font-semibold">適合無網路時離線備份</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadLocalJSON}
                className="bg-white hover:bg-[#f4f5f1] text-[#4c4993] font-extrabold text-xs py-2 px-3 rounded-md border border-[#bfc9eb] transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-[#4c4993]" />
                <span>匯出 JSON 備份檔</span>
              </button>

              <label className="bg-white hover:bg-[#f4f5f1] text-[#4c4993] font-extrabold text-xs py-2 px-3 rounded-md border border-[#bfc9eb] transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-[#4c4993]" />
                <span>匯入 JSON 還原</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadLocalJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
