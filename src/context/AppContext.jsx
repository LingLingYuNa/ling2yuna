import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAllColumns,
  saveColumn,
  deleteColumn as dbDeleteColumn,
  getCommentsByColumn,
  saveComment as dbSaveComment,
  deleteComment as dbDeleteComment,
  getImagesByColumn,
  saveImage as dbSaveImage,
  deleteImage as dbDeleteImage,
  deleteImagesBatch as dbDeleteImagesBatch,
  deleteAllImagesByColumn as dbDeleteAllImagesByColumn,
  clearAllData
} from '../db/indexedDB';
import { parseLedgerComment } from '../utils/ledgerParser';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [columns, setColumns] = useState([]);
  
  // 網頁重新整理狀態持久化
  const [selectedColumnId, setSelectedColumnIdState] = useState(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#column/')) {
      return hash.replace('#column/', '');
    }
    const savedId = localStorage.getItem('collecttrack_selected_column_id');
    return savedId === 'HOME' ? null : savedId || null;
  });

  const setSelectedColumnId = (id) => {
    setSelectedColumnIdState(id);
    if (id) {
      localStorage.setItem('collecttrack_selected_column_id', id);
      window.history.replaceState(null, '', `#column/${id}`);
    } else {
      localStorage.setItem('collecttrack_selected_column_id', 'HOME');
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // 當前選取專欄的子資料
  const [columnComments, setColumnComments] = useState([]);
  const [columnImages, setColumnImages] = useState([]);
  
  // Modals & Lightbox 狀態
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);

  // 載入專欄數據
  const refreshColumns = async () => {
    try {
      const data = await getAllColumns();
      setColumns(data);

      if (selectedColumnId && !data.some(c => c.id === selectedColumnId)) {
        setSelectedColumnId(null);
      }
    } catch (err) {
      console.error('Failed to load columns:', err);
    }
  };

  useEffect(() => {
    refreshColumns();
  }, []);

  // 當選擇的專欄變更時，載入關聯的留言記帳與照片
  useEffect(() => {
    if (!selectedColumnId) {
      setColumnComments([]);
      setColumnImages([]);
      return;
    }
    
    let isMounted = true;
    const loadSubData = async () => {
      try {
        const [commentsData, imagesData] = await Promise.all([
          getCommentsByColumn(selectedColumnId),
          getImagesByColumn(selectedColumnId)
        ]);
        if (isMounted) {
          setColumnComments(commentsData);
          setColumnImages(imagesData);
        }
      } catch (err) {
        console.error('Error loading sub data for column:', err);
      }
    };

    loadSubData();
    return () => { isMounted = false; };
  }, [selectedColumnId]);

  // 新增或更新專欄
  const handleSaveColumn = async (columnData) => {
    const isEdit = !!columnData.id;
    const newCol = {
      id: columnData.id || `col-${Date.now()}`,
      title: columnData.title || '無標題專欄',
      description: columnData.description || '',
      category: columnData.category || '宣圖',
      coverImage: columnData.coverImage || '',
      tags: columnData.tags || [],
      createdAt: columnData.createdAt || new Date().toISOString()
    };
    await saveColumn(newCol);
    await refreshColumns();
    if (!isEdit) setSelectedColumnId(newCol.id);
    setIsColumnModalOpen(false);
    setEditingColumn(null);
  };

  // 刪除專欄
  const handleDeleteColumn = async (id) => {
    if (!window.confirm('確定要刪除此專欄嗎？專欄內的所有圖片與留言記帳也將一併刪除！')) return;
    await dbDeleteColumn(id);
    const updated = columns.filter(c => c.id !== id);
    setColumns(updated);
    if (selectedColumnId === id) {
      setSelectedColumnId(null);
    }
  };

  // 完全清空所有資料
  const handleResetData = async () => {
    if (!window.confirm('確定要清空所有二次元專欄與留言記帳紀錄嗎？此動作無法復原！')) return;
    await clearAllData();
    setColumns([]);
    setSelectedColumnId(null);
    setColumnComments([]);
    setColumnImages([]);
  };

  // 新增留言記帳 (解析 "白厄小卡*1=$60")
  const handleAddComment = async (text, author = 'LingLing_YuNa') => {
    if (!text || !text.trim() || !selectedColumnId) return;
    const parsed = parseLedgerComment(text);
    const newComment = {
      id: `cmt-${Date.now()}`,
      columnId: selectedColumnId,
      imageId: null,
      text: text.trim(),
      parsed,
      author,
      createdAt: new Date().toISOString()
    };

    await dbSaveComment(newComment);
    setColumnComments(prev => [...prev, newComment]);
  };

  // 編輯更新留言記帳
  const handleUpdateComment = async (id, newText) => {
    if (!newText || !newText.trim()) return;
    const existing = columnComments.find(c => c.id === id);
    if (!existing) return;

    const parsed = parseLedgerComment(newText);
    const updatedComment = {
      ...existing,
      text: newText.trim(),
      parsed,
      updatedAt: new Date().toISOString()
    };

    await dbSaveComment(updatedComment);
    setColumnComments(prev => prev.map(c => (c.id === id ? updatedComment : c)));
  };

  // 刪除留言記帳
  const handleDeleteComment = async (id) => {
    await dbDeleteComment(id);
    setColumnComments(prev => prev.filter(c => c.id !== id));
  };

  // 單張新增照片
  const handleAddImage = async (url, caption) => {
    if (!url || !selectedColumnId) return;
    const newImg = {
      id: `img-${Date.now()}`,
      columnId: selectedColumnId,
      url,
      caption: caption || '',
      createdAt: new Date().toISOString()
    };
    await dbSaveImage(newImg);
    setColumnImages(prev => [newImg, ...prev]);
    setIsImageModalOpen(false);
  };

  // 批量新增照片
  const handleAddImagesBatch = async (imagesList) => {
    if (!imagesList || imagesList.length === 0 || !selectedColumnId) return;
    
    const newImages = [];
    const now = Date.now();
    
    for (let i = 0; i < imagesList.length; i++) {
      const item = imagesList[i];
      const newImg = {
        id: `img-${now}-${i}`,
        columnId: selectedColumnId,
        url: item.url,
        caption: item.caption || '',
        createdAt: new Date(now - i * 100).toISOString()
      };
      await dbSaveImage(newImg);
      newImages.push(newImg);
    }

    setColumnImages(prev => [...newImages, ...prev]);
    setIsImageModalOpen(false);
  };

  // 單張刪除照片
  const handleDeleteImage = async (id) => {
    if (!window.confirm('確定要刪除這張展圖嗎？')) return;
    await dbDeleteImage(id);
    setColumnImages(prev => prev.filter(img => img.id !== id));
    if (lightboxImage?.id === id) setLightboxImage(null);
  };

  // ⭐ 批次一鍵刪除選取的照片 ⭐
  const handleDeleteImagesBatch = async (ids) => {
    if (!ids || ids.length === 0) return;
    if (!window.confirm(`確定要一次刪除已選取的 ${ids.length} 張展圖嗎？此動作無法復原！`)) return;
    await dbDeleteImagesBatch(ids);
    setColumnImages(prev => prev.filter(img => !ids.includes(img.id)));
    if (lightboxImage && ids.includes(lightboxImage.id)) setLightboxImage(null);
  };

  // ⭐ 一鍵清空目前專欄的所有展圖 ⭐
  const handleDeleteAllImages = async () => {
    if (!selectedColumnId || columnImages.length === 0) return;
    if (!window.confirm(`⚠️ 警告：確定要一鍵刪除此專欄中的所有 ${columnImages.length} 張展圖嗎？（留言記帳不會受到影響）`)) return;
    await dbDeleteAllImagesByColumn(selectedColumnId);
    setColumnImages([]);
    setLightboxImage(null);
  };

  // 計算當前專欄留言記帳的總計金額與總件數
  const columnTotalAmount = columnComments.reduce((sum, c) => sum + (c.parsed?.total || 0), 0);
  const columnTotalQty = columnComments.reduce((sum, c) => sum + (c.parsed?.qty || 0), 0);
  const columnLedgerItemsCount = columnComments.filter(c => c.parsed?.isLedger).length;

  const currentColumn = columns.find(c => c.id === selectedColumnId);

  return (
    <AppContext.Provider
      value={{
        columns,
        currentColumn,
        selectedColumnId,
        setSelectedColumnId,
        columnComments,
        columnImages,
        columnTotalAmount,
        columnTotalQty,
        columnLedgerItemsCount,
        
        // Modals
        isColumnModalOpen,
        setIsColumnModalOpen,
        isImageModalOpen,
        setIsImageModalOpen,
        editingColumn,
        setEditingColumn,
        lightboxImage,
        setLightboxImage,

        // Actions
        handleSaveColumn,
        handleDeleteColumn,
        handleResetData,
        handleAddComment,
        handleUpdateComment,
        handleDeleteComment,
        handleAddImage,
        handleAddImagesBatch,
        handleDeleteImage,
        handleDeleteImagesBatch,
        handleDeleteAllImages,
        refreshColumns
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
