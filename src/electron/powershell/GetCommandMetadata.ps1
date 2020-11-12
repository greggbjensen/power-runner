param (
  [string][Parameter(Mandatory = $true)]$scriptPath
)

$metadata = Get-Command $scriptPath
$parameters = [System.Collections.ArrayList]::new()
$defaults = @{}
foreach ($param in $metadata.ScriptBlock.Ast.ParamBlock.Parameters) {
  $name = $param.Name.ToString().TrimStart("$")
  $defaults[$name] = $param.DefaultValue.ToString().Trim('"', "'")
}

foreach ($key in $metadata.Parameters.Keys) {
  $x = $metadata.Parameters.$key;
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

  $default = $defaults[$key]
  if ([string]::Equals($default, '$true', [System.StringComparison]::OrdinalIgnoreCase)) {
    $default = $true
  }
  elseif ([string]::Equals($default, '$false', [System.StringComparison]::OrdinalIgnoreCase)) {
    $default = $false
  }

  $parameter = @{
    name = $key
    type = $type
    validation = $validation
    default = $default
  }

  $parameters.Add($parameter) | Out-Null
}

@{
  description = $null
  params = $parameters
} | ConvertTo-Json -Depth 4 -Compress