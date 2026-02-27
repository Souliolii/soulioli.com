param(
  [Parameter(Mandatory = $true)][string]$Title,
  [Parameter(Mandatory = $true)][string]$Tag
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

$allowedTags = Get-AllowedTags
$tagValue = $Tag.ToLowerInvariant()
if ($allowedTags -notcontains $tagValue) {
  throw "Invalid tag '$Tag'. Allowed tags: $($allowedTags -join ', ')"
}

$slug = Get-Slug $Title
$draftsDir = Join-Path $PSScriptRoot '..\_drafts'
$path = Join-Path $draftsDir ($slug + '.md')
$counter = 2
while (Test-Path -LiteralPath $path) {
  $path = Join-Path $draftsDir ("$slug-$counter.md")
  $counter += 1
}

$content = @(
  '---',
  'layout: post',
  ('title: "' + $Title + '"'),
  "tags: [$tagValue]",
  '---',
  '',
  'Draft content.'
)

Set-Content -LiteralPath $path -Value $content -Encoding utf8
Write-Output "Created draft: $path"

