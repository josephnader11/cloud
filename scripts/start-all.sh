#!/bin/bash
echo "🚀 Starting ALL Environments..."
bash scripts/start-dev.sh
bash scripts/start-test.sh
bash scripts/start-prod.sh
echo "✅ ALL environments are running!"