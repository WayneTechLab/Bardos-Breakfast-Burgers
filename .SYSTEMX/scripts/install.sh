#!/usr/bin/env bash
# SFWA-WTL-G1 one-line workstation bootstrap for macOS, Ubuntu, Debian, WSL2,
# and best-effort apt/dnf Linux compatibility. Shared setup starts in Node only
# after the operating-system tools and project dependencies are ready.
set -Eeuo pipefail

REPO_URL="${SFWA_WTL_REPO_URL:-https://github.com/WayneTechLab/SFWA-WTL-TEMPLATE.git}"
TARGET_DIR="${SFWA_WTL_HOME:-$HOME/SFWA-WTL-G1}"
DRY_RUN=0
ASSUME_YES=0
SKIP_MENU=0
LOCAL_ONLY=0

say() { printf '\n[SFWA-WTL-G1] %s\n' "$*"; }
warn() { printf '\n[SFWA-WTL-G1] WARNING: %s\n' "$*" >&2; }
die() { printf '\n[SFWA-WTL-G1] ERROR: %s\n' "$*" >&2; exit 1; }

print_command() {
  printf '[dry-run]'
  printf ' %q' "$@"
  printf '\n'
}

run() {
  if (( DRY_RUN )); then print_command "$@"; else "$@"; fi
}

run_root() {
  if (( EUID == 0 )); then run "$@"
  elif command -v sudo >/dev/null 2>&1; then run sudo "$@"
  else die "Administrator access is required for: $*"
  fi
}

confirm() {
  local prompt="$1" default="${2:-yes}" answer
  if (( ASSUME_YES )); then return 0; fi
  if [[ ! -r /dev/tty ]]; then
    die "An interactive terminal is required. Re-run with --yes for unattended installation."
  fi
  if [[ "$default" == "yes" ]]; then
    read -r -p "$prompt [Y/n] " answer </dev/tty || true
    [[ -z "$answer" || "$answer" =~ ^[Yy]$ ]]
  else
    read -r -p "$prompt [y/N] " answer </dev/tty || true
    [[ "$answer" =~ ^[Yy]$ ]]
  fi
}

usage() {
  cat <<'EOF'
Usage: install.sh [options]

  --yes                 Accept the workstation installation plan.
  --dry-run             Print commands without changing the machine.
  --skip-menu           Do not offer the menu-driven setup phase.
  --local               Use the current/local checkout; never clone.
  --target <directory>  Clone destination (default: ~/SFWA-WTL-G1).
  --repo <url>          Repository URL to clone.
EOF
}

while (($#)); do
  case "$1" in
    --yes|-y) ASSUME_YES=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --skip-menu) SKIP_MENU=1 ;;
    --local) LOCAL_ONLY=1 ;;
    --target) shift; [[ $# -gt 0 ]] || die "--target requires a directory"; TARGET_DIR="$1" ;;
    --repo) shift; [[ $# -gt 0 ]] || die "--repo requires a URL"; REPO_URL="$1" ;;
    --help|-h) usage; exit 0 ;;
    *) die "Unknown option: $1" ;;
  esac
  shift
done

KERNEL="$(uname -s)"
MACHINE="$(uname -m)"
case "$MACHINE" in
  arm64|aarch64) ARCH=arm64 ;;
  x86_64|amd64) ARCH=x64 ;;
  *) die "Unsupported architecture: $MACHINE. Only x64 and ARM64 are supported." ;;
esac

WSL=0
if [[ "$KERNEL" == Linux ]] && { [[ -n "${WSL_DISTRO_NAME:-}" ]] || grep -qiE 'microsoft|wsl' /proc/version 2>/dev/null; }; then WSL=1; fi

DISTRO_ID=""
if [[ -r /etc/os-release ]]; then
  DISTRO_ID="$(. /etc/os-release; printf '%s' "${ID:-}")"
fi

LOCAL_ROOT=""
if [[ -n "${BASH_SOURCE[0]:-}" && -f "${BASH_SOURCE[0]}" ]]; then
  CANDIDATE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." 2>/dev/null && pwd || true)"
  [[ -f "$CANDIDATE/.SYSTEMX/cli/systemx.mjs" ]] && LOCAL_ROOT="$CANDIDATE"
