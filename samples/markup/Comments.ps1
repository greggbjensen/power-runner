Param (
   [string]$version = '0.3.0', # Update as version increases so you don't need to specify this.
   [switch]$revert = $false # Reverts all references to their original
)

if (-not $revert) {
  Write-Host "Setting version to $version."
}
else {
  Write-Host "Reverting"
}