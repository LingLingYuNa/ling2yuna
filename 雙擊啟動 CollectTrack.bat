@echo off
chcp 65001 > nul
title CollectTrack 專欄展示系統啟動器 (開放區網連線)
echo ========================================================
echo   CollectTrack 專欄展示與留言記帳系統 - 啟動中...
echo ========================================================
echo.
echo 區域網路開放連線 Port: 3001
echo 電腦本機訪問: http://localhost:3001
echo 手機區網訪問: http://192.168.0.157:3001/
echo.
start http://localhost:3001
echo.
echo 請勿關閉此視窗，關閉此視窗即關閉網站服務。
echo.
cd /d "d:\程式設計\宣圖圖鑑"
cmd /c npm run dev
pause
