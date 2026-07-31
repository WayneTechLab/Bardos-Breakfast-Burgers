[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$ProfileDirectory = Split-Path -Parent $PROFILE
New-Item -ItemType Directory -Force -Path $ProfileDirectory | Out-Null
$Start = '# SFWA-WTL-G1 commands'
$End = '# End SFWA-WTL-G1 commands'
$Block = @"
$Start
function WTL-MENU { & node '$Root/.SYSTEMX/cli/systemx.mjs' menu @args }
function WTL-SETUP { & node '$Root/.SYSTEMX/cli/systemx.mjs' setup @args }
function WTL-AGI { & node '$Root/.SYSTEMX/cli/systemx.mjs' sync @args }
$End
"@
$Current = if (Test-Path $PROFILE) { Get-Content $PROFILE -Raw } else { '' }
$Pattern = [regex]::Escape($Start) + '[\s\S]*?' + [regex]::Escape($End)
if ($Current -match $Pattern) { $Current = [regex]::Replace($Current, $Pattern, $Block) }
else { $Current = ($Current.TrimEnd() + "`r`n`r`n" + $Block + "`r`n") }
Set-Content -LiteralPath $PROFILE -Value $Current -Encoding utf8
Write-Host "Installed WTL-MENU, WTL-SETUP, and WTL-AGI in $PROFILE"
