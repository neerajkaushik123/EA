import { useState, useEffect } from 'react';
import axios from 'axios';
import './EmailInbox.css';

const API_BASE_URL = 'http://localhost:8000';

export default function EmailInbox({ onAnalyzed }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState({
    from_email: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emails?unprocessed_only=true`);
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (newEmail.from_email && newEmail.subject && newEmail.body) {
      try {
        const response = await axios.post(`${API_BASE_URL}/emails/ingest`, {
          from_email: newEmail.from_email,
          to_email: 'your-email@example.com',
          subject: newEmail.subject,
          body: newEmail.body
        });
        setEmails([...emails, response.data]);
        setNewEmail({ from_email: '', subject: '', body: '' });
      } catch (error) {
        console.error('Error adding email:', error);
      }
    }
  };

  const handleAnalyzeEmail = async (email) => {
    setLoading(true);
    setSelectedEmail(email);
    try {
      const response = await axios.post(`${API_BASE_URL}/emails/${email.id}/analyze`);
      setAnalysis(response.data);
      onAnalyzed();
    } catch (error) {
      console.error('Error analyzing email:', error);
      setAnalysis({ error: 'Failed to analyze email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-inbox">
      <div className="inbox-section">
        <h2>Add Email</h2>
        <form className="email-form" onSubmit={handleAddEmail}>
          <input
            type="email"
            placeholder="From email..."
            value={newEmail.from_email}
            onChange={(e) => setNewEmail({ ...newEmail, from_email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Subject..."
            value={newEmail.subject}
            onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
            required
          />
          <textarea
            placeholder="Email body..."
            value={newEmail.body}
            onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
            rows="4"
            required
          />
          <button type="submit">Add Email</button>
        </form>
      </div>

      <div className="inbox-content">
        <div className="email-list">
          <h3>Unprocessed Emails ({emails.length})</h3>
          {emails.length === 0 ? (
            <p className="empty">No unprocessed emails</p>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className={`email-item ${selectedEmail?.id === email.id ? 'selected' : ''}`}
                onClick={() => handleAnalyzeEmail(email)}
              >
                <div className="email-from">{email.from_email}</div>
                <div className="email-subject">{email.subject}</div>
                <div className="email-preview">{email.body.substring(0, 60)}...</div>
              </div>
            ))
          )}
        </div>

        {selectedEmail && (
          <div className="email-viewer">
            <div className="email-header">
              <h3>{selectedEmail.subject}</h3>
              <div className="email-meta">From: {selectedEmail.from_email}</div>
            </div>
            <div className="email-body">{selectedEmail.body}</div>

            {loading && <div className="loading-spinner">Analyzing with AI...</div>}

            {analysis && !loading && (
              <div className="analysis-panel">
                <h3>AI Analysis</h3>

                <div className="analysis-section">
                  <h4>Summary</h4>
                  <p>{analysis.summary || analysis.error}</p>
                </div>

                <div className="analysis-section">
                  <h4>Priority: <span className={`priority ${analysis.priority}`}>{analysis.priority?.toUpperCase()}</span></h4>
                </div>

                <div className="analysis-section">
                  <h4>Sentiment: <span className="sentiment">{analysis.sentiment}</span></h4>
                </div>

                <div className="analysis-section">
                  <h4>Suggested Response</h4>
                  <div className="response-box">{analysis.suggested_response}</div>
                </div>

                {analysis.extracted_tasks && analysis.extracted_tasks.length > 0 && (
                  <div className="analysis-section">
                    <h4>Extracted Tasks</h4>
                    <ul className="tasks-list">
                      {analysis.extracted_tasks.map((task, i) => (
                        <li key={i}>• {task}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="send-approval-btn"
                  onClick={() => {
                    // Send to approvals
                    axios.post(`${API_BASE_URL}/approvals`, {
                      email_id: selectedEmail.id,
                      analysis: analysis
                    }).then(() => {
                      alert('Analysis sent to approvals queue!');
                      setSelectedEmail(null);
                      setAnalysis(null);
                      fetchEmails();
                    });
                  }}
                >
                  ✓ Send to Approvals
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
