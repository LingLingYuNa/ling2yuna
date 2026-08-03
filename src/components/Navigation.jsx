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
      <header className="sticky top-0 z-30 glass-panel border-b border-[#4c4993]/20 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setSelectedColumnId(null)}
          title="返回專欄總覽"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#4c4993] via-[#5b57a6] to-[#a1cdc4] p-0.5 shadow-xs">
            <div className="w-full h-full bg-[#f4f5f1] rounded-md flex items-center justify-center">
              <FolderHeart className="w-4 h-4 text-[#4c4993]" />
            </div>
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-tight text-[#4c4993] flex items-center gap-2">
              CollectTrack <span className="gradient-text-noguchi text-xs font-extrabold px-2 py-0.5 rounded-md bg-[#a1cdc4]/40 border border-[#a1cdc4] text-[#161348]">二次元專欄牆</span>
            </h1>
            <p className="text-[11px] text-[#4c4993] font-bold hidden sm:block">專屬主題展示牆 × 隨手留言記帳總計引擎</p>
          </div>
        </div>

        {/* 頂部動作區 (2R 俐落微圓角) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="bg-[#f4f5f1] hover:bg-white text-[#4c4993] font-black text-xs px-3 py-2 rounded-lg border border-[#4c4993]/30 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="跨設備多端同步與備份"
          >
            <Cloud className="w-4 h-4 text-[#4c4993]" />
            <span className="hidden sm:inline">跨設備同步</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn-noguchi-primary font-black text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
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
