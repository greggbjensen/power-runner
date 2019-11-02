param (
    [string]$name = 'Jim',
    [switch]$isLoud = $false
)

$message = "Hello $name, how are you?"
if ($isLoud) {
  $message = $message.ToUpper()
}

Write-Host $message