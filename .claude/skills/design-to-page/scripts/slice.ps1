# Cut a tall full-page export into readable horizontal chunks (the image viewer downscales tall files).
# Output names carry the y offset: <Prefix>-NN-y<offset>.png
# Usage: powershell -File slice.ps1 -Src "design/product/desktop version/Full.png" -OutDir "<scratchpad>/slices" -Prefix d -Height 1000
param(
  [Parameter(Mandatory)][string]$Src,
  [Parameter(Mandatory)][string]$OutDir,
  [string]$Prefix = 's',
  [int]$Height = 1000
)
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force $OutDir | Out-Null
$img = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Src).Path)
try {
  $i = 0
  for ($y = 0; $y -lt $img.Height; $y += $Height) {
    $h = [Math]::Min($Height, $img.Height - $y)
    $bmp = New-Object System.Drawing.Bitmap $img.Width, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $img.Width, $h), (New-Object System.Drawing.Rectangle 0, $y, $img.Width, $h), [System.Drawing.GraphicsUnit]::Pixel)
    $name = Join-Path $OutDir ('{0}-{1:D2}-y{2}.png' -f $Prefix, $i, $y)
    $bmp.Save($name, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $i++
    $name
  }
} finally { $img.Dispose() }
