Get-Command ..\attributes\ComplexParams.ps1 | % {
  $defaults = @{}
  foreach ($param in $_.ScriptBlock.Ast.ParamBlock.Parameters) {
    $name = $param.Name.ToString().TrimStart("$")
    $defaults[$name] = $param.DefaultValue.ToString().Trim('"', "'")
  }

  foreach ($key in $_.Parameters.Keys) {
    $x = $_.Parameters.$key;
    $attributes = @()
    foreach ($attribute in $x.Attributes) {
      $type = $attribute.TypeId.Name.Replace("Attribute", "")
      switch ($type) {
        "Parameter" {
          $attributes += @{
            type = $type;
            required = $attribute.Mandatory
          }
        }
        "ValidateSet" {
          $attributes += @{
            type = $type;
            values = $attribute.ValidValues
          }
        }
        Default {}
      }
    }

    $default = $defaults[$x.Name]

    @{
      name = $x.Name;
      type = $x.ParameterType.Name.Replace("Parameter", "")
      attributes = $attributes
      default = $default
    }
  }
} | ConvertTo-Json -Depth 4 -Compress