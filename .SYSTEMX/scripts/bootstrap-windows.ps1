#Requires -Version 5.1
# Local compatibility entry point. Machine provisioning is owned by install.ps1;
# setup behavior remains in the shared Node.js SYSTEMX CLI.
[CmdletBinding()]
param(
  [switch]$Check,
  [switch]$WithStripe,
  [switch]$WithM365,
  [switch]$WithMcp,
  [switch]$DryRun,
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$RemainingArguments
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$Installer = Join-Path $PSScriptRoot 'install.ps1'

$InstallerArguments = @('-Local', '-Yes', '-SkipMenu')
if ($DryRun) { $InstallerArguments += '-DryRun' }
& powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File $Installer @InstallerArguments
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
if ($DryRun) { exit 0 }

Push-Location $Root
try {
  $Arguments = @('setup')
  if ($Check) { $Arguments += '--check' } else { $Arguments += '--install' }
  if ($WithStripe) { $Arguments += '--with-stripe' }
  if ($WithM365) { $Arguments += '--with-m365' }
  if ($WithMcp) { $Arguments += '--with-mcp' }
  $Arguments += $RemainingArguments
  & pwsh.exe -NoLogo -NoProfile -File '.SYSTEMX/systemx.ps1' @Arguments
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
