import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_REPORTING_API || 'http://localhost:5004';
function Reports() {
  const [summary, setSummary] = useState(null);
  const [byStatus, setByStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, b] = await Promise.all([
          axios.get(`${API}/api/reports/summary`),
          axios.get(`${API}/api/reports/by-status`)
        ]);
        setSummary(s.data); setByStatus(b.data);
      } catch (err) { console.error('Failed to load reports'); }
      setLoading(false);
    };
    fetchData();
  }, []);
  if (loading) return <div className="loading">⏳ Loading reports...</div>;
  return (
    <div>
      <h2 style={{marginBottom:'20px'}}>📊 Reports & Analytics</h2>
      {summary && (
        <>
          <div className="stats-grid">
            <div className="stat-card"><h2>{summary.total_tickets}</h2><p>Total Tickets</p></div>
            <div className="stat-card"><h2>{summary.open_tickets}</h2><p>Open Tickets</p></div>
            <div className="stat-card"><h2>{summary.resolved_tickets}</h2><p>Resolved</p></div>
            <div className="stat-card"><h2>{summary.high_priority_tickets}</h2><p>High Priority</p></div>
            <div className="stat-card"><h2>{summary.resolution_rate}</h2><p>Resolution Rate</p></div>
          </div>
          <div className="card">
            <p style={{color:'#999', fontSize:'12px'}}>
              📅 Generated: {new Date(summary.generated_at).toLocaleString()}
            </p>
          </div>
        </>
      )}
      {byStatus && (
        <div className="card">
          <h3 style={{marginBottom:'15px'}}>📈 Tickets by Status</h3>
          {Object.entries(byStatus.by_status).map(([status, count]) => (
            <div key={status} style={{display:'flex', justifyContent:'space-between',
              padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <span className={`badge ${status}`}>{status}</span>
              <strong>{count} tickets</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Reports;
