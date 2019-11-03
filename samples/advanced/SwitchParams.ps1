param (
    [string]$name = 'Jim',
    [bool]$isHello = $true,
    [switch]$isLoud = $false
)

$message = "Hello $name, how are you?"
if (-not $isHello) {
  $message = "Goodbye $name, see you next time?"
}

if ($isLoud) {
  $message = $message.ToUpper()
}

Write-Host $message