param (
  [string]$server = 'localhost',
  [string]$database = $null,
  [string]$username = $null
)

Write-Host "Connecting to $server $database with user $username"