param (
    [datetime]$startDate,
    [datetime]$endDate
)

Write-Host "$from $($startDate.ToString('yyy-MM-dd')) to $($endDate.ToString('yyy-MM-dd'))"