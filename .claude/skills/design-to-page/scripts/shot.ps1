# Screenshot a local HTML mock with headless Edge/Chrome (compare against the design PNG at the same width).
# Mocks: static HTML with the section's rendered markup + <link> to the real theme CSS (file:///<repo>/assets/*.css).
# Usage: powershell -File shot.ps1 -Html "<scratchpad>/mock/promo.html" -Out "<scratchpad>/mock/promo.png" -Width 1440 -Height 900
param(
  [Parameter(Mandatory)][string]$Html,
  [Parameter(Mandatory)][string]$Out,
  [int]$Width = 1440,
  [int]$Height = 900
)
$browser = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'No Edge/Chrome found' }
$htmlPath = (Resolve-Path -LiteralPath $Html).Path
$outPath = [System.IO.Path]::GetFullPath($Out)
$profile = Join-Path ([System.IO.Path]::GetDirectoryName($outPath)) '.shot-profile'
$url = 'file:///' + ($htmlPath -replace '\\', '/')
# PowerShell 5.1 does not quote array arguments containing spaces → build one quoted command line.
$argLine = @(
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  "--user-data-dir=$profile", "--window-size=$Width,$Height", "--screenshot=$outPath", $url
) | ForEach-Object { '"' + $_ + '"' }
if (Test-Path $outPath) { Remove-Item $outPath }
Start-Process -FilePath $browser -Wait -WindowStyle Hidden -ArgumentList ($argLine -join ' ')
if (Test-Path $outPath) { "saved $outPath" } else { throw "screenshot failed: $outPath" }
