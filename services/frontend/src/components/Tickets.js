import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_TICKET_API || 'http://localhost:5001';
const SUPPORT_API = process.env.REACT_APP_SUPPORT_API || 'http://localhost:5002';
function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API}/api/tickets`);
      setTickets(res.data);
      setLoading(false);
    } catch (err) { setError('Failed to load tickets'); setLoading(false); }
  };
  useEffect(() => { fetchTickets(); }, []);
  const resolveTicket = async (id) => {
    try { await axios.post(`${SUPPORT_API}/api/support/resolve/${id}`); fetchTickets(); }
    catch (err) { alert('Failed to resolve ticket'); }
  };
  const deleteTicket = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try { await axios.delete(`${API}/api/tickets/${id}`); fetchTickets(); }
    catch (err) { alert('Failed to delete ticket'); }
  };
  if (loading) return <div className="loading">⏳ Loading tickets...</div>;
  if (error) return <div className="error">❌ {error}</div>;
  return (
    <div>
      <h2 style={{marginBottom:'20px'}}>🎫 All Tickets ({tickets.length})</h2>
      {tickets.length === 0 && <div className="card"><p>No tickets found. Create your first ticket!</p></div>}
      {tickets.map(ticket => (
        <div className="card" key={ticket.id}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <div>
              <h3>#{ticket.id} — {ticket.title}</h3>
              <p style={{color:'#666', margin:'8px 0'}}>{ticket.description}</p>
              <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                <span className={`badge ${ticket.status}`}>{ticket.status}</span>
                <span className={`badge ${ticket.priority}`}>{ticket.priority}</span>
              </div>
              <p style={{fontSize:'12px', color:'#999', marginTop:'8px'}}>
                Created: {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              {ticket.status !== 'resolved' && (
                <button className="btn btn-success" onClick={() => resolveTicket(ticket.id)}>✅ Resolve</button>
              )}
              <button className="btn btn-danger" onClick={() => deleteTicket(ticket.id)}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default Tickets;
