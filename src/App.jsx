import React from 'react';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import ColumnModal from './components/ColumnModal';
import ImageUploadModal from './components/ImageUploadModal';
import LightboxModal from './components/LightboxModal';
import ColumnsView from './views/ColumnsView';

function MainContent() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      <ColumnsView />
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-transparent text-[#4c4993] font-sans selection:bg-[#4c4993] selection:text-white">
        <Navigation />
        <MainContent />

        {/* 全局 Modals */}
        <ColumnModal />
        <ImageUploadModal />
        <LightboxModal />
      </div>
    </AppProvider>
  );
}
