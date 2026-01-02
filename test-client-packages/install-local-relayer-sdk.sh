#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELAYER_SDK_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TGZ_DIR=${RELAYER_SDK_DIR}

cd "${RELAYER_SDK_DIR}"

# Rebuild relayer-sdk
# npm run clean
# npm run build

VERSION=$(jq -r '.version' "${RELAYER_SDK_DIR}/package.json")
NAME=$(jq -r '.name' "${RELAYER_SDK_DIR}/package.json")
NAME=${NAME/@/}
NAME=${NAME//\//-}
TGZ_FILE="${NAME}-${VERSION}.tgz"

echo "relayer-sdk dir:  ${RELAYER_SDK_DIR}"
echo "relayer-sdk file: ${TGZ_FILE}"

# ${SCRIPT_DIR}/rebuild-relayer-sdk.sh

cd ${RELAYER_SDK_DIR}
npm pack

echo "✅ ${RELAYER_SDK_DIR}/${TGZ_FILE}"

# Install the new TGZ in all test-client-packages
TEST_PACKAGES_DIR="${RELAYER_SDK_DIR}/test-client-packages"

for pkg_dir in "${TEST_PACKAGES_DIR}"/*/; do
  if [[ -f "${pkg_dir}package.json" ]]; then
    pkg_name=$(basename "${pkg_dir}")
    echo "📦 Installing in ${pkg_name}..."

    cd "${pkg_dir}"
    npm install "${RELAYER_SDK_DIR}/${TGZ_FILE}"

    echo "✅ ${pkg_name} updated"
  fi
done

echo ""
echo "🎉 All test-client-packages updated with ${TGZ_FILE}"