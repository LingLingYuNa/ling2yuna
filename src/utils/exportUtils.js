import * as XLSX from 'xlsx';

// 1. 將單一專欄名稱與留言格式化為排版文字 (.txt)
export function generateColumnTextReport(column, comments = []) {
  if (!column) return '';

  const totalAmount = comments.reduce((sum, c) => sum + (c.parsed?.total || 0), 0);
  const totalQty = comments.reduce((sum, c) => sum + (c.parsed?.qty || 0), 0);

  let text = `========================================\n`;
  text += `【專欄名稱】：${column.title || '未命名專欄'}\n`;
  text += `【專欄分類】：${column.category || '未分類'}\n`;
  if (column.tags && column.tags.length > 0) {
    text += `【智慧標籤】：#${column.tags.join(' #')}\n`;
  }
  if (column.description) {
    text += `【專欄簡介】：${column.description}\n`;
  }
  text += `【統計總花費】：NT$ ${totalAmount.toLocaleString()} (共 ${comments.length} 則留言, ${totalQty} 件品項)\n`;
  text += `----------------------------------------\n`;
  text += `【留言與記帳紀錄列表】:\n\n`;

  if (comments.length === 0) {
    text += `(尚無留言紀錄)\n`;
  } else {
    comments.forEach((cmt, idx) => {
      const timeStr = new Date(cmt.createdAt || Date.now()).toLocaleString('zh-TW');
      text += `[${idx + 1}] (${timeStr}) ${cmt.author || 'LingLing_YuNa'}:\n`;
      text += `${cmt.text}\n`;
      if (cmt.parsed && cmt.parsed.isLedger) {
        text += `  └─ 💰 解析試算: NT$ ${cmt.parsed.total.toLocaleString()} (${cmt.parsed.qty} 件)\n`;
      }
      text += `\n`;
    });
  }

  text += `========================================\n`;
  return text;
}

// 2. 將所有專欄與留言格式化為完整排版文字 (.txt)
export function generateAllColumnsTextReport(columns = [], commentsMap = {}) {
  let text = `========================================\n`;
  text += `   CollectTrack 專欄名稱與留言總匯報告\n`;
  text += `   匯出時間：${new Date().toLocaleString('zh-TW')}\n`;
  text += `========================================\n\n`;

  columns.forEach((col, idx) => {
    const cmts = commentsMap[col.id] || [];
    text += generateColumnTextReport(col, cmts);
    text += `\n\n`;
  });

  return text;
}

// 3. 下載純文字檔案 (.txt)
export function downloadTextFile(filename, textContent) {
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 4. 將專欄名稱與內部留言導出為 Excel (.xlsx) 工作表
export function exportCommentsToExcel(filename, columns = [], commentsMap = {}) {
  const excelData = [];

  columns.forEach((col) => {
    const cmts = commentsMap[col.id] || [];
    if (cmts.length === 0) {
      excelData.push({
        '專欄名稱': col.title || '',
        '專欄分類': col.category || '',
        '專欄簡介': col.description || '',
        '留言時間': '',
        '發言者': '',
        '留言內容': '(尚無留言)',
        '解析金額(NT$)': 0,
        '解析數量(件)': 0,
        '買家ID/標籤': ''
      });
    } else {
      cmts.forEach((cmt) => {
        excelData.push({
          '專欄名稱': col.title || '',
          '專欄分類': col.category || '',
          '專欄簡介': col.description || '',
          '留言時間': new Date(cmt.createdAt || Date.now()).toLocaleString('zh-TW'),
          '發言者': cmt.author || 'LingLing_YuNa',
          '留言內容': cmt.text || '',
          '解析金額(NT$)': cmt.parsed?.total || 0,
          '解析數量(件)': cmt.parsed?.qty || 0,
          '買家ID/標籤': cmt.parsed?.buyerId || ''
        });
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '專欄與留言列表');
  XLSX.writeFile(workbook, filename);
}
