import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_NOTIFICATION_API || 'http://localhost:5003';
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/api/notifications`);
        setNotifications(res.data);
      } catch (err) { console.error('Failed to load'); }
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);
  if (loading) return <div className="loading">⏳ Loading notifications...</div>;
  return (
    <div>
      <h2 style={{marginBottom:'20px'}}>🔔 Notifications ({notifications.length})</h2>
      {notifications.length === 0 && (
        <div className="card"><p>No notifications yet. Create a ticket to see notifications!</p></div>
      )}
      {notifications.map(n => (
        <div className="card" key={n.id}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <div>
              <p>🔔 {n.message}</p>
              <span className="badge open" style={{marginTop:'8px', display:'inline-block'}}>{n.event}</span>
            </div>
            <span className="badge resolved">{n.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
export default Notifications;
