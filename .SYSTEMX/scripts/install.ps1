#Requires -Version 5.1
<#
SFWA-WTL-G1 one-line Windows 11 workstation bootstrap. Installs the baseline
toolchain, clones or reuses the template, validates it, then asks before opening
the menu-driven Setup & Tooling phase.
#>
[CmdletBinding()]
param(
  [switch]$Yes,
  [switch]$DryRun,
  [switch]$SkipMenu,
  [switch]$Local,
  [string]$Target = $(if ($env:SFWA_WTL_HOME) { $env:SFWA_WTL_HOME } else { Join-Path $HOME 'SFWA-WTL-G1' }),
  [string]$Repo = $(if ($env:SFWA_WTL_REPO_URL) { $env:SFWA_WTL_REPO_URL } else { 'https://github.com/WayneTechLab/SFWA-WTL-TEMPLATE.git' })
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Write-Step([string]$Message) { Write-Host "`n[SFWA-WTL-G1] $Message" -ForegroundColor Cyan }
function Test-Command([string]$Name) { return [bool](Get-Command $Name -ErrorAction SilentlyContinue) }
function Invoke-Plan([scriptblock]$Action, [string]$Display) {
  if ($DryRun) { Write-Host "[dry-run] $Display"; return }
  & $Action
  if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "Command failed ($LASTEXITCODE): $Display" }
}
function Confirm-Action([string]$Prompt, [bool]$DefaultYes = $true) {
  if ($Yes) { return $true }
  $Suffix = if ($DefaultYes) { '[Y/n]' } else { '[y/N]' }
  $Answer = Read-Host "$Prompt $Suffix"
  if ([string]::IsNullOrWhiteSpace($Answer)) { return $DefaultYes }
  return $Answer -match '^[Yy]$'
}

$Architecture = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'ARM64') { 'arm64' } else { 'x64' }
$PlatformId = "windows-$Architecture"

$LocalRoot = $null
if ($PSScriptRoot) {
  $Candidate = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
  if (Test-Path (Join-Path $Candidate '.SYSTEMX/cli/systemx.mjs')) { $LocalRoot = $Candidate }
}
if (-not $LocalRoot -and (Test-Path (Join-Path (Get-Location) '.SYSTEMX/cli/systemx.mjs'))) {
  $LocalRoot = (Get-Location).Path
}
if ($Local -and -not $LocalRoot) { throw '-Local requires an SFWA-WTL-G1 checkout as the current directory.' }

Write-Step "Detected $PlatformId"
Write-Host 'Installation plan:'
Write-Host '  - PowerShell 7, Git, GitHub CLI, Visual Studio Code, Google Cloud CLI, and Chrome'
Write-Host '  - Node.js 24 LTS with vendor SHA-256 verification'
Write-Host '  - Pinned project Firebase CLI and npm dependencies'
if ($Architecture -eq 'arm64') {
  Write-Warning 'Google Cloud CLI may use its x64 package under Windows ARM64 emulation. A read-only verification runs after installation.'
}

if (-not (Confirm-Action "Install the listed development tools for $PlatformId?" $true)) {
  Write-Step 'Installation cancelled before any tool changes.'
  exit 0
}

if (-not (Test-Command 'winget')) {
  if ($DryRun) { Write-Host '[dry-run] register or repair Microsoft App Installer / WinGet' }
  else {
    try { Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe -ErrorAction Stop }
    catch { throw 'WinGet is required. Install or repair Microsoft App Installer, then re-run: https://learn.microsoft.com/windows/package-manager/winget/' }
  }
}

function Install-WinGetPackage([string]$Id) {
  if (-not $DryRun) {
    & winget list --id $Id --exact --source winget --accept-source-agreements | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Host "PASS $Id already installed"; return }
  }
  $Arguments = @('install', '--id', $Id, '--exact', '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements', '--disable-interactivity')
  Invoke-Plan { & winget @Arguments } "winget $($Arguments -join ' ')"
}

foreach ($Package in @('Microsoft.PowerShell', 'Git.Git', 'GitHub.cli', 'Microsoft.VisualStudioCode', 'Google.Chrome', 'Google.CloudSDK')) {
  Install-WinGetPackage $Package
}

function Update-SessionPath {
  $KnownPaths = @(
    (Join-Path $env:ProgramFiles 'PowerShell/7'),
    (Join-Path $env:ProgramFiles 'Git/cmd'),
    (Join-Path $env:LOCALAPPDATA 'Programs/Microsoft VS Code/bin'),
    (Join-Path $env:LOCALAPPDATA 'Google/Cloud SDK/google-cloud-sdk/bin')
  )
  $MachinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $UserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = (($KnownPaths + $MachinePath + $UserPath + $env:Path) | Where-Object { $_ } | Select-Object -Unique) -join ';'
}
if (-not $DryRun) { Update-SessionPath }

