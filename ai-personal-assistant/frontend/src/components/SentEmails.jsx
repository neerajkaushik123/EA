import { useState, useEffect } from 'react';
import axios from 'axios';
import './SentEmails.css';

const API_BASE_URL = 'http://localhost:8000';

export default function SentEmails() {
  const [sentEmails, setSentEmails] = useState([]);

  useEffect(() => {
    fetchSentEmails();
  }, []);

  const fetchSentEmails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emails/sent`);
      setSentEmails(response.data);
    } catch (error) {
      console.error('Error fetching sent emails:', error);
    }
  };

  return (
    <div className="sent-emails">
      <h2>Sent Emails ({sentEmails.length})</h2>

      {sentEmails.length === 0 ? (
        <p className="empty">No sent emails yet</p>
      ) : (
        <div className="sent-list">
          {sentEmails.map((email) => (
            <div key={email.id} className="sent-item">
              <div className="sent-header">
                <div className="sent-to">To: {email.to}</div>
                <div className="sent-time">{new Date(email.sent_at).toLocaleString()}</div>
              </div>
              <div className="sent-subject">Subject: {email.subject}</div>
              <div className="sent-body">{email.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
