param (
    [string][ValidateSet("Dev", "Test", "Stage", "Prod")]$environment
)

Write-Host "Deploying to $environment environment."