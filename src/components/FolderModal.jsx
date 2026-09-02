import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, FolderPlus, FolderCheck, ArrowRightLeft, Folder, Check, AlertCircle } from 'lucide-react';

export default function FolderModal({ isOpen, onClose, editingFolder = null }) {
  const { folders, columns, handleSaveFolder, handleMoveAllColumnsBetweenFolders, handleSaveColumn } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetFolderId, setTargetFolderId] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  // 當前編輯的資料夾內包含的所有專欄
  const folderColumns = editingFolder
    ? columns.filter(c => c.folderId === editingFolder.id)
    : [];

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name || '');
      setDescription(editingFolder.description || '');
      setTargetFolderId('');
      setTransferSuccess(false);
    } else {
      setName('');
      setDescription('');
      setTargetFolderId('');
      setTransferSuccess(false);
    }
  }, [editingFolder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    handleSaveFolder({
      id: editingFolder?.id,
      name: name.trim(),
      description: description.trim(),
      createdAt: editingFolder?.createdAt
    });

    onClose();
  };

  // 處理批量轉移所有專欄至另一個資料夾
  const handleBulkTransfer = async () => {
    if (!editingFolder) return;
    if (folderColumns.length === 0) {
      alert('此資料夾內沒有專欄可供轉移！');
      return;
    }
    
    const targetName = targetFolderId === 'NONE'
      ? '未分類'
      : folders.find(f => f.id === targetFolderId)?.name || '未分類';

    if (!window.confirm(`確定要將【${editingFolder.name}】內的全部 ${folderColumns.length} 個專欄，一鍵轉移至【${targetName}】嗎？`)) {
      return;
    }

    await handleMoveAllColumnsBetweenFolders(editingFolder.id, targetFolderId);
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 3000);
  };

  // ⭐ 將單個專欄精準移出場次資料夾 ⭐
  const handleRemoveSingleColumnFromFolder = async (columnObj) => {
    await handleSaveColumn({
      id: columnObj.id,
      title: columnObj.title,
      description: columnObj.description,
      category: columnObj.category,
      coverImage: columnObj.coverImage,
      tags: columnObj.tags,
      isFavorite: columnObj.isFavorite,
      createdAt: columnObj.createdAt,
      folderId: null // 顯式賦予 null 解除場次歸類
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c4993]/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg shadow-xl p-5 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            {editingFolder ? (
              <FolderCheck className="w-5 h-5 text-[#4c4993]" />
            ) : (
              <FolderPlus className="w-5 h-5 text-[#4c4993]" />
            )}
            <h3 className="font-black text-lg text-[#4c4993]">
              {editingFolder ? `編輯場次資料夾：${editingFolder.name}` : '新增場次資料夾'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#4c4993]/60 hover:text-[#4c4993] p-1 rounded hover:bg-[#bfc9eb]/30 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="pt-4 space-y-5 overflow-y-auto pr-1">
          {/* 基本資料編輯 Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black text-[#4c4993] mb-1">
                場次 / 資料夾名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: CWT-73 首日, FF42, 日常喊單..."
                className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-md px-3 py-2 text-xs font-bold text-[#161348] focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#4c4993] mb-1">
                場次簡介 / 備註
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="備註活動日期、展覽地點或喊單注意事項..."
                className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-md px-3 py-2 text-xs font-medium text-[#161348] focus:outline-none shadow-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-bold text-[#4c4993] bg-[#f4f5f1] hover:bg-[#bfc9eb]/30 rounded-md border border-[#bfc9eb] transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="btn-noguchi-primary text-xs font-black px-4 py-1.5 rounded-md transition shadow-xs cursor-pointer"
              >
                {editingFolder ? '儲存名稱變更' : '建立場次'}
              </button>
            </div>
          </form>

          {/* 一鍵將全部專欄歸納轉移至其他資料夾 */}
          {editingFolder && (
            <div className="pt-4 border-t border-[#4c4993]/20 space-y-3">
              <div className="flex items-center space-x-1.5">
                <ArrowRightLeft className="w-4 h-4 text-[#4c4993]" />
                <h4 className="text-xs font-black text-[#4c4993]">
                  一鍵批量歸納 / 轉移全區專欄
                </h4>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#bfc9eb] space-y-2.5 shadow-xs">
                <div className="text-[11px] text-[#4c4993] font-bold">
                  目前資料夾內共有 <strong className="text-[#161348] font-black">{folderColumns.length}</strong> 個專欄。選擇要將所有專欄移動到的目標資料夾：
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={targetFolderId}
                    onChange={(e) => setTargetFolderId(e.target.value)}
                    className="flex-1 bg-[#f4f5f1] border border-[#bfc9eb] focus:border-[#4c4993] rounded-md px-2.5 py-1.5 text-xs font-bold text-[#161348] focus:outline-none"
                  >
                    <option value="">-- 請選擇目標場次 / 資料夾 --</option>
                    <option value="NONE">📂 移至「未分類專欄」</option>
                    {folders
                      .filter(f => f.id !== editingFolder.id)
                      .map(f => (
                        <option key={f.id} value={f.id}>
                          📁 歸納至【{f.name}】
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleBulkTransfer}
                    disabled={!targetFolderId || folderColumns.length === 0}
                    className="bg-[#a1cdc4] hover:bg-[#8ebfb5] disabled:opacity-50 text-[#161348] font-black text-xs px-3 py-1.5 rounded-md transition shadow-xs cursor-pointer shrink-0"
                  >
                    一鍵轉移
                  </button>
                </div>

                {transferSuccess && (
                  <div className="text-[11px] font-black text-green-700 bg-green-50 p-2 rounded border border-green-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>全區專欄已成功批量歸納轉移！</span>
                  </div>
                )}
              </div>

              {/* 資料夾內部專欄清單速覽 */}
              {folderColumns.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-black text-[#4c4993] flex items-center justify-between">
                    <span>內部專欄明細 ({folderColumns.length})</span>
                    <span className="text-[10px] text-[#4c4993]/70 font-semibold">點擊右側按鈕單獨移出</span>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 bg-white p-2 rounded-lg border border-[#bfc9eb]">
                    {folderColumns.map((col) => (
                      <div key={col.id} className="flex items-center justify-between text-xs py-1 px-2 hover:bg-[#f4f5f1] rounded font-bold text-[#161348]">
                        <span className="truncate max-w-[240px]">{col.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleColumnFromFolder(col)}
                          className="text-[10px] text-[#e11d48] hover:underline font-extrabold cursor-pointer shrink-0 border border-[#e11d48]/30 px-2 py-0.5 rounded bg-red-50"
                        >
                          移出場次
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
