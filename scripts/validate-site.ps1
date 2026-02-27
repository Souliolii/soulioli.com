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

function Parse-PostMeta([string]$path) {
  $raw = Get-Content -LiteralPath $path -Raw
  if ($raw -notmatch '(?ms)^---\s*\r?\n(.*?)\r?\n---') {
    return [PSCustomObject]@{ Path = $path; Errors = @('Missing or invalid front matter.') }
  }

  $fm = $Matches[1]
  $errors = @()

  $title = ''
  if ($fm -match '(?m)^title:\s*(.+?)\s*$') { $title = $Matches[1].Trim() } else { $errors += 'Missing title.' }

  $dateRaw = ''
  $date = $null
  if ($fm -match '(?m)^date:\s*(.+?)\s*$') {
    $dateRaw = $Matches[1].Trim()
    try { $date = [DateTimeOffset]::Parse($dateRaw) } catch { $errors += "Invalid date: $dateRaw" }
  } else {
    $errors += 'Missing date.'
  }

  $tags = @()
  if ($fm -match '(?m)^tags:\s*\[(.*?)\]\s*$') {
    $tags = @($Matches[1].Split(',') | ForEach-Object { $_.Trim().Trim('"''').ToLowerInvariant() } | Where-Object { $_ })
  } else {
    $errors += 'Missing tags list.'
  }

  $isPinned = $false
  if ($fm -match '(?m)^pinned:\s*(.+?)\s*$') {
    $isPinned = $Matches[1].Trim().ToLowerInvariant() -eq 'true'
  }

  $pinOrder = $null
  if ($fm -match '(?m)^pin_order:\s*(\d+)\s*$') {
    $pinOrder = [int]$Matches[1]
  } elseif ($isPinned) {
    $errors += 'Pinned post missing pin_order.'
  }

  return [PSCustomObject]@{
    Path = $path
    File = Split-Path -Leaf $path
    Title = $title
    Date = $date
    DateRaw = $dateRaw
    Tags = $tags
    Pinned = $isPinned
    PinOrder = $pinOrder
    Errors = $errors
  }
}

$allowedTags = Get-AllowedTags
$tagBase = @{}
$i = 1
foreach ($tag in $allowedTags) {
  $tagBase[$tag] = $i * 100
  $i += 1
}

$now = [DateTimeOffset]::Now
$postFiles = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..\_posts') -File
$all = @()
$errors = @()

foreach ($file in $postFiles) {
  $meta = Parse-PostMeta -path $file.FullName
  $all += $meta
  foreach ($err in $meta.Errors) {
    $errors += "[$($meta.File)] $err"
  }

  if ($meta.Date -and $meta.Date -gt $now) {
    $errors += "[$($meta.File)] Future date: $($meta.DateRaw)"
  }

  if ($meta.Tags.Count -ne 1) {
    $errors += "[$($meta.File)] Expected exactly 1 tag, found $($meta.Tags.Count)."
  } else {
    if ($allowedTags -notcontains $meta.Tags[0]) {
      $errors += "[$($meta.File)] Invalid tag '$($meta.Tags[0])'. Allowed: $($allowedTags -join ', ')"
    }
  }

  if ($meta.Pinned -and $meta.PinOrder -ne $null -and $meta.Tags.Count -ge 1) {
    $tag = $meta.Tags[0]
    if ($tagBase.ContainsKey($tag)) {
      $min = $tagBase[$tag]
      $max = $min + 99
      if ($meta.PinOrder -lt $min -or $meta.PinOrder -gt $max) {
        $errors += "[$($meta.File)] pin_order $($meta.PinOrder) out of range for '$tag' ($min-$max). Run scripts/normalize-pin-order.ps1"
      }
    }
  }
}

$pinned = $all | Where-Object { $_.Pinned -and $_.PinOrder -ne $null }
$dupes = $pinned | Group-Object PinOrder | Where-Object { $_.Count -gt 1 }
foreach ($grp in $dupes) {
  $names = ($grp.Group | ForEach-Object { $_.File }) -join ', '
  $errors += "Duplicate pin_order $($grp.Name): $names"
}

if ($errors.Count -gt 0) {
  Write-Output 'Validation failed:'
  $errors | ForEach-Object { Write-Output " - $_" }
  exit 1
}

Write-Output "Validation passed: $($all.Count) posts checked."
Write-Output "Allowed tags: $($allowedTags -join ', ')"
$ranges = $tagBase.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Key)=$($_.Value)-$($_.Value + 99)" }
Write-Output "Pin ranges: $($ranges -join ', ')"

