import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import EmailInbox from './components/EmailInbox';
import ApprovalQueue from './components/ApprovalQueue';
import TaskManager from './components/TaskManager';
import Dashboard from './components/Dashboard';
import SentEmails from './components/SentEmails';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🤖 AI Email Employee</h1>
          <p>Your intelligent assistant that reads emails, prepares responses, and asks for approval</p>
        </div>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
          onClick={() => setActiveTab('emails')}
        >
          📧 Emails {stats?.unprocessed_emails > 0 && `(${stats.unprocessed_emails})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          ✅ Approvals {stats?.pending_approvals > 0 && `(${stats.pending_approvals})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✓ Tasks {stats?.pending_tasks > 0 && `(${stats.pending_tasks})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          📤 Sent {stats?.emails_sent > 0 && `(${stats.emails_sent})`}
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && <Dashboard stats={stats} onRefresh={triggerRefresh} />}
        {activeTab === 'emails' && <EmailInbox onAnalyzed={triggerRefresh} />}
        {activeTab === 'approvals' && <ApprovalQueue onActionTaken={triggerRefresh} />}
        {activeTab === 'tasks' && <TaskManager onTasksChanged={triggerRefresh} />}
        {activeTab === 'sent' && <SentEmails />}
      </main>

      <footer className="app-footer">
        <p>AI Email Employee • Powered by Claude AI</p>
      </footer>
    </div>
  );
}

export default App;
