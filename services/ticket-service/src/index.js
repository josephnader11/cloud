const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const amqp = require('amqplib');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'ticket-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ticketsdb',
  user: process.env.DB_USER || 'ticketuser',
  password: process.env.DB_PASSWORD || 'ticketpass',
});

// RabbitMQ connection
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'
    );
    channel = await connection.createChannel();
    await channel.assertQueue('ticket_events');
    console.log('✅ Connected to RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connection failed, retrying...', err.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

// Initialize DB
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('DB init failed, retrying...', err.message);
    setTimeout(initDB, 5000);
  }
}

// Routes
// GET all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tickets ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single ticket
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE id = \$1',
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Ticket not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create ticket
app.post('/api/tickets', async (req, res) => {
  const { title, description, priority } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tickets (title, description, priority)
       VALUES (\$1, \$2, \$3) RETURNING *`,
      [title, description, priority || 'medium']
    );
    const ticket = result.rows[0];

    // Publish event to RabbitMQ
    if (channel) {
      channel.sendToQueue(
        'ticket_events',
        Buffer.from(JSON.stringify({
          event: 'TICKET_CREATED',
          ticket
        }))
      );
    }
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update ticket
app.put('/api/tickets/:id', async (req, res) => {
  const { title, description, status, priority } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tickets SET title=\$1, description=\$2,
       status=\$3, priority=\$4, updated_at=NOW()
       WHERE id=\$5 RETURNING *`,
      [title, description, status, priority, req.params.id]
    );
    const ticket = result.rows[0];

    // Publish event to RabbitMQ
    if (channel) {
      channel.sendToQueue(
        'ticket_events',
        Buffer.from(JSON.stringify({
          event: 'TICKET_UPDATED',
          ticket
        }))
      );
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tickets WHERE id = \$1', [req.params.id]);
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ticket-service' });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP ticket_service_requests_total Total requests
# TYPE ticket_service_requests_total counter
ticket_service_requests_total 1
  `);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`🎫 Ticket Service running on port ${PORT}`);
  await initDB();
  await connectRabbitMQ();
});