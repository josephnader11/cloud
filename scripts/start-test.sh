#!/bin/bash
echo "🧪 Starting Test Environment..."
docker compose -f docker-compose.yml -f docker-compose.test.yml \
  --env-file .env.test -p support-test up --build -d
echo "✅ Test environment running!"
echo "🌐 Frontend:    http://localhost:4000"
echo "🎫 Tickets API: http://localhost:6001"