[CmdletBinding()]
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
& node (Join-Path $PSScriptRoot '.SYSTEMX/cli/systemx.mjs') menu @Arguments
exit $LASTEXITCODE
