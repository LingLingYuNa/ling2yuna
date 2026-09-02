import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, FolderPlus, FolderCheck } from 'lucide-react';

export default function FolderModal({ isOpen, onClose, editingFolder = null }) {
  const { handleSaveFolder } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name || '');
      setDescription(editingFolder.description || '');
    } else {
      setName('');
      setDescription('');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c4993]/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg shadow-xl p-5 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            {editingFolder ? (
              <FolderCheck className="w-5 h-5 text-[#4c4993]" />
            ) : (
              <FolderPlus className="w-5 h-5 text-[#4c4993]" />
            )}
            <h3 className="font-black text-lg text-[#4c4993]">
              {editingFolder ? '編輯場次資料夾' : '新增場次資料夾'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#4c4993]/60 hover:text-[#4c4993] p-1 rounded hover:bg-[#bfc9eb]/30 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="備註活動日期、展覽地點或喊單注意事項..."
              className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-md px-3 py-2 text-xs font-medium text-[#161348] focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#bfc9eb]/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-[#4c4993] bg-[#f4f5f1] hover:bg-[#bfc9eb]/30 rounded-md border border-[#bfc9eb] transition cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-noguchi-primary text-xs font-black px-4 py-1.5 rounded-md transition shadow-xs cursor-pointer"
            >
              {editingFolder ? '儲存變更' : '建立場次'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
