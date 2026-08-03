import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ChevronLeft, ChevronRight, Trash2, Calendar, Tag, Sparkles } from 'lucide-react';

export default function LightboxModal() {
  const { lightboxImage, setLightboxImage, columnImages, handleDeleteImage } = useApp();

  if (!lightboxImage) return null;

  const currentIndex = columnImages.findIndex((img) => img.id === lightboxImage.id);

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setLightboxImage(columnImages[currentIndex - 1]);
    } else {
      setLightboxImage(columnImages[columnImages.length - 1]);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (currentIndex < columnImages.length - 1) {
      setLightboxImage(columnImages[currentIndex + 1]);
    } else {
      setLightboxImage(columnImages[0]);
    }
  };

  // 鍵盤左右方向鍵與 Esc 鍵導覽控制
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, columnImages]);

  return (
    <div
      onClick={() => setLightboxImage(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161348]/90 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[92vh] flex flex-col items-center justify-center bg-[#f4f5f1] border border-[#4c4993]/30 rounded-lg shadow-2xl p-4 overflow-hidden animate-scale-up"
      >
        {/* 頂部工具列 (2R 微圓角) */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#4c4993]/20 mb-3 text-[#4c4993]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black bg-[#4c4993] text-white px-2.5 py-0.5 rounded font-mono shadow-xs">
              {currentIndex + 1} / {columnImages.length}
            </span>
            <span className="text-xs font-bold text-[#161348] line-clamp-1 max-w-xs">
              {lightboxImage.caption || '全螢幕宣圖檢視'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDeleteImage(lightboxImage.id)}
              className="p-1.5 bg-[#f4f5f1] hover:bg-red-100 text-red-600 rounded border border-red-300 transition cursor-pointer"
              title="刪除此照片"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setLightboxImage(null)}
              className="p-1.5 bg-[#f4f5f1] hover:bg-[#bfc9eb]/40 text-[#4c4993] rounded border border-[#4c4993]/30 transition cursor-pointer"
              title="關閉 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 圖片展示區 (2R 導角) */}
        <div className="relative flex items-center justify-center w-full max-h-[70vh] overflow-hidden bg-[#161348] rounded border border-[#4c4993]/30 group">
          <img
            src={lightboxImage.url}
            alt={lightboxImage.caption || '專欄展圖'}
            className="max-w-full max-h-[70vh] object-contain rounded"
          />

          {/* 左右切換按鈕 */}
          {columnImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#f4f5f1]/90 hover:bg-white text-[#161348] p-2.5 rounded-full border border-[#4c4993]/40 shadow-lg transition opacity-80 hover:opacity-100 cursor-pointer"
                title="上一張 (← 鍵)"
              >
                <ChevronLeft className="w-5 h-5 text-[#161348]" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#f4f5f1]/90 hover:bg-white text-[#161348] p-2.5 rounded-full border border-[#4c4993]/40 shadow-lg transition opacity-80 hover:opacity-100 cursor-pointer"
                title="下一張 (→ 鍵)"
              >
                <ChevronRight className="w-5 h-5 text-[#161348]" />
              </button>
            </>
          )}
        </div>

        {/* 圖片下方資訊說明 */}
        <div className="w-full pt-3 flex items-center justify-between text-xs text-[#4c4993]">
          <p className="font-bold text-[#161348]">
            {lightboxImage.caption || '無圖說標註'}
          </p>
          <span className="text-[10px] font-mono text-[#4c4993]/70 font-semibold">
            可按鍵盤 ← / → 切換圖片，Esc 鍵離開
          </span>
        </div>
      </div>
    </div>
  );
}
