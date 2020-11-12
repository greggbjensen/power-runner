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

$metadata = Get-Command $scriptPath
$parameters = [System.Collections.ArrayList]::new()
$parameterNames = [System.Collections.ArrayList]::new()
$defaults = @{}
foreach ($param in $metadata.ScriptBlock.Ast.ParamBlock.Parameters) {
  $name = $param.Name.ToString().TrimStart("$")
  if ($param.DefaultValue -ne $null) {

    if ($param.DefaultValue.Value -ne $null) {
      $defaults[$name] = $param.DefaultValue.Value
    } else {
      $defaults[$name] = $param.DefaultValue
    }
  } else {
    $defaults[$name] = $null
  }
  $parameterNames.Add($name) | Out-Null
}

foreach ($name in $parameterNames) {
  $x = $metadata.Parameters.$name;
  $validation = @{ }
  $type = $x.ParameterType.Name.Replace("Parameter", "")
  foreach ($attribute in $x.Attributes) {
    $attributeType = $attribute.TypeId.Name.Replace("Attribute", "")
    switch ($attributeType) {
      "Parameter" {
        if ($attribute.Mandatory) {
          $validation.required = $true
        }
      }
      "ValidateSet" {
        $validation.set = $attribute.ValidValues
        $type = 'Set'
      }
      Default {}
    }
  }

  $default = $defaults[$name]

  $parameter = @{
    name = $name
    type = $type
    validation = $validation
    default = $default
  }

  $parameters.Add($parameter) | Out-Null
}

@{
  description = $description
  params = $parameters
} | ConvertTo-Json -Depth 4 -Compress