#!/bin/bash
set -eo pipefail  # -e exits on error, -o pipefail catches errors in pipes

# ROOT_DIR : root directory of the relayer-sdk repo
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

cd $ROOT_DIR

if [ ! -d ".github" ]; then
  echo "Error: .github directory does not exist"
  exit 1
fi

STEPS=8

echo ""
echo "=================================================="
echo "= 1/${STEPS} Get Addresses ..."
echo "=================================================="

npx . test address --network testnet

echo ""
echo "=================================================="
echo "= 2/${STEPS} Get euint32 handle ..."
echo "=================================================="

handle=$(npx . test get --type euint32 --network testnet --json | jq -r .handle)
echo "🥬 handle: ${handle}"

echo ""
echo "=================================================="
echo "= 3/${STEPS} Run public-decrypt v1 ..."
echo "=================================================="
npx . public-decrypt --network testnet --handles $handle --version 1

echo ""
echo "=================================================="
echo "= 4/${STEPS} Run public-decrypt v2 ..."
echo "=================================================="
npx . public-decrypt --network testnet --handles $handle --version 2

echo ""
echo "========================================================================="
echo "= 5/${STEPS} Run test public-decrypt --type euint32 --version 1 ..."
echo "========================================================================="
npx . test public-decrypt --network testnet --type euint32 --version 1

echo ""
echo "========================================================================="
echo "= 6/${STEPS} Run test public-decrypt --type euint32 --version 2 ..."
echo "========================================================================="
npx . test public-decrypt --network testnet --type euint32 --version 2

echo ""
echo "========================================================================="
echo "= 7/${STEPS} Run test user-decrypt --type euint32 --version 1 ..."
echo "========================================================================="
npx . test user-decrypt --network testnet --type euint32 --version 1

echo ""
echo "========================================================================="
echo "= 8/${STEPS} Run test user-decrypt --type euint32 --version 2 ..."
echo "========================================================================="
npx . test user-decrypt --network testnet --type euint32 --version 2

echo ""
echo "=========================="
echo "= ✅ Tests succeeded !   ="
echo "=========================="
