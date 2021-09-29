param (
  [string][Parameter(Mandatory = $true)]$scriptPath
)

$help = Get-Help $scriptPath -Full
$description = $null
if ($help -and ($help.description -ne $null)) {
  $description = ''
  foreach ($node in $help.description) {
    if ($node.Text -ne $null) {
      $description += $node.Text
    }
  }
}

$numberTypes = @( 'Byte', 'Int32', 'Int64', 'Single', 'Double', 'Decimal' )
$scriptRootRegex = [regex]::new('\$PSScriptRoot', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$directory = [System.IO.Path]::GetDirectoryName($scriptPath)
$metadata = Get-Command $scriptPath
$parameters = [System.Collections.ArrayList]::new()
foreach ($param in $metadata.ScriptBlock.Ast.ParamBlock.Parameters) {
  $name = $param.Name.ToString().TrimStart('$')

  $default = $null
  $defaultText = $param.DefaultValue.Extent.Text
  if (($defaultText -ne $null) -and ($defaultText -ne '@()')) {
    $defaultText = $scriptRootRegex.Replace($defaultText, $directory)
    $default = Invoke-Expression $defaultText
  }

  $x = $metadata.Parameters.$name;
  $validation = @{ }
  $type = $x.ParameterType.Name
  $itemType = $null
  if ($x.ParameterType.BaseType.Name -eq 'Array') {
    $itemType = $type.Replace('[]', '')
    $type = 'Array'
  }
  elseif ($type -eq 'SwitchParameter') {
    $type = 'Switch'
  }
  elseif ($numberTypes.Contains($type)) {
    $type = 'Number'
  }
  elseif ($type -eq 'DateTime') {
    $type = 'Date'
  }

  foreach ($attribute in $x.Attributes) {
    $attributeType = $attribute.TypeId.Name
    switch ($attributeType) {
      "ParameterAttribute" {
        if ($attribute.Mandatory) {
          $validation.required = $true
        }
      }
      "ValidateSetAttribute" {
        $validation.set = $attribute.ValidValues
        $type = 'Set'
      }
      Default {}
    }
  }

  $parameter = @{
    name = $name
    type = $type
    validation = $validation
    default = $default
  }

  if ($itemType -ne $null) {
    $parameter.itemType = $itemType
  }

  $parameters.Add($parameter) | Out-Null
}

@{
  description = $description
  params = $parameters
} | ConvertTo-Json -Depth 4 -Compress