function Install-Node24 {
  $NeedsInstall = -not (Test-Command 'node')
  if (-not $NeedsInstall) { $NeedsInstall = (& node --version) -notmatch '^v24\.' }
  if (-not $NeedsInstall) { Write-Host "PASS Node.js $(& node --version)"; return }
  if ($DryRun) {
    Write-Host "[dry-run] download and SHA-256 verify the latest Node.js 24 Windows $Architecture archive"
    return
  }
  $Tooling = Join-Path $env:LOCALAPPDATA 'SFWA-WTL-G1/tooling'
  New-Item -ItemType Directory -Force -Path $Tooling | Out-Null
  $Release = (Invoke-RestMethod 'https://nodejs.org/dist/index.json' | Where-Object { $_.version -like 'v24.*' } | Select-Object -First 1).version
  if (-not $Release) { throw 'Could not resolve the current Node.js 24 LTS release.' }
  $ArchiveName = "node-$Release-win-$Architecture.zip"
  $Archive = Join-Path $env:TEMP $ArchiveName
  $BaseUrl = "https://nodejs.org/dist/$Release"
  Invoke-WebRequest "$BaseUrl/$ArchiveName" -OutFile $Archive
  $Checksums = (Invoke-WebRequest "$BaseUrl/SHASUMS256.txt").Content -split "`n"
  $ChecksumLine = $Checksums | Where-Object { $_ -match "\s$([regex]::Escape($ArchiveName))\s*$" } | Select-Object -First 1
  $Expected = ($ChecksumLine -split '\s+')[0].ToLowerInvariant()
  $Actual = (Get-FileHash $Archive -Algorithm SHA256).Hash.ToLowerInvariant()
  if (-not $Expected -or $Actual -ne $Expected) { throw 'Node.js archive checksum validation failed.' }
  Expand-Archive -LiteralPath $Archive -DestinationPath $Tooling -Force
  $NodeHome = Join-Path $Tooling "node-$Release-win-$Architecture"
  $env:Path = "$NodeHome;$env:Path"
  $UserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  if ($UserPath -notlike "*$NodeHome*") { [Environment]::SetEnvironmentVariable('Path', "$NodeHome;$UserPath", 'User') }
  Remove-Item $Archive -Force
  Write-Host "PASS Node.js $(& node --version) (vendor checksum verified)"
}
Install-Node24

$Root = $LocalRoot
if (-not $Root) {
  $Root = [IO.Path]::GetFullPath($Target)
  if (Test-Path (Join-Path $Root '.git')) {
    Write-Step "Reusing existing checkout at $Root; no pull or reset was performed."
  } elseif (Test-Path $Root) {
    if ((Get-ChildItem -Force $Root | Select-Object -First 1)) { throw "Target exists and is not an SFWA-WTL-G1 Git checkout: $Root" }
    Invoke-Plan { & git clone $Repo $Root } "git clone $Repo $Root"
  } else {
    Invoke-Plan { & git clone $Repo $Root } "git clone $Repo $Root"
  }
}

if ($DryRun) {
  Write-Host "[dry-run] npm ci --prefix `"$Root`""
  Write-Host "[dry-run] node `"$Root/.SYSTEMX/cli/systemx.mjs`" doctor --strict=false --platform $PlatformId"
  Write-Step 'Dry run complete; no machine or repository changes were made.'
  exit 0
}

if (-not (Test-Path (Join-Path $Root 'package.json'))) { throw "Repository package.json not found at $Root" }
Push-Location $Root
try {
  & npm.cmd ci --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
  & node '.SYSTEMX/cli/systemx.mjs' doctor --strict=false
  if ($LASTEXITCODE -ne 0) { throw 'SYSTEMX diagnostics failed.' }
  if ($Architecture -eq 'arm64' -and (Test-Command 'gcloud')) {
    & gcloud version --format='value(Google Cloud SDK)' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Google Cloud CLI did not pass the Windows ARM64 read-only verification gate.' }
  }
  Write-Step 'Baseline installation and diagnostics are complete.'
  Write-Host "Repository: $Root"
  if (-not $SkipMenu -and (Confirm-Action 'Proceed to the menu-driven Setup & Tooling phase now?' $true)) {
    $SystemxLauncher = Join-Path $Root '.SYSTEMX/systemx.ps1'
    & pwsh.exe -NoLogo -NoProfile -File $SystemxLauncher menu --setup-phase
    exit $LASTEXITCODE
  }
  Write-Step "Setup was not started. Later, run: cd `"$Root`"; npm run wtl:menu -- --setup-phase"
} finally {
  Pop-Location
}
