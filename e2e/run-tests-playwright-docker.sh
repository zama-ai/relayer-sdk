#!/usr/bin/env bash

set -euo pipefail # Exit on error, undefined vars, and pipe errors

SERVE_PORT=5173
SERVE_HOST=test.cdn.zama.ai
SERVE_URL="http://${SERVE_HOST}:${SERVE_PORT}"
TIMEOUT_SECONDS=60 # Max time to wait for serve to start
CHECK_INTERVAL_SECONDS=1 # How often to poll the node

echo "--- Starting ${SERVE_URL} in background ---"

# Start serve in the background, redirecting output to a log file
# Or /dev/null if you want to suppress all output from the node itself
npm run docker:up

# --- Wait for Hardhat Node to be ready ---
ATTEMPTS=0
while [ $ATTEMPTS -lt $TIMEOUT_SECONDS ]; do
    if curl -fsS -I --connect-timeout 2 -m 5 "${SERVE_URL}/libs/relayer-sdk-js/relayer-sdk-js.umd.cjs" > /dev/null 2>&1; then
        echo "Serve is ready!"
        break
    fi
    echo "Waiting for serve... (Attempt $((ATTEMPTS+1))/$TIMEOUT_SECONDS)"
    sleep "$CHECK_INTERVAL_SECONDS"
    ATTEMPTS=$((ATTEMPTS+1))
done

if [ $ATTEMPTS -eq $TIMEOUT_SECONDS ]; then
    echo "Error: Serve did not start within $TIMEOUT_SECONDS seconds."
    npm run docker:down
    exit 1
fi

sleep 1

# --- Run tests ---
echo "--- Running Playwright tests against external ${SERVE_URL} ---"
npm run test:playwright:docker || true

# Capture the test exit code 
TEST_EXIT_CODE=$?

sleep 1

# --- Kill serve ---
npm run docker:down

# --- Add extra sleep (to avoid possible conflict with next server instance launch) ---
sleep 1

# Exit with the same exit code 
exit "$TEST_EXIT_CODE"