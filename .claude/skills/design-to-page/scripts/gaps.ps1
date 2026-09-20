# Vertical whitespace runs in a design PNG: rows where nothing is drawn across the content band.
# Gives the real gap between two sections (prev padding_bottom + next padding_top).
# Usage: powershell -ExecutionPolicy Bypass -File gaps.ps1 -Src "<png>" -From 1000 -To 8600 [-X1 80 -X2 1360 -Threshold 26 -Min 24]
param(
  [Parameter(Mandatory)][string]$Src,
  [int]$From = 0,
  [int]$To = -1,
  [int]$X1 = 80,
  [int]$X2 = 1360,
  [int]$Threshold = 26,
  [int]$Min = 24
)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $Src).Path)
try {
  if ($To -lt 0) { $To = $img.Height - 1 }
  $To = [Math]::Min($To, $img.Height - 1)
  $X2 = [Math]::Min($X2, $img.Width - 1)
  $empty = $false; $start = 0
  for ($y = $From; $y -le $To; $y++) {
    $max = 0
    for ($x = $X1; $x -le $X2; $x += 4) {
      $p = $img.GetPixel($x, $y)
      $v = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
      if ($v -gt $max) { $max = $v; if ($max -ge $Threshold) { break } }
    }
    $isEmpty = $max -lt $Threshold
    if ($isEmpty -and -not $empty) { $start = $y }
    if (-not $isEmpty -and $empty) {
      $len = $y - $start
      if ($len -ge $Min) { "gap {0}-{1}  ({2}px)" -f $start, ($y - 1), $len }
    }
    $empty = $isEmpty
  }
  if ($empty) { $len = $To - $start + 1; if ($len -ge $Min) { "gap {0}-{1}  ({2}px)" -f $start, $To, $len } }
} finally { $img.Dispose() }
