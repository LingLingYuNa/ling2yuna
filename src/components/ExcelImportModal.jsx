import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, FileSpreadsheet, Download, Upload, Check, AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExcelImportModal({ isOpen, onClose }) {
  const { handleSaveColumn, handleDeleteTodayExcelColumns, refreshColumns } = useApp();

  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  // 下載標準 Excel 匯入範本檔
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '專欄名稱': '白厄主題宣圖專欄',
        '專欄分類': '宣圖',
        '專欄簡介': '收錄 2026 年最新白厄主題各類特典宣圖與插畫展示',
        '標籤': '宣圖, 特典, 2026',
        '封面圖片網址': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600'
      },
      {
        '專欄名稱': 'LingLing 痛包擺設圖鑑',
        '專欄分類': '痛包展示',
        '專欄簡介': '個人痛包擺設搭配與徽章排列專欄',
        '標籤': '痛包, 徽章, 痛板',
        '封面圖片網址': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 40 },
      { wch: 20 },
      { wch: 45 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '專欄匯入範本');
    XLSX.writeFile(workbook, 'CollectTrack_專欄匯入範本.xlsx');
  };

  // 讀取並解析 Excel / CSV 檔案
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          setErrorMsg('上傳的 Excel 檔案中沒有找到資料列');
          setParsedRows([]);
          return;
        }

        const mappedData = json.map((row, index) => {
          const title = row['專欄名稱'] || row['title'] || row['Title'] || `匯入專欄 ${index + 1}`;
          const category = row['專欄分類'] || row['category'] || row['Category'] || '宣圖';
          const description = row['專欄簡介'] || row['description'] || row['Description'] || '';
          const rawTags = row['標籤'] || row['tags'] || row['Tags'] || '';
          const coverImage = row['封面圖片網址'] || row['coverImage'] || row['CoverImage'] || '';

          const tags = typeof rawTags === 'string'
            ? rawTags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
            : Array.isArray(rawTags) ? rawTags : [];

          return {
            title: String(title).trim(),
            category: String(category).trim(),
            description: String(description).trim(),
            tags,
            coverImage: String(coverImage).trim()
          };
        });

        setParsedRows(mappedData);
      } catch (err) {
        console.error(err);
        setErrorMsg('解析 Excel 檔案失敗，請確保檔案格式正確 (.xlsx, .xls, .csv)');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 執行批量匯入
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      const now = new Date().toISOString();
      for (let idx = 0; idx < parsedRows.length; idx++) {
        const row = parsedRows[idx];
        await handleSaveColumn({
          id: `col-excel-${Date.now()}-${idx}`,
          title: row.title,
          category: row.category || '宣圖',
          description: row.description,
          tags: row.tags,
          coverImage: row.coverImage,
          createdAt: now
        });
      }

      await refreshColumns();
      setIsImporting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('匯入過程發生錯誤：' + err.message);
      setIsImporting(false);
    }
  };

  // 執行刪除今日匯入的專欄
  const handleCleanTodayImported = async () => {
    await handleDeleteTodayExcelColumns();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c4993]/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#f4f5f1] border border-[#bfc9eb] rounded-lg shadow-xl p-5 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#bfc9eb]/50">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-[#4c4993]" />
            <h3 className="font-extrabold text-base text-[#4c4993]">Excel 批量匯入新專欄</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#4c4993]/60 hover:text-[#4c4993] p-1 rounded hover:bg-[#bfc9eb]/30 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 pt-3.5 overflow-y-auto pr-1 flex-1">
          {/* ⭐ 快捷一鍵刪除今日/Excel匯入專欄區塊 ⭐ */}
          <div className="bg-[#161348] text-white p-3 rounded-lg flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-xs font-black">誤匯入或想清理今天匯入的專欄？</span>
            </div>
            <button
              type="button"
              onClick={handleCleanTodayImported}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3 py-1.5 rounded-md transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>刪除今天匯入的專欄</span>
            </button>
          </div>

          {/* 步驟指引與下載範本按鈕 */}
          <div className="bg-white p-3.5 rounded-lg border border-[#bfc9eb] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black text-[#4c4993] block mb-0.5">
                步驟 1: 下載 Excel 匯入範本
              </span>
              <p className="text-[11px] text-[#4c4993]/80 font-medium">
                填寫包含「專欄名稱、分類、簡介、標籤、封面網址」的試算表
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="bg-[#a1cdc4] hover:bg-[#8ebfb5] text-[#161348] font-black text-xs px-3.5 py-2 rounded-lg border border-[#a1cdc4] transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#161348]" />
              <span>下載 Excel 範本 (.xlsx)</span>
            </button>
          </div>

          {/* 上傳 Excel 區域 */}
          <div className="relative border-2 border-dashed border-[#bfc9eb] hover:border-[#4c4993] rounded-lg p-5 text-center bg-white transition cursor-pointer group">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-[#4c4993]/50 mx-auto mb-1.5 group-hover:scale-110 transition" />
            <p className="text-xs font-black text-[#4c4993]">
              {fileName ? `已選取檔案: ${fileName}` : '點擊或將 Excel 檔案拖曳至此處上傳'}
            </p>
            <p className="text-[10px] font-semibold text-[#4c4993]/70 mt-0.5">
              支援 .xlsx, .xls, .csv 檔案格式
            </p>
          </div>

          {/* 錯誤訊息提示 */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 數據即時預覽表格 */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#4c4993] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#4c4993]" />
                  資料預覽 (共 {parsedRows.length} 筆專欄資料待匯入)：
                </span>
              </div>

              <div className="overflow-x-auto border border-[#bfc9eb] rounded-lg bg-white max-h-48">
                <table className="w-full text-left text-xs text-[#4c4993]">
                  <thead className="bg-[#f4f5f1] border-b border-[#bfc9eb] text-[11px] font-black uppercase text-[#4c4993]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">專欄名稱</th>
                      <th className="p-2.5">分類</th>
                      <th className="p-2.5">簡介</th>
                      <th className="p-2.5">標籤</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#bfc9eb]/50 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f4f5f1]/50">
                        <td className="p-2.5 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-black text-[#161348]">{row.title}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-[#a1cdc4]/40 text-[#161348] font-bold text-[10px]">
                            {row.category}
                          </span>
                        </td>
                        <td className="p-2.5 max-w-xs truncate">{row.description || '無'}</td>
                        <td className="p-2.5">
                          {row.tags.length > 0 ? row.tags.join(', ') : '無'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-2 border-t border-[#bfc9eb]/50 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white hover:bg-[#bfc9eb]/30 text-[#4c4993] font-bold py-2 rounded-lg border border-[#bfc9eb] transition text-xs cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isImporting}
            onClick={handleConfirmImport}
            className="flex-1 btn-noguchi-primary disabled:opacity-50 font-bold py-2 rounded-lg transition text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isImporting ? '匯入中...' : `確認匯入 ${parsedRows.length} 個專欄`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
