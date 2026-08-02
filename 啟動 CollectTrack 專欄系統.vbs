Set WshShell = CreateObject("WScript.Shell")
' 切換至專案目錄並在背景啟動 Vite 開發伺服器 (開放 0.0.0.0:3001 區網連線)
WshShell.Run "cmd /c cd /d ""d:\程式設計\宣圖圖鑑"" && npm run dev", 0, False
' 等待 1.5 秒讓伺服器啟動完成
WScript.Sleep 1500
' 自動開啟預設瀏覽器造訪 localhost:3001 (手機可打 http://192.168.0.157:3001/)
WshShell.Run "http://localhost:3001"
