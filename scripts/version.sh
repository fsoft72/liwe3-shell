#!/usr/bin/env bash
# Bumps patch version in index.js and package.json, or forces a specific version.
# Usage: ./scripts/version.sh [NEW_VERSION]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_JSON="$ROOT_DIR/package.json"
INDEX_JS="$ROOT_DIR/index.js"

current_version() {
	node -p "require('$PACKAGE_JSON').version"
}

bump_patch() {
	local ver="$1"
	local major minor patch
	IFS='.' read -r major minor patch <<< "$ver"
	echo "$major.$minor.$((patch + 1))"
}

validate_semver() {
	[[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

CURRENT="$(current_version)"

if [ $# -ge 1 ]; then
	NEW_VERSION="$1"
	if ! validate_semver "$NEW_VERSION"; then
		echo "ERROR: '$NEW_VERSION' is not a valid semver (expected X.Y.Z)" >&2
		exit 1
	fi
else
	NEW_VERSION="$(bump_patch "$CURRENT")"
fi

echo "Updating version: $CURRENT -> $NEW_VERSION"

# Update package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 2) + '\n');
"

# Update VERSION constant in index.js
sed -i "s/const VERSION = \"$CURRENT\"/const VERSION = \"$NEW_VERSION\"/" "$INDEX_JS"

# Verify both were updated
UPDATED_PKG="$(current_version)"
UPDATED_JS="$(grep -oP '(?<=const VERSION = \")[^\"]+' "$INDEX_JS")"

if [ "$UPDATED_PKG" != "$NEW_VERSION" ] || [ "$UPDATED_JS" != "$NEW_VERSION" ]; then
	echo "ERROR: Version mismatch after update!" >&2
	echo "  package.json: $UPDATED_PKG" >&2
	echo "  index.js:     $UPDATED_JS" >&2
	exit 1
fi

echo "Done. package.json and index.js are now at $NEW_VERSION"
