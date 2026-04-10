#!/bin/bash
set -eo pipefail  # -e exits on error, -o pipefail catches errors in pipes

# ROOT_DIR : root directory of the relayer-sdk repo
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

cd $ROOT_DIR

network="devnet"

if [ ! -d ".github" ]; then
  echo "Error: .github directory does not exist"
  exit 1
fi

STEPS=14
STEP=0

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: test address --network $network ..."
echo "=================================================="

npx . test address --network $network

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: pubkey delete --network $network ..."
echo "=================================================="

npx . pubkey delete --network $network 

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: pubkey fetch --network $network ..."
echo "=================================================="

npx . pubkey fetch --network $network

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: input-proof --values 123:euint32 true:ebool ... --network $network --json ..."
echo "=================================================="

npx . input-proof --values 123:euint32 true:ebool 1234567890123456789:euint256 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9:eaddress --network $network

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: test get --type euint32 --network $network --json ..."
echo "=================================================="

handle=$(npx . test get --type euint32 --network $network --json | jq -r .handle)
echo "🥬 handle: ${handle}"

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: test make-publicly-decryptable --type euint32 --network $network ..."
echo "=================================================="
npx . test make-publicly-decryptable --type euint32 --network $network

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: public-decrypt --network $network --handles $handle ..."
echo "=================================================="
npx . public-decrypt --network $network --handles $handle

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network $network --type euint32 ..."
echo "========================================================================="
npx . test public-decrypt --network $network --types euint32

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: user-decrypt --network $network --types euint32 ..."
echo "========================================================================="
npx . test user-decrypt --network $network --types euint32

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test add --network $network --type euint32 --value 123 ..."
echo "========================================================================="
npx . test add --network $network --type euint32 --value 123

echo ""
echo "=================================================="
echo "= $((++STEP))/${STEPS} Run: test make-publicly-decryptable --types euint32 --network $network ..."
echo "=================================================="
npx . test make-publicly-decryptable --type euint32 --network $network

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network $network --types ebool euint32 ..."
echo "========================================================================="
npx . test public-decrypt --network $network --types ebool euint32

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test public-decrypt --network $network --types ebool euint8 euint16 euint32 euint64 euint128 ..."
echo "========================================================================="
npx . test public-decrypt --network $network --types ebool euint8 euint16 euint32 euint64 euint128

echo ""
echo "========================================================================="
echo "= $((++STEP))/${STEPS} Run: test user-decrypt --network $network --types ebool euint8 euint16 euint32 euint64 euint128 ..."
echo "========================================================================="
npx . test user-decrypt --network $network --types ebool euint8 euint16 euint32 euint64 euint128

echo ""
echo "=========================="
echo "= ✅ Tests succeeded !   ="
echo "=========================="
