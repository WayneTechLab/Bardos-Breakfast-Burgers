[CmdletBinding()]
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$SystemxArgs)
$ErrorActionPreference = 'Stop'
& node (Join-Path $PSScriptRoot 'cli/systemx.mjs') @SystemxArgs
exit $LASTEXITCODE
