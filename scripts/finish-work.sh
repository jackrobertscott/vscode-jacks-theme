#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/finish-work.sh [--no-install] [--vsix PATH]

Runs the standard end-of-change workflow:
  1. regenerate the extension output from TypeScript sources
  2. run the required TypeScript no-emit check
  3. verify package, lockfile, changelog, and version badges agree
  4. package a VSIX without hard-coding the versioned filename
  5. install the packaged VSIX into local VS Code unless --no-install is set
USAGE
}

install_extension=1
vsix_path=""
temp_dir=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-install)
      install_extension=0
      shift
      ;;
    --vsix)
      if [[ $# -lt 2 || -z "${2:-}" ]]; then
        echo "error: --vsix requires a path" >&2
        exit 2
      fi
      vsix_path="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 2
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

require_command npm
require_command node
require_command vsce

if [[ -z "$vsix_path" ]]; then
  temp_dir="$(mktemp -d)"
  vsix_path="$temp_dir/jacks-theme.vsix"
else
  mkdir -p "$(dirname "$vsix_path")"
fi

cleanup() {
  if [[ -n "$temp_dir" ]]; then
    rm -rf "$temp_dir"
  fi
}
trap cleanup EXIT

run npm run generate
run npx tsc --noEmit

printf '\n==> verifying version metadata\n'
node --input-type=module <<'NODE'
import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const lockJson = JSON.parse(readFileSync("package-lock.json", "utf8"));
const changelog = readFileSync("CHANGELOG.md", "utf8");
const readme = readFileSync("README.md", "utf8");
const version = packageJson.version;
const failures = [];

if (lockJson.version !== version) {
  failures.push(`package-lock.json version ${lockJson.version} does not match package.json ${version}`);
}

const lockRootVersion = lockJson.packages?.[""]?.version;
if (lockRootVersion !== version) {
  failures.push(`package-lock.json packages[""].version ${lockRootVersion} does not match package.json ${version}`);
}

const changelogHeading = new RegExp(`^## ${version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} - \\d{4}-\\d{2}-\\d{2}$`, "m");
if (!changelogHeading.test(changelog)) {
  failures.push(`CHANGELOG.md is missing a top-level heading for ${version}`);
}

const expectedBadgeFragment = `version-${version}-`;
const packageVersionBadge = packageJson.badges?.find((badge) =>
  typeof badge?.description === "string" && badge.description.toLowerCase().includes("version"),
);
if (!packageVersionBadge?.url?.includes(expectedBadgeFragment)) {
  failures.push(`package.json version badge URL must include ${expectedBadgeFragment}`);
}

if (!readme.includes(`img.shields.io/badge/version-${version}-`)) {
  failures.push(`README.md version badge must reference ${version}`);
}

if (failures.length) {
  for (const failure of failures) console.error(`error: ${failure}`);
  process.exit(1);
}

console.log(`version metadata is consistent for ${version}`);
NODE

run vsce package --allow-missing-repository --out "$vsix_path"

if [[ "$install_extension" -eq 1 ]]; then
  require_command code
  run code --install-extension "$vsix_path" --force
else
  printf '\n==> skipped local VS Code install (--no-install)\n'
fi

printf '\nFinish workflow completed successfully.\n'
