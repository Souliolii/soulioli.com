param(
  [Parameter(Mandatory = $true)][string]$Title,
  [Parameter(Mandatory = $true)][string]$Tag,
  [switch]$Pinned,
  [int]$PinOrder
)

$ErrorActionPreference = 'Stop'

function Get-AllowedTags {
  $configPath = Join-Path $PSScriptRoot '..\_config.yml'
  $tags = @()
  Get-Content -LiteralPath $configPath | ForEach-Object {
    if ($_ -match '^\s*tag:\s*([a-zA-Z0-9_-]+)\s*$') {
      $value = $Matches[1].ToLowerInvariant()
      if ($value -ne 'all') { $tags += $value }
    }
  }
  return $tags | Select-Object -Unique
}

function Get-Slug([string]$text) {
  $slug = $text.ToLowerInvariant()
  $slug = [regex]::Replace($slug, '[^a-z0-9]+', '-')
  $slug = $slug.Trim('-')
  if ([string]::IsNullOrWhiteSpace($slug)) { throw 'Could not derive slug from title.' }
  return $slug
}

function Get-JekyllDateNow {
  $dto = [DateTimeOffset]::Now
  $raw = $dto.ToString('yyyy-MM-dd HH:mm:ss zzz')
  return ($raw -replace '([+-]\d{2}):(\d{2})$', '$1$2')
}

$allowedTags = Get-AllowedTags
$tagValue = $Tag.ToLowerInvariant()
if ($allowedTags -notcontains $tagValue) {
  throw "Invalid tag '$Tag'. Allowed tags: $($allowedTags -join ', ')"
}

$slug = Get-Slug $Title
$datePrefix = (Get-Date).ToString('yyyy-MM-dd')
$postsDir = Join-Path $PSScriptRoot '..\_posts'
$baseName = "$datePrefix-$slug"
$path = Join-Path $postsDir ($baseName + '.md')
$counter = 2
while (Test-Path -LiteralPath $path) {
  $path = Join-Path $postsDir ("$baseName-$counter.md")
  $counter += 1
}

$dateValue = Get-JekyllDateNow
$frontMatter = @(
  '---',
  'layout: post',
  ('title: "' + $Title + '"'),
  "date: $dateValue",
  "tags: [$tagValue]"
)
if ($Pinned.IsPresent) {
  $frontMatter += 'pinned: true'
  if ($PSBoundParameters.ContainsKey('PinOrder')) { $frontMatter += "pin_order: $PinOrder" }
}
$frontMatter += '---'
$frontMatter += ''
$frontMatter += 'Write your post here.'

Set-Content -LiteralPath $path -Value $frontMatter -Encoding utf8
Write-Output "Created: $path"

