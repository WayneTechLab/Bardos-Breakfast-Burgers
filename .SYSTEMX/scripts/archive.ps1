[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('Compress', 'Expand')]
  [string]$Action,
  [Parameter(Mandatory = $true)]
  [string]$Source,
  [Parameter(Mandatory = $true)]
  [string]$Destination
)

$ErrorActionPreference = 'Stop'
if ($Action -eq 'Compress') {
  Compress-Archive -LiteralPath $Source -DestinationPath $Destination -Force
} else {
  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  Expand-Archive -LiteralPath $Source -DestinationPath $Destination -Force
}
