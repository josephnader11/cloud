#!/bin/bash
echo "⚡ Starting Production Environment..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.prod -p support-prod up --build -d
echo "✅ Production environment running!"
echo "🌐 Frontend: http://localhost:80"