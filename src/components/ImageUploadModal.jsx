import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Image as ImageIcon, Plus, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';

export default function ImageUploadModal() {
  const { isImageModalOpen, setIsImageModalOpen, handleAddImagesBatch } = useApp();

  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'url'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [urlBatchInput, setUrlBatchInput] = useState('');
  const [globalCaption, setGlobalCaption] = useState('');

  if (!isImageModalOpen) return null;

  // 處理選取多個本地檔案
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            url: reader.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((results) => {
      setSelectedFiles((prev) => [...prev, ...results]);
    });
  };

  // 移除預覽檔案
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 提交批量圖片
  const handleSubmit = (e) => {
    e.preventDefault();
    const batchData = [];

    if (activeTab === 'file') {
      if (selectedFiles.length === 0) return;
      selectedFiles.forEach((f) => {
        batchData.push({
          url: f.url,
          caption: globalCaption.trim()
        });
      });
    } else {
      const urls = urlBatchInput
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);
      if (urls.length === 0) return;

      urls.forEach((u) => {
        batchData.push({
          url: u,
          caption: globalCaption.trim()
        });
      });
    }

    handleAddImagesBatch(batchData);
    // 重置
    setSelectedFiles([]);
    setUrlBatchInput('');
    setGlobalCaption('');
    setIsImageModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c4993]/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg shadow-xl p-5 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-[#4c4993]" />
            <h3 className="font-extrabold text-base text-[#4c4993]">批量新增專欄美圖</h3>
          </div>
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="text-[#4c4993]/60 hover:text-[#4c4993] p-1 rounded hover:bg-[#bfc9eb]/30 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 頁籤切換 (2R 微圓角) */}
        <div className="flex bg-[#bfc9eb]/30 p-1 rounded-lg border border-[#bfc9eb] my-3">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-1.5 text-xs font-black rounded cursor-pointer transition flex items-center justify-center gap-1.5 ${
              activeTab === 'file' ? 'bg-[#4c4993] text-white shadow-xs' : 'text-[#4c4993] hover:text-[#161348]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>選取本地照片檔 (可多選)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 text-xs font-black rounded cursor-pointer transition flex items-center justify-center gap-1.5 ${
              activeTab === 'url' ? 'bg-[#4c4993] text-white shadow-xs' : 'text-[#4c4993] hover:text-[#161348]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>貼上圖片網址 (可多行)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto pr-1 flex-1">
          {activeTab === 'file' ? (
            <div className="space-y-3">
              {/* 檔案上傳觸發區 (2R 導角) */}
              <div className="relative border-2 border-dashed border-[#bfc9eb] hover:border-[#4c4993] rounded-lg p-5 text-center bg-white transition cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-[#4c4993]/50 mx-auto mb-1.5 group-hover:scale-110 transition" />
                <p className="text-xs font-black text-[#4c4993]">點擊或將照片拖曳至此處上傳</p>
                <p className="text-[10px] font-semibold text-[#4c4993]/70 mt-0.5">支援一次選擇多張 JPG, PNG, WEBP 高畫質照片</p>
              </div>

              {/* 已選檔案網格預覽 */}
              {selectedFiles.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#4c4993] block mb-1">
                    已選取 {selectedFiles.length} 張美圖照片：
                  </span>
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-lg border border-[#bfc9eb]">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative group rounded overflow-hidden aspect-square border border-[#bfc9eb]">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded opacity-80 group-hover:opacity-100 transition cursor-pointer"
                          title="移除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-extrabold text-[#4c4993] mb-1">
                貼上圖片網址 (每行一張圖片網址)
              </label>
              <textarea
                rows={5}
                value={urlBatchInput}
                onChange={(e) => setUrlBatchInput(e.target.value)}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-lg p-2.5 text-xs text-[#4c4993] font-mono placeholder-[#4c4993]/40 focus:outline-none resize-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-[#4c4993] mb-1">圖片統一說明 / 註記 (選填)</label>
            <input
              type="text"
              value={globalCaption}
              onChange={(e) => setGlobalCaption(e.target.value)}
              placeholder="例如: 2026年特典圖卡、白厄立牌展示"
              className="w-full bg-white border border-[#bfc9eb] focus:border-[#4c4993] rounded-lg px-3 py-2 text-xs text-[#4c4993] font-medium placeholder-[#4c4993]/40 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              className="flex-1 bg-white hover:bg-[#bfc9eb]/30 text-[#4c4993] font-bold py-2 rounded-lg border border-[#bfc9eb] transition text-xs cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={activeTab === 'file' ? selectedFiles.length === 0 : !urlBatchInput.trim()}
              className="flex-1 btn-noguchi-primary disabled:opacity-50 font-bold py-2 rounded-lg transition text-xs cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>確認上傳照片</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
