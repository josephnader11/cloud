from flask import Flask, jsonify
from flask_cors import CORS
import pika
import json
import os
import threading

app = Flask(__name__)
CORS(app)

RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672')

# Store notifications in memory
notifications = []

def consume_notifications():
    try:
        connection = pika.BlockingConnection(
            pika.URLParameters(RABBITMQ_URL)
        )
        channel = connection.channel()
        channel.queue_declare(queue='ticket_events')

        def callback(ch, method, properties, body):
            event = json.loads(body)
            notification = {
                'id': len(notifications) + 1,
                'event': event['event'],
                'ticket_id': event['ticket']['id'],
                'message': f"Ticket #{event['ticket']['id']} - {event['event']}",
                'status': 'sent'
            }
            notifications.append(notification)
            print(f"🔔 Notification sent: {notification['message']}")

        channel.basic_consume(
            queue='ticket_events',
            on_message_callback=callback,
            auto_ack=True
        )
        channel.start_consuming()
    except Exception as e:
        print(f"RabbitMQ error: {e}")

# Start consumer thread
thread = threading.Thread(target=consume_notifications, daemon=True)
thread.start()

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'notification-service'
    })

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    return jsonify(notifications)

@app.route('/metrics')
def metrics():
    return f"""
# HELP notifications_sent_total Total notifications sent
# TYPE notifications_sent_total counter
notifications_sent_total {len(notifications)}
""", 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5003))
    print(f"🔔 Notification Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', False))