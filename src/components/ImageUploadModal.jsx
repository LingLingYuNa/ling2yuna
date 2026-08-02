import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, Layers, Trash2 } from 'lucide-react';

export default function ImageUploadModal() {
  const { isImageModalOpen, setIsImageModalOpen, handleAddImagesBatch } = useApp();

  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [filePreviews, setFilePreviews] = useState([]); // 批次圖片檔
  const [caption, setCaption] = useState('');

  if (!isImageModalOpen) return null;

  // 處理多檔案批量選擇
  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const readPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: `batch-${Date.now()}-${Math.random()}`,
            url: reader.result,
            fileName: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newItems) => {
      setFilePreviews((prev) => [...prev, ...newItems]);
    });
  };

  // 移除批次中單張預覽圖
  const removePreview = (id) => {
    setFilePreviews((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'upload') {
      if (filePreviews.length === 0) return;
      const batchData = filePreviews.map((item) => ({
        url: item.url,
        caption: caption.trim()
      }));
      handleAddImagesBatch(batchData);
    } else {
      // 網址模式 (支援多行網址批次輸入)
      const lines = urlInput
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('http://') || line.startsWith('https://') || line.startsWith('data:image'));

      if (lines.length === 0) return;

      const batchData = lines.map((url) => ({
        url,
        caption: caption.trim()
      }));
      handleAddImagesBatch(batchData);
    }

    setUrlInput('');
    setFilePreviews([]);
    setCaption('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#4c4993]/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg bg-[#f4f5f1] border border-[#bfc9eb] rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#4c4993]" />
            <h3 className="font-black text-lg text-[#4c4993]">批量添加宣圖美圖</h3>
          </div>
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="text-[#4c4993]/60 hover:text-[#4c4993] p-1 rounded-lg hover:bg-[#bfc9eb]/30 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-[#bfc9eb]/30 p-1 rounded-xl my-4 border border-[#bfc9eb]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'upload' ? 'bg-[#4c4993] text-white shadow-xs' : 'text-[#4c4993]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            批量選擇檔案 (可複選)
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'url' ? 'bg-[#4c4993] text-white shadow-xs' : 'text-[#4c4993]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            批量輸入圖片網址
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {mode === 'upload' ? (
            <div>
              <label className="block text-xs font-black text-[#4c4993] mb-1.5">
                選擇宣圖美圖照片 (按住 Ctrl 或 Shift 可一次選取多張照片)
              </label>
              <div className="relative border-2 border-dashed border-[#bfc9eb] hover:border-[#4c4993] rounded-xl p-5 text-center bg-white transition cursor-pointer group mb-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleFilesChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1.5">
                  <ImageIcon className="w-8 h-8 text-[#4c4993]/50 mx-auto group-hover:text-[#4c4993] transition" />
                  <p className="text-xs text-[#4c4993] font-black">點擊選擇照片 (可一次選取多張檔)</p>
                  <p className="text-[10px] text-[#4c4993]/70 font-semibold">支援 JPG, PNG, WEBP 高畫質照片</p>
                </div>
              </div>

              {/* 批次圖片縮圖清單 */}
              {filePreviews.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#4c4993] font-black">
                    <span>已選擇 {filePreviews.length} 張照片：</span>
                    <button
                      type="button"
                      onClick={() => setFilePreviews([])}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      清空全部選取
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-2 bg-white rounded-xl border border-[#bfc9eb]">
                    {filePreviews.map((item) => (
                      <div key={item.id} className="relative group rounded-lg overflow-hidden border border-[#bfc9eb] aspect-square bg-[#f4f5f1]">
                        <img src={item.url} alt="縮圖" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(item.id)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition cursor-pointer"
                          title="移除此照片"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-black text-[#4c4993] mb-1">
                圖片網址 (一行一個圖片網址，可一次貼上多行)
              </label>
              <textarea
                rows={5}
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-xl p-3 text-xs text-[#4c4993] font-mono placeholder-[#4c4993]/40 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-[#4c4993] mb-1">照片統一說明 / 備註 (選填)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="例: 白厄宣圖特典圖鑑展示"
              className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-xl px-4 py-2 text-sm text-[#4c4993] font-bold placeholder-[#4c4993]/40 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="flex-1 bg-white hover:bg-[#bfc9eb]/30 text-[#4c4993] font-bold py-2.5 rounded-xl border border-[#bfc9eb] transition text-sm cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={mode === 'upload' ? filePreviews.length === 0 : !urlInput.trim()}
              className="flex-1 btn-noguchi-primary disabled:opacity-50 font-black py-2.5 rounded-xl transition text-sm cursor-pointer shadow-md"
            >
              一鍵批量加入專欄 ({mode === 'upload' ? filePreviews.length : urlInput.split('\n').filter(Boolean).length} 張)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
