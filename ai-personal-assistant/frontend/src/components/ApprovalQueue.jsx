import { useState, useEffect } from 'react';
import axios from 'axios';
import './ApprovalQueue.css';

const API_BASE_URL = 'http://localhost:8000';

export default function ApprovalQueue({ onActionTaken }) {
  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/approvals?status=pending`);
      setApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const handleApprove = async (approval) => {
    try {
      setSendingEmail(true);

      // Approve the request
      await axios.put(`${API_BASE_URL}/approvals/${approval.id}/approve`, {
        feedback: feedback
      });

      // Send the email
      await axios.post(`${API_BASE_URL}/emails/send`, {
        to_email: approval.analysis.email_id, // In production, extract real email from analysis
        subject: `Re: ${approval.analysis.summary.substring(0, 50)}`,
        body: approval.analysis.suggested_response,
        approval_id: approval.id
      });

      alert('✅ Email approved and sent! Tasks have been created.');
      setFeedback('');
      setSelectedApproval(null);
      fetchApprovals();
      onActionTaken();
    } catch (error) {
      console.error('Error approving:', error);
      alert('Error approving email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleReject = async (approval) => {
    try {
      await axios.put(`${API_BASE_URL}/approvals/${approval.id}/reject`, {
        reason: feedback
      });

      alert('❌ Email rejected.');
      setFeedback('');
      setSelectedApproval(null);
      fetchApprovals();
      onActionTaken();
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  return (
    <div className="approval-queue">
      <div className="queue-list">
        <h2>Pending Approvals ({approvals.length})</h2>
        {approvals.length === 0 ? (
          <p className="empty">✨ All caught up! No pending approvals.</p>
        ) : (
          approvals.map((approval) => (
            <div
              key={approval.id}
              className={`approval-item ${selectedApproval?.id === approval.id ? 'selected' : ''}`}
              onClick={() => setSelectedApproval(approval)}
            >
              <div className="approval-priority">
                <span className={`badge ${approval.analysis.priority}`}>
                  {approval.analysis.priority.toUpperCase()}
                </span>
              </div>
              <div className="approval-info">
                <div className="approval-summary">{approval.analysis.summary}</div>
                <div className="approval-actions">{approval.analysis.extracted_tasks.length} tasks</div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedApproval && (
        <div className="approval-detail">
          <h2>Review & Approve</h2>

          <div className="detail-section">
            <h3>Summary</h3>
            <p>{selectedApproval.analysis.summary}</p>
          </div>

          <div className="detail-section">
            <h3>Suggested Response</h3>
            <div className="response-preview">
              {selectedApproval.analysis.suggested_response}
            </div>
          </div>

          <div className="detail-section">
            <h3>Tasks to Extract ({selectedApproval.analysis.extracted_tasks.length})</h3>
            <ul className="task-list">
              {selectedApproval.analysis.extracted_tasks.map((task, i) => (
                <li key={i}>
                  <input type="checkbox" defaultChecked />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h3>Your Feedback (Optional)</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add any notes or modifications..."
              rows="3"
            />
          </div>

          <div className="detail-actions">
            <button
              className="approve-btn"
              onClick={() => handleApprove(selectedApproval)}
              disabled={sendingEmail}
            >
              {sendingEmail ? '⏳ Sending...' : '✅ Approve & Send'}
            </button>
            <button
              className="reject-btn"
              onClick={() => handleReject(selectedApproval)}
              disabled={sendingEmail}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
