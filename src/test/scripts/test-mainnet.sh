#!/bin/bash
set -eo pipefail  # -e exits on error, -o pipefail catches errors in pipes

# ROOT_DIR : root directory of the relayer-sdk repo
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

cd $ROOT_DIR

if [ ! -d ".github" ]; then
  echo "Error: .github directory does not exist"
  exit 1
fi

STEPS=22
STEP=0

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: test address --network mainnet ..."
echo "=================================================="

npx . test address --network mainnet

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: pubkey delete --network mainnet ..."
echo "=================================================="

npx . pubkey delete --network mainnet

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: pubkey fetch --network mainnet ..."
echo "=================================================="

npx . pubkey fetch --network mainnet

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: input-proof --values 123:euint32 true:ebool ... --network mainnet --version 1 --json ..."
echo "=================================================="

npx . input-proof --values 123:euint32 true:ebool 1234567890123456789:euint256 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9:eaddress --network mainnet --version 1

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: input-proof --values 123:euint32 true:ebool ... --network mainnet --version 2 --json ..."
echo "=================================================="

npx . input-proof --values 123:euint32 true:ebool 1234567890123456789:euint256 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9:eaddress --network mainnet --version 2

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: test get --type euint32 --network mainnet --json ..."
echo "=================================================="

handle=$(npx . test get --type euint32 --network mainnet --json | jq -r .handle)
echo "🥬 handle: ${handle}"

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: test is-publicly-decryptable --type euint32 --network mainnet --version 2 ..."
echo "=================================================="

npx . test is-publicly-decryptable --type euint32 --network mainnet --version 2

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: public-decrypt --network mainnet --handles $handle --version 1 ..."
echo "=================================================="

npx . public-decrypt --network mainnet --handles $handle --version 1

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: public-decrypt --network mainnet --handles $handle --version 2 ..."
echo "=================================================="

npx . public-decrypt --network mainnet --handles $handle --version 2

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network mainnet --type euint32 --version 1 ..."
echo "========================================================================="

npx . test public-decrypt --network mainnet --types euint32 --version 1

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network mainnet --type euint32 --version 2 ..."
echo "========================================================================="

npx . test public-decrypt --network mainnet --types euint32 --version 2

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test user-decrypt --network mainnet --types euint32 --version 1 ..."
echo "========================================================================="

npx . test user-decrypt --network mainnet --types euint32 --version 1

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: user-decrypt --network mainnet --types euint32 --version 2 ..."
echo "========================================================================="

npx . test user-decrypt --network mainnet --types euint32 --version 2

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test add --network mainnet --type euint32 --value 123 --version 1 ..."
echo "========================================================================="

echo "ignore..."
#npx . test add --network mainnet --type euint32 --value 123 --version 1

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test add --network mainnet --type euint32 --value 123 --version 2 ..."
echo "========================================================================="

echo "ignore..."
#npx . test add --network mainnet --type euint32 --value 123 --version 2

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: test make-publicly-decryptable --types euint32 --network mainnet --version 2 ..."
echo "=================================================="

echo "ignore..."
#npx . test make-publicly-decryptable --type euint32 --network mainnet --version 2

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network mainnet --types ebool euint32 --version 1 ..."
echo "========================================================================="

npx . test public-decrypt --network mainnet --types ebool euint32 --version 1

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network mainnet --types ebool euint32 --version 2 ..."
echo "========================================================================="

npx . test public-decrypt --network mainnet --types ebool euint32 --version 2

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network mainnet --types ebool euint8 euint16 euint32 euint64 euint128 --version 1 ..."
echo "========================================================================="

npx . test public-decrypt --network mainnet --types ebool euint8 euint16 euint32 euint64 euint128 --version 1

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network mainnet --types ebool euint8 euint16 euint32 euint64 euint128 --version 2 ..."
echo "========================================================================="

npx . test public-decrypt --network mainnet --types ebool euint8 euint16 euint32 euint64 euint128 --version 2

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test user-decrypt --network mainnet --types ebool euint8 euint16 euint32 euint64 euint128 --version 1 ..."
echo "========================================================================="

npx . test user-decrypt --network mainnet --types ebool euint8 euint16 euint32 euint64 euint128 --version 1

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test user-decrypt --network mainnet --types ebool euint8 euint16 euint32 euint64 euint128 --version 2 ..."
echo "========================================================================="

npx . test user-decrypt --network mainnet --types ebool euint8 euint16 euint32 euint64 euint128 --version 2

echo ""
echo "=========================="
echo "= ✅ Tests succeeded !   ="
echo "=========================="
