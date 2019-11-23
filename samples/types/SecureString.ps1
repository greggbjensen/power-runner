param (
  [string]$server = 'localhost',
  [string]$database = 'MyDatabase',
  [string]$username = 'SomeUser',
  [SecureString]$password = $null
)

Write-Host "Connecting to $server $database with user $username and $password"