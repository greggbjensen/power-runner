<#
.Description
Get-Function displays the name and syntax of all functions in the session.
#>
param (
    [string][Parameter(Mandatory = $true)]$name,
    [string]$action = 'Runs'
)

Write-Host "$name $action"