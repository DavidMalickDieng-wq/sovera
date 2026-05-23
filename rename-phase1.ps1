# Phase 1 rename: public-facing sovera -> gardia
# SKIPS: infra/, .whatif.json, package-lock, node_modules, .git, dist, .next
# PROTECTS live Azure resource identifiers

$PROTECTED = @(
  'sovera-fn-h2ssji7afhlr2',
  'soverastudio6dzm3plhl7l5w',
  'sovera-studio-law',
  'sovera-studio--',
  '-g sovera-studio',
  '-n sovera-studio',
  "'sovera-studio'",
  '"sovera-studio"',
  '-g sovera ',
  '/sovera/providers/',
  'resourceGroups/sovera'
)

$files = Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.js,*.json,*.md,*.yaml,*.yml,*.html,*.css,*.mjs,*.cjs |
  Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.next\\|\\dist\\|\\out\\|\\\.git\\|package-lock\.json|sovera-mcp-0\.1\.0\.tgz|sovera-client-0\.1\.0\.tgz|\\infra\\|\.whatif\.json|rename-phase1\.ps1'
  }

$changedFiles = 0
foreach ($file in $files) {
  $orig = [System.IO.File]::ReadAllText($file.FullName)
  if (-not $orig) { continue }
  if ($orig.IndexOf('sovera', [StringComparison]::OrdinalIgnoreCase) -lt 0) { continue }

  $s = $orig
  $map = @{}
  $idx = 0
  foreach ($p in $PROTECTED) {
    while ($s.Contains($p)) {
      $key = "__PRT_$($idx)_$([guid]::NewGuid().Guid.Substring(0,6))__"
      $idx++
      $map[$key] = $p
      $s = $s.Replace($p, $key)
    }
  }
  $s = $s -replace 'sovera\.eu', 'gardia.cloud'
  $s = $s -creplace 'SOVERA', 'GARDIA'
  $s = $s -creplace 'Sovera', 'Gardia'
  $s = $s -creplace 'sovera', 'gardia'
  foreach ($k in $map.Keys) { $s = $s.Replace($k, $map[$k]) }

  if ($s -ne $orig) {
    [System.IO.File]::WriteAllText($file.FullName, $s, (New-Object System.Text.UTF8Encoding($false)))
    $changedFiles++
  }
}
Write-Output "FILES MODIFIED: $changedFiles"

Write-Output "REMAINING sovera REFS outside infra/.whatif.json:"
$leftover = Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.js,*.json,*.md,*.yaml,*.yml,*.html,*.css,*.mjs,*.cjs |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.next\\|\\dist\\|\\\.git\\|package-lock\.json|\\infra\\|\.whatif\.json|sovera-mcp-0\.1\.0\.tgz|sovera-client-0\.1\.0\.tgz|rename-phase1\.ps1' }
$leftover | ForEach-Object {
  $hits = Select-String -Path $_.FullName -Pattern 'sovera' -ErrorAction SilentlyContinue
  if ($hits) {
    Write-Output ("{0,3} {1}" -f $hits.Count, $_.FullName.Substring((Get-Location).Path.Length+1))
    $hits | Select-Object -First 3 | ForEach-Object { Write-Output ("      L$($_.LineNumber): $($_.Line.Trim())") }
  }
}
