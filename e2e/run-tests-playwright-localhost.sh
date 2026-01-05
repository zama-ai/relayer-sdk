#!/usr/bin/env bash

set -euo pipefail # Exit on error, undefined vars, and pipe errors

SERVE_PORT=5173
SERVE_HOST=127.0.0.1
SERVE_URL="http://${SERVE_HOST}:${SERVE_PORT}"
TIMEOUT_SECONDS=60 # Max time to wait for serve to start
CHECK_INTERVAL_SECONDS=1 # How often to poll the node

echo "--- Starting ${SERVE_URL} in background ---"
# Start serve in the background, redirecting output to a log file
# Or /dev/null if you want to suppress all output from the node itself
npm run serve:cdn &> /dev/null &
SERVE_PID_ROOT=$! # Get the PID of the background process

echo "Serve started with PID: $SERVE_PID_ROOT. Waiting for it to be ready..."

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

SERVE_PID=$(lsof -i :${SERVE_PORT} -t)

if [ $ATTEMPTS -eq $TIMEOUT_SECONDS ]; then
    echo "Error: Serve did not start within $TIMEOUT_SECONDS seconds."
    kill "$SERVE_PID_ROOT" # Kill the process if it didn't start
    kill "$SERVE_PID" || true
    exit 1
fi

# --- Run tests ---
echo "--- Running Playwright tests against external ${SERVE_URL} ---"
npm run test:playwright || true

# Capture the test exit code 
TEST_EXIT_CODE=$?

# --- Kill serve ---
echo "--- Killing serve (PID: $SERVE_PID_ROOT) ---"
if ps -p "$SERVE_PID_ROOT" > /dev/null 2>&1; then
  echo "Process $SERVE_PID_ROOT is running. Killing..."
  kill "$SERVE_PID_ROOT"
else
  echo "Process $SERVE_PID_ROOT is not running."
fi

if ps -p "$SERVE_PID" > /dev/null 2>&1; then
  echo "Process $SERVE_PID is running. Killing..."
  kill "$SERVE_PID"
else
  echo "Process $SERVE_PID is not running."
fi

# --- Add extra sleep (to avoid possible conflict with next server instance launch) ---
sleep 1

# Exit with the same exit code 
exit "$TEST_EXIT_CODE"