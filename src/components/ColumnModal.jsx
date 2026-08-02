import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function ColumnModal() {
  const { isColumnModalOpen, setIsColumnModalOpen, editingColumn, handleSaveColumn } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('宣圖');
  const [coverImage, setCoverImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (editingColumn) {
      setTitle(editingColumn.title || '');
      setDescription(editingColumn.description || '');
      setCategory(editingColumn.category || '宣圖');
      setCoverImage(editingColumn.coverImage || '');
      setTagsInput((editingColumn.tags || []).join(', '));
    } else {
      setTitle('');
      setDescription('');
      setCategory('宣圖');
      setCoverImage('');
      setTagsInput('');
    }
  }, [editingColumn, isColumnModalOpen]);

  if (!isColumnModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean);

    handleSaveColumn({
      id: editingColumn?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      coverImage: coverImage.trim(),
      tags,
      createdAt: editingColumn?.createdAt
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#4c4993]/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg bg-[#f4f5f1] border border-[#bfc9eb] rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#4c4993]" />
            <h3 className="font-extrabold text-lg text-[#4c4993]">
              {editingColumn ? '編輯展示專欄' : '建立全新二次元展示專欄'}
            </h3>
          </div>
          <button
            onClick={() => setIsColumnModalOpen(false)}
            className="text-[#4c4993]/60 hover:text-[#4c4993] p-1 rounded-lg hover:bg-[#bfc9eb]/30 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-extrabold text-[#4c4993] mb-1">專欄名稱 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入專欄名稱..."
              className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-xl px-4 py-2.5 text-sm text-[#4c4993] placeholder-[#4c4993]/40 font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-[#4c4993] mb-1">專欄分類</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-xl px-3 py-2.5 text-sm text-[#4c4993] font-medium focus:outline-none"
              >
                <option value="宣圖">宣圖</option>
                <option value="角色專區">角色專區</option>
                <option value="痛包展示">痛包展示</option>
                <option value="祭壇擺設">祭壇擺設</option>
                <option value="開箱圖鑑">開箱圖鑑</option>
                <option value="週邊收藏">週邊收藏</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#4c4993] mb-1">標籤 (選填，逗號分隔)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="例如: 宣圖, 特典"
                className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-xl px-3 py-2.5 text-sm text-[#4c4993] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#4c4993] mb-1">封面圖片網址 (選填)</label>
            <div className="relative">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#4c4993] font-medium placeholder-[#4c4993]/40 focus:outline-none"
              />
              <ImageIcon className="w-4 h-4 text-[#4c4993]/50 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#4c4993] mb-1">專欄簡介 / 描述 (選填)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="記載這個專欄主題的簡介說明..."
              className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-xl p-3 text-sm text-[#4c4993] font-medium placeholder-[#4c4993]/40 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsColumnModalOpen(false)}
              className="flex-1 bg-white hover:bg-[#bfc9eb]/30 text-[#4c4993] font-bold py-2.5 rounded-xl border border-[#bfc9eb] transition text-sm cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 btn-noguchi-primary font-bold py-2.5 rounded-xl transition text-sm cursor-pointer"
            >
              儲存專欄
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
