param(
  [string]$DatabaseUrl = $env:DATABASE_URL,
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\backups')
)

if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
  throw 'DATABASE_URL wajib diisi melalui environment atau parameter -DatabaseUrl.'
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
  throw 'pg_dump tidak ditemukan. Instal PostgreSQL client dan tambahkan ke PATH.'
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$destination = Join-Path $resolvedOutput "chemsphere-$timestamp.dump"

& $pgDump.Source --format=custom --file=$destination --dbname=$DatabaseUrl
if ($LASTEXITCODE -ne 0) {
  Remove-Item -LiteralPath $destination -Force -ErrorAction SilentlyContinue
  throw "Backup gagal (kode keluar $LASTEXITCODE)."
}

Write-Output "Backup selesai: $destination"
