param (
    [string][Parameter(Mandatory = $true)]$name,
    [string]$action = 'Runs'
)

Write-Host "$name $action"