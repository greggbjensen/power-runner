param (
    [string][ValidateSet("Dev", "Test", "Stage", "Prod")]$environment = "Dev"
)

Write-Host "Deploying to $environment environment."