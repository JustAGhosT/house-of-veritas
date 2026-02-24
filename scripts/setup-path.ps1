# Add node_modules/.bin to PATH so next, eslint, prettier, vitest work when run directly
$root = Split-Path $PSScriptRoot -Parent
$binPath = Join-Path $root "node_modules\.bin"
if ($binPath) {
  $env:PATH = "$binPath;$env:PATH"
  Write-Host "Added to PATH: $binPath"
} else {
  Write-Host "Run 'npm ci' or 'npm install' first" -ForegroundColor Yellow
}
