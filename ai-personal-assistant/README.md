# 🤖 AI Email Employee

Your intelligent AI assistant that reads your emails, analyzes them with Claude, prepares smart responses, extracts tasks, and asks for your approval before sending emails or creating tasks.

## ✨ Key Features

- **📧 Email Analysis**: AI analyzes incoming emails automatically
- **💬 Smart Responses**: Claude generates professional email responses
- **✅ Approval Workflow**: Review, approve/reject, or modify suggestions
- **📝 Task Extraction**: Automatically extracts actionable tasks from emails
- **📤 Auto Send**: Send approved emails automatically
- **✓ Task Management**: Created tasks go straight to your task list
- **📊 Dashboard**: Real-time overview of emails, approvals, and tasks
- **📤 Sent Tracking**: Keep records of all approved and sent emails

## 🏗️ Architecture

```
Backend (Python + FastAPI):
- Email ingestion API
- Claude AI integration for email analysis
- Approval workflow engine
- Task extraction and management
- Email sending functionality

Frontend (React + Vite):
- Dashboard with real-time stats
- Email inbox viewer
- Approval queue with detailed review
- Task manager
- Sent email history
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY

# Run backend
python main.py
```

Backend will run on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📖 How It Works

1. **Add Email** → Paste an email from your inbox
2. **AI Analysis** → Claude analyzes the email, generates:
   - Summary
   - Professional response draft
   - Extracted tasks
   - Priority & sentiment
3. **Review** → See all suggestions in the Approvals tab
4. **Approve** → Click "Approve & Send" to:
   - Send the email response
   - Create extracted tasks
   - Mark email as processed
5. **Track** → View sent emails and manage created tasks

## 📱 Main Screens

### Dashboard
- Overview of all metrics
- Pending actions count
- Quick stats on emails, approvals, tasks

### Email Inbox
- Add/paste new emails
- View full email content
- Trigger AI analysis
- See analysis results

### Approval Queue
- Review pending approvals
- Read AI-generated response draft
- Check extracted tasks
- Add feedback/modifications
- Approve or reject

### Task Manager
- View auto-created tasks
- Add tasks manually
- Mark complete
- Delete tasks

### Sent History
- Track all sent emails
- See sending timestamps
- Review email content

## 🔗 API Endpoints

### Emails
- `POST /emails/ingest` - Add a new email
- `GET /emails` - List emails
- `POST /emails/{id}/analyze` - Analyze with AI
- `POST /emails/send` - Send approved email

### Approvals
- `POST /approvals` - Create approval request
- `GET /approvals` - List approvals
- `PUT /approvals/{id}/approve` - Approve
- `PUT /approvals/{id}/reject` - Reject

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Stats
- `GET /stats` - Dashboard statistics

## 🔧 Configuration

### Backend `.env`
```
ANTHROPIC_API_KEY=your_key_here
GMAIL_CLIENT_ID=your_gmail_id  # For future Gmail integration
GMAIL_CLIENT_SECRET=your_secret
DEBUG=True
```

### Frontend
Edit `src/App.jsx` API_BASE_URL if backend on different host:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## 🚀 Future Enhancements

- [ ] Real Gmail API integration (automatic email fetching)
- [ ] OAuth authentication
- [ ] Database persistence (PostgreSQL)
- [ ] Email template library
- [ ] Scheduling (send emails at specific times)
- [ ] Email signature templates
- [ ] Analytics dashboard
- [ ] Bulk email operations
- [ ] Email categorization/labels
- [ ] Undo/revoke sent emails

## 🐛 Troubleshooting

**Backend won't start**
```bash
# Check Python version
python --version  # Should be 3.10+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Frontend connection errors**
- Make sure backend is running: `curl http://localhost:8000/health`
- Check API_BASE_URL in `src/App.jsx`
- Verify CORS settings in `backend/main.py`

**Claude API errors**
- Verify `ANTHROPIC_API_KEY` in `.env`
- Check API key validity and credits
- Ensure env vars are loaded (restart backend after changes)

## 📚 API Documentation

When backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## 📦 Project Structure

```
ai-personal-assistant/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app
│   │   └── App.css          # Styles
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite config
│   └── index.html           # HTML template
└── README.md                # This file
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT

## 🎯 Getting Help

- Check `http://localhost:8000/docs` for API docs
- Review component comments in code
- Check browser console (F12) for errors
- Review backend terminal for logs

---

**Built with ❤️ using Claude AI, FastAPI, and React**
