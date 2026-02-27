param(
  [Parameter(Mandatory = $true)][string]$Name,
  [switch]$KeepDate
)

$ErrorActionPreference = 'Stop'

function Get-Slug([string]$text) {
  $slug = $text.ToLowerInvariant()
  $slug = [regex]::Replace($slug, '[^a-z0-9]+', '-')
  $slug = $slug.Trim('-')
  if ([string]::IsNullOrWhiteSpace($slug)) { throw 'Could not derive slug from draft name.' }
  return $slug
}

function Get-JekyllDateNow {
  $dto = [DateTimeOffset]::Now
  $raw = $dto.ToString('yyyy-MM-dd HH:mm:ss zzz')
  return ($raw -replace '([+-]\d{2}):(\d{2})$', '$1$2')
}

$draftsDir = Join-Path $PSScriptRoot '..\_drafts'
$postsDir = Join-Path $PSScriptRoot '..\_posts'

$draftPath = Join-Path $draftsDir $Name
if (-not (Test-Path -LiteralPath $draftPath)) {
  $draftPath = Join-Path $draftsDir ($Name + '.md')
}
if (-not (Test-Path -LiteralPath $draftPath)) {
  throw "Draft not found: $Name"
}

$content = Get-Content -LiteralPath $draftPath -Raw
if ($content -notmatch '(?ms)^---\s*\r?\n(.*?)\r?\n---') {
  throw "Draft $draftPath has no valid front matter."
}

if (-not $KeepDate.IsPresent) {
  $dateValue = Get-JekyllDateNow
  if ($content -match '(?m)^date:\s*.+$') {
    $content = [regex]::Replace($content, '(?m)^date:\s*.+$', "date: $dateValue")
  } else {
    $content = $content -replace '(?ms)^---\s*\r?\n', "---`r`ndate: $dateValue`r`n"
  }
}

$draftFile = Split-Path -Leaf $draftPath
$slugBase = [System.IO.Path]::GetFileNameWithoutExtension($draftFile)
$slug = Get-Slug $slugBase
$datePrefix = (Get-Date).ToString('yyyy-MM-dd')
$postPath = Join-Path $postsDir ("$datePrefix-$slug.md")
$counter = 2
while (Test-Path -LiteralPath $postPath) {
  $postPath = Join-Path $postsDir ("$datePrefix-$slug-$counter.md")
  $counter += 1
}

Set-Content -LiteralPath $postPath -Value $content -Encoding utf8
Remove-Item -LiteralPath $draftPath
Write-Output "Promoted: $draftPath -> $postPath"

