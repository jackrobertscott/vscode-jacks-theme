#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/publish-marketplace.sh [--allow-dirty] [--no-local-install] [-- VSCE_PUBLISH_ARGS...]

Runs the Marketplace publishing workflow:
  1. require a clean worktree unless --allow-dirty is set
  2. run scripts/finish-work.sh without installing during preflight
  3. publish the package with vsce publish --allow-missing-repository
  4. reinstall the just-published VSIX locally when the current install looks like a local VSIX install

Additional arguments after -- are passed to vsce publish, for example:
  scripts/publish-marketplace.sh -- --pat "$VSCE_PAT"
USAGE
}

allow_dirty=0
local_install=1
publish_args=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --allow-dirty)
      allow_dirty=1
      shift
      ;;
    --no-local-install)
      local_install=0
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      publish_args=("$@")
      break
      ;;
    *)
      publish_args+=("$1")
      shift
      ;;
  esac
done

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

run() {
  printf '\n==> %s\n' "$*"
  "$@"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: required command not found: $1" >&2
    exit 1
  fi
}

assert_clean_worktree() {
  if [[ "$allow_dirty" -eq 1 ]]; then
    return
  fi

  if [[ -n "$(git status --porcelain)" ]]; then
    echo "error: worktree must be clean before publishing. Commit or stash changes, or pass --allow-dirty." >&2
    git status --short >&2
    exit 1
  fi
}

is_local_vsix_install() {
  node --input-type=module <<'NODE'
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const extensionId = `${packageJson.publisher}.${packageJson.name}`;
const extensionRoot = join(homedir(), ".vscode", "extensions");

if (!existsSync(extensionRoot)) process.exit(1);

const compareVersions = (left, right) => {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10) || 0);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
};

let activeVersion;
try {
  const installedExtensions = execFileSync("code", ["--list-extensions", "--show-versions"], { encoding: "utf8" });
  const activeLine = installedExtensions
    .split(/\r?\n/)
    .find((line) => line.toLowerCase().startsWith(`${extensionId.toLowerCase()}@`));
  activeVersion = activeLine?.slice(extensionId.length + 1);
} catch {
  // Fall back to the highest installed extension directory below.
}

const matchingPackages = readdirSync(extensionRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith(`${extensionId}-`))
  .map((entry) => join(extensionRoot, entry.name, "package.json"))
  .filter((filePath) => existsSync(filePath))
  .map((packagePath) => JSON.parse(readFileSync(packagePath, "utf8")))
  .filter((installedPackage) => installedPackage.name === packageJson.name);

const activePackage = activeVersion
  ? matchingPackages.find((installedPackage) => installedPackage.version === activeVersion)
  : matchingPackages.sort((left, right) => compareVersions(right.version, left.version))[0];

if (!activePackage) process.exit(1);

const metadata = activePackage.__metadata ?? {};
process.exit(!metadata.id || !metadata.publisherId ? 0 : 1);
NODE
}

require_command git
require_command vsce

assert_clean_worktree

temp_dir="$(mktemp -d)"
vsix_path="$temp_dir/jacks-theme.vsix"
cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT

run scripts/finish-work.sh --no-install --vsix "$vsix_path"
assert_clean_worktree

if [[ ${#publish_args[@]} -gt 0 ]]; then
  run vsce publish --allow-missing-repository "${publish_args[@]}"
else
  run vsce publish --allow-missing-repository
fi

if [[ "$local_install" -eq 1 ]]; then
  if is_local_vsix_install; then
    require_command code
    run code --install-extension "$vsix_path" --force
  else
    printf '\n==> skipped local VSIX reinstall (installed extension appears to have Marketplace metadata)\n'
  fi
else
  printf '\n==> skipped local VSIX reinstall (--no-local-install)\n'
fi

printf '\nMarketplace publish workflow completed successfully.\n'
