param(
  [string]$InDir = ".\in",
  [string]$OutDir = ".\out",
  [switch]$Emb = $true,
  [switch]$EmbedToc = $true
)

# Ensure dirs exist (won't fail if already there)
New-Item -ItemType Directory -Force $InDir | Out-Null
New-Item -ItemType Directory -Force $OutDir | Out-Null

$flags = @()
if ($Emb) { $flags += '--emb' }
if ($EmbedToc) { $flags += '--embedToc' }

Get-ChildItem -Path $InDir -Filter *.pdf -File -Recurse | ForEach-Object {
  $name = [IO.Path]::GetFileNameWithoutExtension($_.Name)
  $dest = Join-Path $OutDir $name
  New-Item -ItemType Directory -Force $dest | Out-Null

  npm run cli -- `
    reorder `
    --in "$($_.FullName)" `
    --out "$dest\ordered.pdf" `
    --log "$dest\log.json" `
    --report "$dest\report.html" `
    --toc "$dest\toc.json" `
    --dupmiss "$dest\dup_missing.json" `
    @flags
}
