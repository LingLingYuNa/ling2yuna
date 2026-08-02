import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, FolderHeart, Cloud } from 'lucide-react';
import SyncModal from './SyncModal';

export default function Navigation() {
  const { setIsColumnModalOpen, setEditingColumn, setSelectedColumnId } = useApp();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setEditingColumn(null);
    setIsColumnModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 glass-panel border-b border-[#4c4993]/20 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setSelectedColumnId(null)}
          title="返回專欄總覽"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4c4993] via-[#5b57a6] to-[#a1cdc4] p-0.5 shadow-md shadow-[#4c4993]/20">
            <div className="w-full h-full bg-[#f4f5f1] rounded-[10px] flex items-center justify-center">
              <FolderHeart className="w-5 h-5 text-[#4c4993]" />
            </div>
          </div>
          <div>
            <h1 className="font-black text-lg sm:text-xl tracking-tight text-[#4c4993] flex items-center gap-2">
              CollectTrack <span className="gradient-text-noguchi text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-[#a1cdc4]/30 border border-[#a1cdc4] text-[#161348]">二次元專欄牆</span>
            </h1>
            <p className="text-xs text-[#4c4993] font-bold hidden sm:block">專屬主題展示牆 × 隨手留言記帳總計引擎</p>
          </div>
        </div>

        {/* 頂部動作區 (跨設備同步按鈕 + 建立新專欄按鈕) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="bg-[#f4f5f1] hover:bg-white text-[#4c4993] font-black text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#4c4993]/30 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="跨設備多端同步與備份"
          >
            <Cloud className="w-4 h-4 text-[#4c4993]" />
            <span className="hidden sm:inline">跨設備同步</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn-noguchi-primary font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>建立新專欄</span>
          </button>
        </div>
      </header>

      {/* 跨設備同步 Modal */}
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
    </>
  );
}
