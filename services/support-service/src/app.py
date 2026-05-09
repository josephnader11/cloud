from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pika
import json
import os
import threading
import time

app = Flask(__name__)
CORS(app)

TICKET_SERVICE_URL = os.getenv('TICKET_SERVICE_URL', 'http://ticket-service:5001')
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672')

assignments = {}

def consume_events():
    while True:
        try:
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()
            channel.queue_declare(queue='ticket_events', durable=True)

            def callback(ch, method, properties, body):
                event = json.loads(body)
                print(f"📨 Received event: {event['event']}")
                if event['event'] == 'TICKET_CREATED':
                    ticket_id = event['ticket']['id']
                    assignments[ticket_id] = {
                        'agent': 'auto-assigned-agent',
                        'status': 'assigned'
                    }

            channel.basic_consume(queue='ticket_events', on_message_callback=callback, auto_ack=True)
            channel.start_consuming()
        except Exception as e:
            print(f"RabbitMQ error: {e}, retrying in 5s...")
            time.sleep(5)

thread = threading.Thread(target=consume_events, daemon=True)
thread.start()

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'support-service'})

@app.route('/api/support/tickets', methods=['GET'])
def get_all_tickets():
    try:
        response = requests.get(f'{TICKET_SERVICE_URL}/api/tickets')
        tickets = response.json()
        for ticket in tickets:
            tid = ticket['id']
            ticket['assignment'] = assignments.get(tid, {'agent': 'unassigned', 'status': 'pending'})
        return jsonify(tickets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/support/assign/<int:ticket_id>', methods=['POST'])
def assign_ticket(ticket_id):
    data = request.json
    agent = data.get('agent', 'default-agent')
    assignments[ticket_id] = {'agent': agent, 'status': 'assigned'}
    return jsonify({'message': f'Ticket {ticket_id} assigned to {agent}', 'assignment': assignments[ticket_id]})

@app.route('/api/support/resolve/<int:ticket_id>', methods=['POST'])
def resolve_ticket(ticket_id):
    try:
        # First get the full ticket details
        get_response = requests.get(f'{TICKET_SERVICE_URL}/api/tickets/{ticket_id}')
        if get_response.status_code != 200:
            return jsonify({'error': 'Ticket not found'}), 404
        ticket = get_response.json()

        # Now update with all required fields
        response = requests.put(
            f'{TICKET_SERVICE_URL}/api/tickets/{ticket_id}',
            json={
                'title': ticket['title'],
                'description': ticket['description'],
                'status': 'resolved',
                'priority': ticket['priority']
            }
        )
        assignments[ticket_id] = {
            'agent': assignments.get(ticket_id, {}).get('agent', 'unknown'),
            'status': 'resolved'
        }
        return jsonify({'message': f'Ticket {ticket_id} resolved'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/metrics')
def metrics():
    return f"""# HELP support_assignments_total Total assignments
# TYPE support_assignments_total counter
support_assignments_total {len(assignments)}
""", 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    print(f"🛠️ Support Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', False))
