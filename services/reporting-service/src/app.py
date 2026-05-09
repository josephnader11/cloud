from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

TICKET_SERVICE_URL = os.getenv('TICKET_SERVICE_URL',
                                'http://ticket-service:5001')

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'reporting-service'
    })

@app.route('/api/reports/summary', methods=['GET'])
def get_summary():
    try:
        response = requests.get(f'{TICKET_SERVICE_URL}/api/tickets')
        tickets = response.json()

        total = len(tickets)
        open_tickets = len([t for t in tickets if t['status'] == 'open'])
        resolved = len([t for t in tickets if t['status'] == 'resolved'])
        high_priority = len([t for t in tickets if t['priority'] == 'high'])

        return jsonify({
            'generated_at': datetime.now().isoformat(),
            'total_tickets': total,
            'open_tickets': open_tickets,
            'resolved_tickets': resolved,
            'high_priority_tickets': high_priority,
            'resolution_rate': f"{(resolved/total*100):.1f}%" if total > 0 else "0%"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/by-status', methods=['GET'])
def get_by_status():
    try:
        response = requests.get(f'{TICKET_SERVICE_URL}/api/tickets')
        tickets = response.json()

        status_counts = {}
        for ticket in tickets:
            status = ticket['status']
            status_counts[status] = status_counts.get(status, 0) + 1

        return jsonify({
            'generated_at': datetime.now().isoformat(),
            'by_status': status_counts
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/metrics')
def metrics():
    return """
# HELP reporting_requests_total Total report requests
# TYPE reporting_requests_total counter
reporting_requests_total 1
""", 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5004))
    print(f"📊 Reporting Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', False))
