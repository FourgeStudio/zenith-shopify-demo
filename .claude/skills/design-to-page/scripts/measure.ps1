# Measure a design PNG instead of guessing.
#   Colours at points:   -Points "300,30;10,92"
#   Runs along a row:    -Row 6027 [-From 60 -To 1380] [-Threshold 40]   → x ranges where R > threshold (edges, widths, gaps)
#   Runs along a column: -Col 1271 [-From 5990 -To 6070]                  → y ranges (heights, vertical gaps)
#   Zoomed crop to view: -Crop "147,84,316,480" -Scale 2 -Out "<scratchpad>/zoom.png"
# Usage: powershell -File measure.ps1 -Src "<png>" -Points "x,y;x,y"
param(
  [Parameter(Mandatory)][string]$Src,
  [string]$Points,
  [int]$Row = -1,
  [int]$Col = -1,
  [int]$From = 0,
  [int]$To = -1,
  [int]$Threshold = 40,
  [string]$Crop,
  [double]$Scale = 2,
  [string]$Out
)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $Src).Path)
try {
  "size {0}x{1}" -f $img.Width, $img.Height
  if ($Points) {
    foreach ($pt in $Points.Split(';')) {
      $xy = $pt.Split(',') | ForEach-Object { [int]$_ }
      $p = $img.GetPixel($xy[0], $xy[1])
      "({0},{1}) #{2:X2}{3:X2}{4:X2}" -f $xy[0], $xy[1], $p.R, $p.G, $p.B
    }
  }
  if ($Row -ge 0 -or $Col -ge 0) {
    $max = if ($Row -ge 0) { $img.Width } else { $img.Height }
    $end = if ($To -lt 0) { $max - 1 } else { [Math]::Min($To, $max - 1) }
    $runs = @(); $prev = $false; $start = $From
    for ($i = $From; $i -le $end; $i++) {
      $p = if ($Row -ge 0) { $img.GetPixel($i, $Row) } else { $img.GetPixel($Col, $i) }
      $on = ($p.R -gt $Threshold)
      if ($on -and -not $prev) { $start = $i }
      if (-not $on -and $prev) { $runs += "$start-$($i - 1)" }
      $prev = $on
    }
    if ($prev) { $runs += "$start-$end" }
    "runs: " + ($runs -join ', ')
  }
  if ($Crop) {
    $c = $Crop.Split(',') | ForEach-Object { [int]$_ }
    $w = [int]($c[2] * $Scale); $h = [int]($c[3] * $Scale)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), (New-Object System.Drawing.Rectangle $c[0], $c[1], $c[2], $c[3]), [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    "crop saved $Out"
  }
} finally { $img.Dispose() }
