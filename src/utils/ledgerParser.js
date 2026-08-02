/**
 * 智慧留言記帳解析器 (Ledger Parser)
 * 能夠從使用者隨手打的留言中自動解析出：品項名稱、數量、單價與總計金額。
 * 
 * 支援格式範例：
 * - "白厄小卡*1=$60" => name: "白厄小卡", qty: 1, price: 60, total: 60
 * - "白厄小卡 x2 = 120" => name: "白厄小卡", qty: 2, price: 60, total: 120
 * - "咒術徽章 3件 450" => name: "咒術徽章", qty: 3, price: 150, total: 450
 * - "立牌 $350" => name: "立牌", qty: 1, price: 350, total: 350
 * - "購入 初音公仔 1200元" => name: "購入 初音公仔", qty: 1, price: 1200, total: 1200
 */

export function parseLedgerComment(text) {
  if (!text || typeof text !== 'string') {
    return { isLedger: false, name: '', qty: 1, total: 0, price: 0 };
  }

  const str = text.trim();
  
  // 模式 1: 品項 * 數量 = $金額 (例如: 白厄小卡*1=$60, 白厄小卡x2=120)
  const matchMultiply = str.match(/^(.+?)\s*[*xX×]\s*(\d+)\s*=\s*[$NT\$]?\s*(\d+(\.\d+)?)/);
  if (matchMultiply) {
    const name = matchMultiply[1].trim();
    const qty = parseInt(matchMultiply[2], 10) || 1;
    const total = parseFloat(matchMultiply[3]) || 0;
    const price = qty > 0 ? Math.round((total / qty) * 100) / 100 : total;
    return {
      isLedger: true,
      name,
      qty,
      total,
      price,
      raw: str
    };
  }

  // 模式 2: 品項 數量件/個 金額 (例如: 白厄小卡 1件 60元)
  const matchQtyUnit = str.match(/^(.+?)\s+(\d+)\s*(?:件|個|張|組|入)?\s*[$NT\$]?\s*(\d+(\.\d+)?)\s*(?:元|TWD)?$/i);
  if (matchQtyUnit) {
    const name = matchQtyUnit[1].trim();
    const qty = parseInt(matchQtyUnit[2], 10) || 1;
    const total = parseFloat(matchQtyUnit[3]) || 0;
    const price = qty > 0 ? Math.round((total / qty) * 100) / 100 : total;
    return {
      isLedger: true,
      name,
      qty,
      total,
      price,
      raw: str
    };
  }

  // 模式 3: 品項 $金額 (例如: 立牌 $350, 徽章 150)
  const matchSimple = str.match(/^(.+?)\s*[$NT\$]?\s*(\d+(\.\d+)?)\s*(?:元|TWD)?$/i);
  if (matchSimple) {
    const name = matchSimple[1].trim();
    const total = parseFloat(matchSimple[2]) || 0;
    return {
      isLedger: true,
      name,
      qty: 1,
      total,
      price: total,
      raw: str
    };
  }

  // 非特定格式，但可能含有金額數字
  const anyMoneyMatch = str.match(/[$NT\$]?\s*(\d+)\s*(?:元|TWD)/i);
  if (anyMoneyMatch) {
    const total = parseFloat(anyMoneyMatch[1]);
    return {
      isLedger: true,
      name: str.replace(anyMoneyMatch[0], '').trim() || str,
      qty: 1,
      total,
      price: total,
      raw: str
    };
  }

  return {
    isLedger: false,
    name: str,
    qty: 1,
    total: 0,
    price: 0,
    raw: str
  };
}
