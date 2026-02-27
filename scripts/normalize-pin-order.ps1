$ErrorActionPreference = 'Stop'

function Get-TagBaseMap {
  $configPath = Join-Path $PSScriptRoot '..\_config.yml'
  $tags = @()
  Get-Content -LiteralPath $configPath | ForEach-Object {
    if ($_ -match '^\s*tag:\s*([a-zA-Z0-9_-]+)\s*$') {
      $value = $Matches[1].ToLowerInvariant()
      if ($value -ne 'all') { $tags += $value }
    }
  }
  $tags = $tags | Select-Object -Unique
  $map = @{}
  $index = 1
  foreach ($tag in $tags) {
    $map[$tag] = $index * 100
    $index += 1
  }
  return $map
}

function Parse-PostMeta([string]$path) {
  $raw = Get-Content -LiteralPath $path -Raw
  if ($raw -notmatch '(?ms)^---\s*\r?\n(.*?)\r?\n---') { return $null }
  $fm = $Matches[1]

  $date = $null
  if ($fm -match '(?m)^date:\s*(.+?)\s*$') {
    $date = [DateTimeOffset]::Parse($Matches[1].Trim())
  }

  $tags = @()
  if ($fm -match '(?m)^tags:\s*\[(.*?)\]\s*$') {
    $tags = @($Matches[1].Split(',') | ForEach-Object { $_.Trim().Trim('"''').ToLowerInvariant() } | Where-Object { $_ })
  }

  $isPinned = $false
  if ($fm -match '(?m)^pinned:\s*(.+?)\s*$') {
    $isPinned = $Matches[1].Trim().ToLowerInvariant() -eq 'true'
  }

  return [PSCustomObject]@{
    Path = $path
    Raw = $raw
    Date = $date
    Tags = $tags
    Pinned = $isPinned
  }
}

function Set-PinOrder([string]$path, [int]$value) {
  $raw = Get-Content -LiteralPath $path -Raw
  if ($raw -match '(?m)^pin_order:\s*.+$') {
    $updated = [regex]::Replace($raw, '(?m)^pin_order:\s*.+$', "pin_order: $value")
  } else {
    $updated = $raw -replace '(?ms)^---\s*\r?\n(.*?)\r?\n---', "---`r`n`$1`r`npin_order: $value`r`n---"
  }
  Set-Content -LiteralPath $path -Value $updated -Encoding utf8
}

$tagBases = Get-TagBaseMap
$postFiles = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..\_posts') -File
$posts = @()
foreach ($file in $postFiles) {
  $meta = Parse-PostMeta -path $file.FullName
  if ($null -ne $meta -and $meta.Pinned) { $posts += $meta }
}

$updatedCount = 0
foreach ($tag in $tagBases.Keys) {
  $base = $tagBases[$tag]
  $tagPosts = @($posts | Where-Object { $_.Tags -contains $tag } | Sort-Object Date -Descending)
  for ($i = 0; $i -lt $tagPosts.Count; $i++) {
    $nextOrder = $base + $i
    Set-PinOrder -path $tagPosts[$i].Path -value $nextOrder
    $updatedCount += 1
  }
}

Write-Output "Updated pin_order for $updatedCount pinned posts."
$ranges = $tagBases.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Key)=$($_.Value)-$($_.Value + 99)" }
Write-Output "Ranges: $($ranges -join ', ')"

