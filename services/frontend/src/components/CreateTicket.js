import React, { useState } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_TICKET_API || 'http://localhost:5001';
function CreateTicket({ onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${API}/api/tickets`, form);
      setSuccess(true);
      setTimeout(() => onCreated(), 1500);
    } catch (err) { alert('Failed to create ticket'); }
    setLoading(false);
  };
  if (success) return (
    <div className="card" style={{textAlign:'center', padding:'40px'}}>
      <h2>✅ Ticket Created Successfully!</h2>
      <p>Redirecting to tickets list...</p>
    </div>
  );
  return (
    <div className="card">
      <h2 style={{marginBottom:'20px'}}>➕ Create New Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input type="text" placeholder="Brief description of the issue"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea rows="4" placeholder="Detailed description"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '⏳ Creating...' : '🚀 Submit Ticket'}
        </button>
      </form>
    </div>
  );
}
export default CreateTicket;
