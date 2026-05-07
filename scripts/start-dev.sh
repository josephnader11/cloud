#!/bin/bash
echo "🚀 Starting Development Environment..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml \
  --env-file .env.dev -p support-dev up --build -d
echo "✅ Dev environment running!"
echo "🌐 Frontend:    http://localhost:3000"
echo "🎫 Tickets API: http://localhost:5001"
echo "📊 Grafana:     http://localhost:3001"
echo "🐰 RabbitMQ:    http://localhost:15672"