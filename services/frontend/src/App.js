import React, { useState } from 'react';
import Tickets from './components/Tickets';
import CreateTicket from './components/CreateTicket';
import Notifications from './components/Notifications';
import Reports from './components/Reports';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('tickets');
  return (
    <div className="app">
      <header className="header">
        <h1>🎫 Customer Support System</h1>
      </header>
      <nav className="nav">
        <button className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>🎫 Tickets</button>
        <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>➕ New Ticket</button>
        <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>🔔 Notifications</button>
        <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>📊 Reports</button>
      </nav>
      <main className="main">
        {activeTab === 'tickets' && <Tickets />}
        {activeTab === 'create' && <CreateTicket onCreated={() => setActiveTab('tickets')} />}
        {activeTab === 'notifications' && <Notifications />}
        {activeTab === 'reports' && <Reports />}
      </main>
    </div>
  );
}
export default App;
