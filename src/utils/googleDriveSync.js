// Google Drive API (appDataFolder 隱藏應用區) 同步服務

const SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
const BACKUP_FILENAME = 'collecttrack_backup.json';

let tokenClient = null;
let accessToken = null;

// 自動背景上傳開關狀態
export function getAutoSyncEnabled() {
  const val = localStorage.getItem('collecttrack_gdrive_auto_sync');
  return val === null ? true : val === 'true';
}

export function setAutoSyncEnabled(enabled) {
  localStorage.setItem('collecttrack_gdrive_auto_sync', enabled ? 'true' : 'false');
}

// ⭐ 自動下載還原開關狀態 ⭐
export function getAutoDownloadEnabled() {
  const val = localStorage.getItem('collecttrack_gdrive_auto_download');
  return val === null ? true : val === 'true'; // 預設開啟自動下載還原
}

export function setAutoDownloadEnabled(enabled) {
  localStorage.setItem('collecttrack_gdrive_auto_download', enabled ? 'true' : 'false');
}

// 取得或設定自訂的 Client ID
export function getSavedClientId() {
  return localStorage.getItem('collecttrack_gdrive_client_id') || '';
}

export function saveClientId(clientId) {
  if (clientId && clientId.trim()) {
    localStorage.setItem('collecttrack_gdrive_client_id', clientId.trim());
  } else {
    localStorage.removeItem('collecttrack_gdrive_client_id');
  }
}

// 動態載入 Google Identity Services SDK
export function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

// 取得當前儲存的 Access Token 或 User Info
export function getSavedGoogleUser() {
  try {
    const raw = localStorage.getItem('collecttrack_gdrive_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGoogleUser(userObj) {
  if (userObj) {
    localStorage.setItem('collecttrack_gdrive_user', JSON.stringify(userObj));
  } else {
    localStorage.removeItem('collecttrack_gdrive_user');
    localStorage.removeItem('collecttrack_gdrive_token');
  }
}

// 初始化 Token Client 並獲取授權
export async function requestGoogleAccessToken(overrideClientId = '') {
  await loadGsiScript();
  const clientId = overrideClientId || getSavedClientId();

  if (!clientId || !clientId.trim()) {
    throw new Error('MISSING_CLIENT_ID');
  }

  return new Promise((resolve, reject) => {
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) {
            reject(response);
            return;
          }
          accessToken = response.access_token;
          localStorage.setItem('collecttrack_gdrive_token', accessToken);

          // 取得使用者個人基本資料
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const userData = await userRes.json();
            const userObj = {
              name: userData.name || userData.email || 'Google 使用者',
              email: userData.email || '',
              picture: userData.picture || '',
              loggedAt: new Date().toISOString()
            };
            saveGoogleUser(userObj);
            resolve({ accessToken, user: userObj });
          } catch (e) {
            console.warn('Failed to fetch userinfo:', e);
            resolve({ accessToken, user: { name: 'Google 使用者' } });
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

// 登出 Google 帳號
export function logoutGoogle() {
  const token = accessToken || localStorage.getItem('collecttrack_gdrive_token');
  if (token && window.google && window.google.accounts) {
    try {
      window.google.accounts.oauth2.revoke(token, () => {});
    } catch {}
  }
  accessToken = null;
  saveGoogleUser(null);
}

// 取得有效的 Access Token
function getValidToken() {
  return accessToken || localStorage.getItem('collecttrack_gdrive_token');
}

// 尋找 appDataFolder 中的備份檔案
export async function findBackupFile(token) {
  const authToken = token || getValidToken();
  if (!authToken) return null;

  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,name,modifiedTime,size)`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || res.statusText || `HTTP ${res.status}`;
      if (res.status === 403 || errMsg.includes('disabled') || errMsg.includes('not been used')) {
        throw new Error('DRIVE_API_NOT_ENABLED');
      }
      throw new Error(`搜尋雲端備份檔失敗 (${res.status}): ${errMsg}`);
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (err) {
    if (err.message === 'DRIVE_API_NOT_ENABLED') throw err;
    console.warn('findBackupFile notice:', err);
    return null;
  }
}

// ⭐ 上傳 JSON 備份檔至 Google Drive 隱藏應用區 (appDataFolder) ⭐
export async function uploadToGoogleDrive(backupDataObj) {
  const token = getValidToken();
  if (!token) {
    throw new Error('未登入 Google 帳號或 Token 已過期');
  }

  const existingFile = await findBackupFile(token);
  const jsonContent = JSON.stringify(backupDataObj, null, 2);

  const metadata = {
    name: BACKUP_FILENAME,
    mimeType: 'application/json',
    parents: existingFile ? undefined : ['appDataFolder']
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([jsonContent], { type: 'application/json' }));

  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&spaces=appDataFolder';
  let method = 'POST';

  if (existingFile) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
    method = 'PATCH';
  }

  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson?.error?.message || res.statusText || `HTTP ${res.status}`;
    if (res.status === 403 || errMsg.includes('disabled') || errMsg.includes('not been used')) {
      throw new Error('DRIVE_API_NOT_ENABLED');
    }
    throw new Error(`雲端上傳失敗 (${res.status}): ${errMsg}`);
  }

  const resultFile = await res.json();
  const nowStr = new Date().toISOString();
  localStorage.setItem('collecttrack_gdrive_last_sync', nowStr);
  localStorage.setItem('collecttrack_local_last_modified', nowStr);
  return { file: resultFile, syncTime: nowStr };
}

// ⭐ 從 Google Drive 隱藏應用區 (appDataFolder) 下載備份數據 ⭐
export async function downloadFromGoogleDrive() {
  const token = getValidToken();
  if (!token) {
    throw new Error('未登入 Google 帳號或 Token 已過期');
  }

  const existingFile = await findBackupFile(token);
  if (!existingFile) {
    throw new Error('雲端隱藏區中尚無 CollectTrack 備份檔，請先在其他設備點擊【上傳最新數據到雲端】！');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`下載失敗 (${res.status}): ${res.statusText}`);
  }

  const backupDataObj = await res.json();
  const nowStr = new Date().toISOString();
  const cloudTime = existingFile.modifiedTime || backupDataObj.exportedAt || nowStr;

  localStorage.setItem('collecttrack_gdrive_last_sync', nowStr);
  localStorage.setItem('collecttrack_local_last_modified', cloudTime);

  return { backupDataObj, modifiedTime: cloudTime };
}
