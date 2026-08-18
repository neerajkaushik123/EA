import './Dashboard.css';

export default function Dashboard({ stats, onRefresh }) {
  if (!stats) return <div className="loading">Loading statistics...</div>;

  const statCards = [
    { label: 'Total Emails', value: stats.total_emails, icon: '📧' },
    { label: 'Unprocessed', value: stats.unprocessed_emails, icon: '📬', urgent: true },
    { label: 'Pending Approvals', value: stats.pending_approvals, icon: '⏳', urgent: true },
    { label: 'Approved', value: stats.approved_count, icon: '✅' },
    { label: 'Pending Tasks', value: stats.pending_tasks, icon: '✓', urgent: true },
    { label: 'Completed Tasks', value: stats.completed_tasks, icon: '🎉' },
    { label: 'Emails Sent', value: stats.emails_sent, icon: '📤' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.urgent ? 'urgent' : ''}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-info">
        <div className="info-box">
          <h3>📋 How it works</h3>
          <ol>
            <li>Emails arrive in your inbox</li>
            <li>AI analyzes each email and prepares responses</li>
            <li>Review analysis and approve/reject in the Approvals tab</li>
            <li>Approved responses are sent automatically</li>
            <li>Tasks are extracted and added to your task list</li>
          </ol>
        </div>

        <div className="info-box">
          <h3>⚡ Quick Actions</h3>
          <p>You have:</p>
          <ul>
            <li>{stats.unprocessed_emails} unprocessed emails waiting for analysis</li>
            <li>{stats.pending_approvals} approval requests awaiting your decision</li>
            <li>{stats.pending_tasks} tasks to complete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
