$wsh = New-Object -ComObject WScript.Shell
$desktop = $wsh.SpecialFolders('Desktop')
$sc = $wsh.CreateShortcut($desktop + '\CollectTrack 專欄展示系統.lnk')
$sc.TargetPath = 'd:\程式設計\宣圖圖鑑\啟動 CollectTrack 專欄系統.vbs'
$sc.WorkingDirectory = 'd:\程式設計\宣圖圖鑑'
$sc.Description = 'CollectTrack 專欄展示與留言記帳系統'
$sc.Save()
Write-Host "Desktop shortcut created successfully!"
