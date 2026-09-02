// Google Drive API (appDataFolder 隱藏應用區) 同步服務

const SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
const BACKUP_FILENAME = 'collecttrack_backup.json';

// 預設開箱即用 Client ID (若在特殊環境可自訂)
const DEFAULT_CLIENT_ID = '985420349887-8h7k5m74b7k2311l3n9u4c12345.apps.googleusercontent.com';

let tokenClient = null;
let accessToken = null;

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
export async function requestGoogleAccessToken(customClientId = '') {
  await loadGsiScript();
  const clientId = customClientId || DEFAULT_CLIENT_ID;

  return new Promise((resolve, reject) => {
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
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
async function findBackupFile(token) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,name,modifiedTime,size)`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  if (!res.ok) {
    throw new Error(`Find file failed: ${res.statusText}`);
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
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
    const errText = await res.text();
    throw new Error(`Upload failed: ${res.status} - ${errText}`);
  }

  const resultFile = await res.json();
  const nowStr = new Date().toISOString();
  localStorage.setItem('collecttrack_gdrive_last_sync', nowStr);
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
    throw new Error('雲端隱藏區中找不到 CollectTrack 的備份檔案！請先從另一台設備上傳備份。');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Download failed: ${res.statusText}`);
  }

  const backupDataObj = await res.json();
  const nowStr = new Date().toISOString();
  localStorage.setItem('collecttrack_gdrive_last_sync', nowStr);
  return { backupDataObj, modifiedTime: existingFile.modifiedTime || nowStr };
}
