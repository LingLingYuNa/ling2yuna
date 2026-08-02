import { openDB } from 'idb';

const DB_NAME = 'CollectTrackDB';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 專欄表 (Columns)
      if (!db.objectStoreNames.contains('columns')) {
        const columnStore = db.createObjectStore('columns', { keyPath: 'id' });
        columnStore.createIndex('createdAt', 'createdAt');
      }

      // 專欄/圖片 留言記帳表 (Comments)
      if (!db.objectStoreNames.contains('comments')) {
        const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
        commentStore.createIndex('columnId', 'columnId');
        commentStore.createIndex('imageId', 'imageId');
        commentStore.createIndex('createdAt', 'createdAt');
      }

      // 圖片表 (Images)
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { keyPath: 'id' });
        imageStore.createIndex('columnId', 'columnId');
      }

      // 週邊訂單表 (Orders)
      if (!db.objectStoreNames.contains('orders')) {
        const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
        orderStore.createIndex('createdAt', 'createdAt');
      }

      // 生活極簡記帳 (SimpleLedger)
      if (!db.objectStoreNames.contains('simpleLedger')) {
        const ledgerStore = db.createObjectStore('simpleLedger', { keyPath: 'id' });
        ledgerStore.createIndex('date', 'date');
      }
    },
  });
}

// 內建設定/預設資料全部清空 (用戶乾淨初始狀態)
export const initialColumnsData = [];
export const initialCommentsData = [];
export const initialImagesData = [];

// 完全清空本地資料庫中現有的所有 Demo 與記錄
export async function clearAllData() {
  const db = await initDB();
  const tx = db.transaction(['columns', 'comments', 'images', 'orders', 'simpleLedger'], 'readwrite');
  await tx.objectStore('columns').clear();
  await tx.objectStore('comments').clear();
  await tx.objectStore('images').clear();
  await tx.objectStore('orders').clear();
  await tx.objectStore('simpleLedger').clear();
  await tx.done;
}

// 取得所有專欄並附帶各專欄留言記帳總花費金額
export async function getAllColumns() {
  const db = await initDB();
  const list = await db.getAll('columns');

  // 為每一個專欄計算當前留言記帳總花費
  const listWithTotals = await Promise.all(
    list.map(async (col) => {
      const comments = await db.getAllFromIndex('comments', 'columnId', col.id);
      const totalAmount = comments.reduce((sum, c) => sum + (c.parsed?.total || 0), 0);
      const totalQty = comments.reduce((sum, c) => sum + (c.parsed?.qty || 0), 0);
      return {
        ...col,
        totalAmount,
        totalQty,
        commentsCount: comments.length
      };
    })
  );

  return listWithTotals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function saveColumn(column) {
  const db = await initDB();
  await db.put('columns', column);
  return column;
}

export async function deleteColumn(id) {
  const db = await initDB();
  await db.delete('columns', id);
  // 同時刪除關聯圖片與留言
  const tx = db.transaction(['images', 'comments'], 'readwrite');
  const imageStore = tx.objectStore('images');
  const commentStore = tx.objectStore('comments');
  
  const images = await imageStore.index('columnId').getAll(id);
  for (const img of images) await imageStore.delete(img.id);
  
  const comments = await commentStore.index('columnId').getAll(id);
  for (const cmt of comments) await commentStore.delete(cmt.id);

  await tx.done;
}

export async function getCommentsByColumn(columnId) {
  const db = await initDB();
  const list = await db.getAllFromIndex('comments', 'columnId', columnId);
  return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export async function saveComment(comment) {
  const db = await initDB();
  await db.put('comments', comment);
  return comment;
}

export async function deleteComment(id) {
  const db = await initDB();
  await db.delete('comments', id);
}

export async function getImagesByColumn(columnId) {
  const db = await initDB();
  const list = await db.getAllFromIndex('images', 'columnId', columnId);
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function saveImage(image) {
  const db = await initDB();
  await db.put('images', image);
  return image;
}

export async function deleteImage(id) {
  const db = await initDB();
  await db.delete('images', id);
}
