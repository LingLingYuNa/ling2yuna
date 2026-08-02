import React, { useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LightboxModal() {
  const { lightboxImage, setLightboxImage, handleDeleteImage, columnImages } = useApp();

  const currentIndex = columnImages.findIndex(img => img.id === lightboxImage?.id);
  const totalCount = columnImages.length;

  const handlePrev = useCallback(() => {
    if (totalCount === 0 || currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + totalCount) % totalCount;
    setLightboxImage(columnImages[prevIndex]);
  }, [currentIndex, totalCount, columnImages, setLightboxImage]);

  const handleNext = useCallback(() => {
    if (totalCount === 0 || currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % totalCount;
    setLightboxImage(columnImages[nextIndex]);
  }, [currentIndex, totalCount, columnImages, setLightboxImage]);

  // 鍵盤方向鍵 (Left / Right Arrow & Esc) 監聽
  useEffect(() => {
    if (!lightboxImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxImage, handlePrev, handleNext, setLightboxImage]);

  if (!lightboxImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161348]/95 backdrop-blur-md p-4 animate-fade-in">
      {/* 頂部動作區 (頁碼標示 + 關閉) */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-[#4c4993]/80 border border-white/20 text-white font-mono text-xs font-black shadow-md pointer-events-auto">
          {currentIndex !== -1 ? `${currentIndex + 1} / ${totalCount}` : ''}
        </div>
        <button
          onClick={() => setLightboxImage(null)}
          className="text-white hover:text-pink-300 p-2.5 rounded-full bg-[#4c4993]/80 border border-white/20 hover:bg-[#4c4993] transition cursor-pointer shadow-md pointer-events-auto"
          title="關閉 (Esc)"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* 鍵盤方向鍵導覽左右切換按鈕 (顯示在圖片兩側) */}
      {totalCount > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#4c4993]/80 hover:bg-[#4c4993] text-white border border-white/30 transition shadow-xl cursor-pointer hover:scale-110"
            title="上一張 (鍵盤 ← 鍵)"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#4c4993]/80 hover:bg-[#4c4993] text-white border border-white/30 transition shadow-xl cursor-pointer hover:scale-110"
            title="下一張 (鍵盤 → 鍵)"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      <div className="max-w-4xl w-full flex flex-col items-center max-h-[90vh]">
        {/* 大圖主體 */}
        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-slate-900 shadow-2xl max-h-[75vh] flex items-center justify-center">
          <img
            src={lightboxImage.url}
            alt={lightboxImage.caption || '專欄大圖展示'}
            className="max-h-[75vh] w-auto object-contain rounded-2xl"
          />
        </div>

        {/* 底部說明與動作 */}
        <div className="mt-4 w-full bg-[#f4f5f1] border border-[#bfc9eb] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#4c4993] shadow-lg">
          <div>
            <p className="font-extrabold text-sm sm:text-base text-[#161348]">
              {lightboxImage.caption || '無照片說明'}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#4c4993] font-bold mt-1">
              <Calendar className="w-3.5 h-3.5 text-[#4c4993]" />
              <span>上傳於 {new Date(lightboxImage.createdAt).toLocaleDateString('zh-TW')}</span>
              <span className="ml-2 text-[10px] text-[#4c4993]/70">提示: 可按鍵盤 ← / → 切換照片，按 Esc 關閉</span>
            </div>
          </div>

          <button
            onClick={() => handleDeleteImage(lightboxImage.id)}
            className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 px-4 py-2 rounded-xl transition text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>刪除此照片</span>
          </button>
        </div>
      </div>
    </div>
  );
}