fi
if [[ -z "$LOCAL_ROOT" && -f "$PWD/.SYSTEMX/cli/systemx.mjs" ]]; then LOCAL_ROOT="$PWD"; fi
if (( LOCAL_ONLY )) && [[ -z "$LOCAL_ROOT" ]]; then die "--local requires an SFWA-WTL-G1 checkout as the current directory."; fi

case "$KERNEL" in
  Darwin) PLATFORM="macos-$ARCH" ;;
  Linux)
    if (( WSL )); then PLATFORM="wsl2-$ARCH"
    elif [[ "$DISTRO_ID" == ubuntu ]]; then PLATFORM="ubuntu-$ARCH"
    elif [[ "$DISTRO_ID" == debian ]]; then PLATFORM="debian-$ARCH"
    else PLATFORM="linux-$ARCH"
    fi
    ;;
  *) die "Unsupported operating system: $KERNEL. Windows users must run install.ps1 in PowerShell." ;;
esac

say "Detected $PLATFORM"
printf '%s\n' \
  'Installation plan:' \
  '  - Node.js 24 LTS with vendor SHA-256 verification' \
  '  - Git and GitHub CLI' \
  '  - Visual Studio Code' \
  '  - Google Cloud CLI' \
  '  - Chrome (or Chromium where Google Chrome has no ARM64 Linux package)' \
  '  - Pinned project Firebase CLI and npm dependencies'
if (( WSL )); then printf '%s\n' '  - VS Code + WSL extension and Chrome on the Windows host when WinGet interop is available'; fi

if ! confirm "Install the listed development tools for $PLATFORM?" yes; then
  say "Installation cancelled before any tool changes."
  exit 0
fi

install_node24() {
  local current="" platform archive_pattern temp sums artifact version expected actual install_root extracted
  if command -v node >/dev/null 2>&1; then current="$(node --version 2>/dev/null || true)"; fi
  if [[ "$current" =~ ^v24\. ]]; then say "Node.js $current already satisfies the 24.x contract."; return; fi
  platform="linux"
  [[ "$KERNEL" == Darwin ]] && platform="darwin"
  if (( DRY_RUN )); then
    print_command curl -fsSLO "https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt"
    printf '[dry-run] verify and install the matching Node.js 24 %s-%s archive under ~/.local/share/sfwa-wtl/node\n' "$platform" "$ARCH"
    return
  fi
  temp="$(mktemp -d)"
  sums="$temp/SHASUMS256.txt"
  curl -fsSL "https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt" -o "$sums"
  archive_pattern="node-v24.*-$platform-$ARCH.tar.xz"
  artifact="$(awk -v pattern="$archive_pattern" '$2 ~ pattern {print $2; exit}' "$sums")"
  [[ -n "$artifact" ]] || die "Node.js did not publish a matching $platform-$ARCH archive."
  version="$(printf '%s' "$artifact" | sed -E 's/^node-(v[0-9.]+)-.*$/\1/')"
  expected="$(awk -v file="$artifact" '$2 == file {print $1; exit}' "$sums")"
  curl -fsSL "https://nodejs.org/dist/latest-v24.x/$artifact" -o "$temp/$artifact"
  if command -v sha256sum >/dev/null 2>&1; then actual="$(sha256sum "$temp/$artifact" | awk '{print $1}')"
  else actual="$(shasum -a 256 "$temp/$artifact" | awk '{print $1}')"
  fi
  [[ "$actual" == "$expected" ]] || die "Node.js archive checksum validation failed."
  install_root="$HOME/.local/share/sfwa-wtl/node/$version-$platform-$ARCH"
  extracted="$temp/node-$version-$platform-$ARCH"
  mkdir -p "$install_root" "$HOME/.local/bin"
  tar -xJf "$temp/$artifact" -C "$temp"
  cp -R "$extracted/." "$install_root/"
  for binary in node npm npx corepack; do ln -sfn "$install_root/bin/$binary" "$HOME/.local/bin/$binary"; done
  export PATH="$HOME/.local/bin:$PATH"
  hash -r
  local rc="$HOME/.bashrc"
  [[ "$KERNEL" == Darwin ]] && rc="$HOME/.zshrc"
  touch "$rc"
  if ! grep -q 'SFWA-WTL-G1 user tools' "$rc"; then
    printf '\n# SFWA-WTL-G1 user tools\nexport PATH="$HOME/.local/bin:$PATH"\n' >> "$rc"
  fi
  rm -rf "$temp"
  say "Installed Node.js $(node --version) with a verified vendor checksum."
}

