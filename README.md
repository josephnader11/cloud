# 🎫 Customer Support Ticketing System

## 📌 Table of Contents
1. [Project Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Project Structure](#project-structure)
6. [Environment Setup](#environment-setup)
7. [Running with Docker Compose](#docker-compose)
8. [Kubernetes Deployment](#kubernetes)
9. [Monitoring](#monitoring)
10. [API Documentation](#api-docs)

---

## 📌 Project Overview
A microservices-based Customer Support Ticketing System that allows
users to submit tickets, track status, and receive responses from
support agents. Built with Docker, Docker Compose, and Kubernetes.

---

## 🏗️ Architecture
```
                    ┌─────────────┐
                    │   Frontend  │
                    │  (React)    │
                    └──────┬──────┘
                           │ HTTP
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼─────┐  ┌───────▼──────┐  ┌─────▼────────┐
   │  Ticket    │  │   Support    │  │  Reporting   │
   │  Service   │  │   Service    │  │   Service    │
   │ (Node.js)  │  │  (Python)    │  │  (Python)    │
   └──────┬─────┘  └───────┬──────┘  └─────▲────────┘
          │                │               │
          │         ┌──────▼──────┐        │
          │         │  RabbitMQ   │        │
          │         │  (Broker)   │        │
          │         └──────┬──────┘        │
          │                │               │
          │    ┌───────────▼────────┐      │
          │    │  Notification      │      │
          │    │  Service (Python)  │      │
          │    └────────────────────┘      │
          │                                │
   ┌──────▼─────────────────────────────── ┘
   │         PostgreSQL Database           │
   └───────────────────────────────────────┘
```

---

## 🛠️ Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | React.js + Nginx |
| Ticket Service | Node.js + Express |
| Support Service | Python + Flask |
| Notification Service | Python + Flask |
| Reporting Service | Python + Flask |
| Database | PostgreSQL |
| Message Broker | RabbitMQ |
| Monitoring | Prometheus + Grafana |
| Containerization | Docker |
| Orchestration | Kubernetes |

---

## ✅ Prerequisites
- Linux (Ubuntu 22.04 LTS / WSL2)
- Docker >= 24.x
- Docker Compose >= 2.x
- kubectl >= 1.28
- Minikube >= 1.30
- Node.js >= 18.x (for local dev)
- Python >= 3.11 (for local dev)

---

## 📂 Project Structure
```
customer-support-system/
├── services/
│   ├── frontend/
│   ├── ticket-service/
│   ├── support-service/
│   ├── notification-service/
│   └── reporting-service/
├── monitoring/
│   ├── prometheus/
│   └── grafana/
├── k8s/
│   ├── namespaces/
│   ├── configmaps/
│   ├── deployments/
│   └── services/
├── scripts/
├── .env.dev
├── .env.test
├── .env.prod
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.test.yml
├── docker-compose.prod.yml
└── README.md
```

---

## 🚀 Running with Docker Compose

### Development
```bash
bash scripts/start-dev.sh
```
### Testing
```bash
bash scripts/start-test.sh
```
### Production
```bash
bash scripts/start-prod.sh
```
### All Environments At Once
```bash
bash scripts/start-all.sh
```

---

## 🌐 Service URLs

### Development
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Ticket API | http://localhost:5001 |
| Support API | http://localhost:5002 |
| Notification API | http://localhost:5003 |
| Reporting API | http://localhost:5004 |
| RabbitMQ UI | http://localhost:15672 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

---

## ☸️ Kubernetes Deployment
```bash
# Start Minikube
minikube start --driver=docker

# Apply all configs
kubectl apply -f k8s/namespaces/
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/

# Check status
kubectl get all -n support-prod
```

---

## 📊 API Documentation

### Ticket Service (Port 5001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tickets | Get all tickets |
| GET | /api/tickets/:id | Get ticket by ID |
| POST | /api/tickets | Create new ticket |
| PUT | /api/tickets/:id | Update ticket |
| DELETE | /api/tickets/:id | Delete ticket |
| GET | /health | Health check |

### Support Service (Port 5002)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/support/tickets | Get all tickets with assignments |
| POST | /api/support/assign/:id | Assign ticket to agent |
| POST | /api/support/resolve/:id | Resolve a ticket |
| GET | /health | Health check |

### Notification Service (Port 5003)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get all notifications |
| GET | /health | Health check |

### Reporting Service (Port 5004)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/summary | Get tickets summary |
| GET | /api/reports/by-status | Get tickets by status |
| GET | /health | Health check |