#!/bin/bash

set -e

echo "=== BullMQ Authentication Comparison ==="
echo ""

# Start Valkey if not already running
if ! docker ps | grep -q bullmq-example-valkey; then
    echo "Starting Valkey..."
    docker-compose up -d valkey
    sleep 3
fi

echo "Running both examples to demonstrate the difference..."
echo ""

# Run with glide adapter
echo "================================================"
echo "1. Running WITH valkey-glide-ioredis-adapter"
echo "================================================"
cd with-glide-adapter
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install > /dev/null 2>&1
fi
echo ""
npm start 2>&1 | tee glide-output.log
echo ""
echo "Output saved to with-glide-adapter/glide-output.log"
echo ""

# Run without adapter
cd ../without-adapter
echo "================================================"
echo "2. Running WITHOUT adapter (using iovalkey)"
echo "================================================"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install > /dev/null 2>&1
fi
echo ""
npm start 2>&1 | tee iovalkey-output.log
echo ""
echo "Output saved to without-adapter/iovalkey-output.log"
echo ""

# Summary
cd ..
echo "================================================"
echo "SUMMARY"
echo "================================================"
echo ""
echo "WITH glide adapter:"
if grep -q "NOAUTH" with-glide-adapter/glide-output.log; then
    echo "  ❌ Authentication errors found (NOAUTH)"
else
    echo "  ✅ No authentication errors"
fi
echo ""
echo "WITHOUT adapter (iovalkey):"
if grep -q "NOAUTH" without-adapter/iovalkey-output.log; then
    echo "  ❌ Authentication errors found (NOAUTH)"
else
    echo "  ✅ No authentication errors"
fi
echo ""
echo "This demonstrates that valkey-glide-ioredis-adapter v0.4.0"
echo "has a bug where duplicated connections don't authenticate properly."
echo ""