install_macos_tools() {
  if ! command -v brew >/dev/null 2>&1; then
    if (( DRY_RUN )); then
      printf '[dry-run] install Homebrew from https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh\n'
    else
      NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      if [[ -x /opt/homebrew/bin/brew ]]; then eval "$(/opt/homebrew/bin/brew shellenv)"
      elif [[ -x /usr/local/bin/brew ]]; then eval "$(/usr/local/bin/brew shellenv)"
      fi
    fi
  fi
  if (( DRY_RUN )); then
    print_command brew install git gh
    print_command brew install --cask visual-studio-code google-cloud-sdk google-chrome
    return
  fi
  command -v brew >/dev/null 2>&1 || die "Homebrew installation did not make brew available. Open a new terminal and re-run."
  run brew install git gh
  run brew install --cask visual-studio-code google-cloud-sdk google-chrome
}

install_apt_repositories() {
  local temp
  if (( DRY_RUN )); then
    printf '%s\n' \
      '[dry-run] configure signed GitHub CLI apt repository' \
      '[dry-run] configure signed Microsoft VS Code apt repository (amd64/arm64)' \
      '[dry-run] configure signed Google Cloud CLI apt repository'
    if (( ! WSL )) && [[ "$ARCH" == x64 ]]; then
      printf '%s\n' '[dry-run] configure signed Google Chrome apt repository (amd64)'
    fi
    return
  fi
  temp="$(mktemp -d)"
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o "$temp/githubcli.gpg"
  run_root install -m 0644 "$temp/githubcli.gpg" /etc/apt/keyrings/githubcli-archive-keyring.gpg
  printf 'deb [arch=%s signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\n' "$(dpkg --print-architecture)" > "$temp/github-cli.list"
  run_root install -m 0644 "$temp/github-cli.list" /etc/apt/sources.list.d/github-cli.list

  curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o "$temp/microsoft.gpg"
  run_root install -m 0644 "$temp/microsoft.gpg" /usr/share/keyrings/microsoft.gpg
  cat > "$temp/vscode.sources" <<'EOF'
Types: deb
URIs: https://packages.microsoft.com/repos/code
Suites: stable
Components: main
Architectures: amd64 arm64
Signed-By: /usr/share/keyrings/microsoft.gpg
EOF
  run_root install -m 0644 "$temp/vscode.sources" /etc/apt/sources.list.d/vscode.sources

  curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o "$temp/cloud.google.gpg"
  run_root install -m 0644 "$temp/cloud.google.gpg" /usr/share/keyrings/cloud.google.gpg
  printf 'deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main\n' > "$temp/google-cloud-sdk.list"
  run_root install -m 0644 "$temp/google-cloud-sdk.list" /etc/apt/sources.list.d/google-cloud-sdk.list

  if (( ! WSL )) && [[ "$ARCH" == x64 ]]; then
    curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o "$temp/google-chrome.gpg"
    run_root install -m 0644 "$temp/google-chrome.gpg" /usr/share/keyrings/google-chrome.gpg
    printf 'deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main\n' > "$temp/google-chrome.list"
    run_root install -m 0644 "$temp/google-chrome.list" /etc/apt/sources.list.d/google-chrome.list
  fi
  rm -rf "$temp"
}

install_wsl_host_tools() {
  if ! command -v powershell.exe >/dev/null 2>&1; then
    warn "WSL interop is unavailable. Install Windows VS Code and Chrome manually, then re-run diagnostics."
    return
  fi
  local winget_args='--exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity'
  run powershell.exe -NoLogo -NoProfile -Command "winget.exe install --id Microsoft.VisualStudioCode $winget_args"
  run powershell.exe -NoLogo -NoProfile -Command "winget.exe install --id Google.Chrome $winget_args"
  if command -v code >/dev/null 2>&1; then run code --install-extension ms-vscode-remote.remote-wsl --force
  else warn "VS Code was installed on Windows. Restart the WSL terminal, then run: code --install-extension ms-vscode-remote.remote-wsl"
  fi
}

