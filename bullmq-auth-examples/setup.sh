#!/bin/bash

set -e

echo "=== BullMQ Authentication Examples Setup ==="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "1. Starting Valkey with authentication..."
docker-compose up -d valkey

echo "2. Waiting for Valkey to be ready..."
sleep 3

echo ""
echo "=== Ready to run examples ==="
echo ""
echo "To run the example WITH glide adapter (shows the bug):"
echo "  cd with-glide-adapter && npm install && npm start"
echo ""
echo "To run the example WITHOUT adapter using iovalkey (works correctly):"
echo "  cd without-adapter && npm install && npm start"
echo ""
echo "To stop Valkey:"
echo "  docker-compose down"
echo ""
