import { openDB } from 'idb';

const DB_NAME = 'CollectTrackDB';
const DB_VERSION = 2; // 升級版本號支援 folders 表

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('columns')) {
        db.createObjectStore('columns', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('comments')) {
        const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
        commentStore.createIndex('columnId', 'columnId', { unique: false });
      }
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { keyPath: 'id' });
        imageStore.createIndex('columnId', 'columnId', { unique: false });
      }
      // 新增 folders 資料夾 ObjectStore
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
    },
  });
}

// ---------------- 📁 資料夾 (Folders) ----------------
export async function getAllFolders() {
  const db = await initDB();
  return db.getAll('folders');
}

export async function saveFolder(folder) {
  const db = await initDB();
  return db.put('folders', folder);
}

export async function deleteFolder(id) {
  const db = await initDB();
  return db.delete('folders', id);
}

// ---------------- 專欄 (Columns) ----------------
export async function getAllColumns() {
  const db = await initDB();
  return db.getAll('columns');
}

export async function saveColumn(column) {
  const db = await initDB();
  return db.put('columns', column);
}

export async function deleteColumn(id) {
  const db = await initDB();
  const tx = db.transaction(['columns', 'comments', 'images'], 'readwrite');
  
  await tx.objectStore('columns').delete(id);
  
  // 刪除關聯的留言與圖片
  const cIndex = tx.objectStore('comments').index('columnId');
  let cCursor = await cIndex.openCursor(id);
  while (cCursor) {
    await cCursor.delete();
    cCursor = await cCursor.continue();
  }

  const iIndex = tx.objectStore('images').index('columnId');
  let iCursor = await iIndex.openCursor(id);
  while (iCursor) {
    await iCursor.delete();
    iCursor = await iCursor.continue();
  }

  await tx.done;
}

// ---------------- 留言 (Comments) ----------------
export async function getCommentsByColumn(columnId) {
  const db = await initDB();
  return db.getAllFromIndex('comments', 'columnId', columnId);
}

export async function saveComment(comment) {
  const db = await initDB();
  return db.put('comments', comment);
}

export async function deleteComment(id) {
  const db = await initDB();
  return db.delete('comments', id);
}

// ---------------- 圖片 (Images) ----------------
export async function getImagesByColumn(columnId) {
  const db = await initDB();
  return db.getAllFromIndex('images', 'columnId', columnId);
}

export async function saveImage(image) {
  const db = await initDB();
  return db.put('images', image);
}

export async function deleteImage(id) {
  const db = await initDB();
  return db.delete('images', id);
}

// 批次刪除圖片
export async function deleteImagesBatch(ids = []) {
  if (!ids || ids.length === 0) return;
  const db = await initDB();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  for (const id of ids) {
    await store.delete(id);
  }
  await tx.done;
}

// 刪除專欄下的所有圖片
export async function deleteAllImagesByColumn(columnId) {
  const db = await initDB();
  const tx = db.transaction('images', 'readwrite');
  const index = tx.objectStore('images').index('columnId');
  let cursor = await index.openCursor(columnId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// 重置所有資料
export async function clearAllData() {
  const db = await initDB();
  const tx = db.transaction(['columns', 'comments', 'images', 'folders'], 'readwrite');
  await tx.objectStore('columns').clear();
  await tx.objectStore('comments').clear();
  await tx.objectStore('images').clear();
  await tx.objectStore('folders').clear();
  await tx.done;
}