install_apt_tools() {
  run_root apt-get update
  run_root apt-get install -y ca-certificates curl wget git gpg jq unzip xz-utils zip build-essential
  run_root mkdir -p /etc/apt/keyrings /etc/apt/sources.list.d
  install_apt_repositories
  run_root apt-get update
  if (( WSL )); then
    run_root apt-get install -y gh google-cloud-cli
    install_wsl_host_tools
  else
    run_root apt-get install -y gh code google-cloud-cli
    if [[ "$ARCH" == x64 ]]; then
      run_root apt-get install -y google-chrome-stable
    elif [[ "$DISTRO_ID" == ubuntu ]] && command -v snap >/dev/null 2>&1; then
      run_root snap install chromium
    elif apt-cache show chromium >/dev/null 2>&1; then
      run_root apt-get install -y chromium
    else
      warn "No verified Chromium package was found for $PLATFORM. Install a browser from the distribution vendor, then run diagnostics."
    fi
  fi
}

install_dnf_tools() {
  run_root dnf install -y ca-certificates curl git gnupg2 jq unzip xz zip gcc-c++ make
  if command -v dnf5 >/dev/null 2>&1; then
    run_root dnf install -y dnf5-plugins
    run_root dnf config-manager addrepo --from-repofile=https://cli.github.com/packages/rpm/gh-cli.repo
  else
    run_root dnf install -y 'dnf-command(config-manager)'
    run_root dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
  fi
  run_root rpm --import https://packages.microsoft.com/keys/microsoft.asc
  if (( DRY_RUN )); then printf '[dry-run] configure the official VS Code RPM repository\n'
  else
    printf '%s\n' '[code]' 'name=Visual Studio Code' 'baseurl=https://packages.microsoft.com/yumrepos/vscode' 'enabled=1' 'autorefresh=1' 'type=rpm-md' 'gpgcheck=1' 'gpgkey=https://packages.microsoft.com/keys/microsoft.asc' > /tmp/sfwa-vscode.repo
    run_root install -m 0644 /tmp/sfwa-vscode.repo /etc/yum.repos.d/vscode.repo
    rm -f /tmp/sfwa-vscode.repo
  fi
  run_root dnf install -y gh code
  warn "Google Cloud CLI and browser installation need distribution-specific vendor completion on this non-Debian Linux lane. SYSTEMX will report them as optional until verified."
}

if [[ "$KERNEL" == Darwin ]]; then install_macos_tools
elif command -v apt-get >/dev/null 2>&1; then install_apt_tools
elif command -v dnf >/dev/null 2>&1; then install_dnf_tools
else die "No supported package manager found. Automatic Linux installation currently requires apt or dnf."
fi

install_node24

ROOT="$LOCAL_ROOT"
if [[ -z "$ROOT" ]]; then
  ROOT="$TARGET_DIR"
  if [[ -d "$ROOT/.git" ]]; then
    say "Reusing existing checkout at $ROOT; no pull or reset was performed."
  elif [[ -e "$ROOT" && -n "$(ls -A "$ROOT" 2>/dev/null || true)" ]]; then
    die "Target exists and is not an SFWA-WTL-G1 Git checkout: $ROOT"
  else
    run git clone "$REPO_URL" "$ROOT"
  fi
fi

if (( DRY_RUN )); then
  print_command npm ci --prefix "$ROOT"
  print_command node "$ROOT/.SYSTEMX/cli/systemx.mjs" doctor --strict=false --platform "$PLATFORM"
  say "Dry run complete; no machine or repository changes were made."
  exit 0
fi

[[ -f "$ROOT/package.json" ]] || die "Repository package.json not found at $ROOT"
cd "$ROOT"
npm ci --no-audit --no-fund
node .SYSTEMX/cli/systemx.mjs doctor --strict=false

say "Baseline installation and diagnostics are complete."
printf 'Repository: %s\n' "$ROOT"
if (( SKIP_MENU )); then exit 0; fi

if confirm "Proceed to the menu-driven Setup & Tooling phase now?" yes; then
  exec npm run wtl:menu -- --setup-phase
fi
say "Setup was not started. Later, run: cd \"$ROOT\" && npm run wtl:menu -- --setup-phase"
