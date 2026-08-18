from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum
import anthropic
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(
    title="AI Email Employee API",
    description="Your AI assistant that reads emails, prepares responses, creates tasks, and asks for approval",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Claude client
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Enums
class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

# Models
class Email(BaseModel):
    id: Optional[str] = None
    from_email: str
    to_email: Optional[str] = None
    subject: str
    body: str
    received_at: Optional[datetime] = None
    is_processed: bool = False

class EmailAnalysis(BaseModel):
    email_id: str
    summary: str
    suggested_response: str
    extracted_tasks: List[str]
    priority: str  # high, medium, low
    action_required: bool
    sentiment: str

class ApprovalRequest(BaseModel):
    id: Optional[str] = None
    email_id: str
    analysis: EmailAnalysis
    status: ApprovalStatus = ApprovalStatus.PENDING
    created_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    user_feedback: Optional[str] = None

class Task(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    source_email_id: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: str = "medium"
    created_at: Optional[datetime] = None
    due_date: Optional[datetime] = None

class EmailToSend(BaseModel):
    to_email: str
    subject: str
    body: str
    approval_id: str

# In-memory storage
emails_store = []
analyses_store = []
approvals_store = []
tasks_store = []
sent_emails_store = []

def generate_email_id():
    return f"email_{len(emails_store) + 1}"

def generate_approval_id():
    return f"approval_{len(approvals_store) + 1}"

def generate_task_id():
    return f"task_{len(tasks_store) + 1}"

# Endpoints

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Email Employee"}

# Email Management

@app.post("/emails/ingest")
async def ingest_email(email: Email) -> Email:
    """Ingest a new email to be processed"""
    email.id = generate_email_id()
    email.received_at = datetime.now()
    emails_store.append(email)
    return email

@app.get("/emails")
async def list_emails(unprocessed_only: bool = False) -> List[Email]:
    """List all emails"""
    if unprocessed_only:
        return [e for e in emails_store if not e.is_processed]
    return emails_store

@app.get("/emails/{email_id}")
async def get_email(email_id: str) -> Email:
    """Get a specific email"""
    for email in emails_store:
        if email.id == email_id:
            return email
    raise HTTPException(status_code=404, detail="Email not found")

# Email Analysis & AI Processing

@app.post("/emails/{email_id}/analyze")
async def analyze_email(email_id: str) -> EmailAnalysis:
    """Analyze an email using AI and generate response draft + tasks"""
    email = None
    for e in emails_store:
        if e.id == email_id:
            email = e
            break

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    try:
        analysis_prompt = f"""Analyze this email and provide:
1. A brief summary (1-2 sentences)
2. A suggested professional response
3. Any tasks to extract from the email
4. Priority level (high/medium/low)
5. Whether action is required
6. Sentiment (positive/neutral/negative)

Email from: {email.from_email}
Subject: {email.subject}
Body:
{email.body}

Respond in JSON format:
{{
    "summary": "...",
    "suggested_response": "...",
    "extracted_tasks": ["task1", "task2"],
    "priority": "high/medium/low",
    "action_required": true/false,
    "sentiment": "positive/neutral/negative"
}}
"""

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": analysis_prompt
            }]
        )

        analysis_text = response.content[0].text
        analysis_data = json.loads(analysis_text)

        analysis = EmailAnalysis(
            email_id=email_id,
            summary=analysis_data.get("summary", ""),
            suggested_response=analysis_data.get("suggested_response", ""),
            extracted_tasks=analysis_data.get("extracted_tasks", []),
            priority=analysis_data.get("priority", "medium"),
            action_required=analysis_data.get("action_required", False),
            sentiment=analysis_data.get("sentiment", "neutral")
        )

        analyses_store.append(analysis)
        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.get("/emails/{email_id}/analysis")
async def get_email_analysis(email_id: str) -> EmailAnalysis:
    """Get analysis for an email"""
    for analysis in analyses_store:
        if analysis.email_id == email_id:
            return analysis
    raise HTTPException(status_code=404, detail="Analysis not found")

# Approval Workflow

@app.post("/approvals")
async def create_approval(approval: ApprovalRequest) -> ApprovalRequest:
    """Create an approval request based on email analysis"""
    approval.id = generate_approval_id()
    approval.created_at = datetime.now()
    approval.status = ApprovalStatus.PENDING
    approvals_store.append(approval)
    return approval

@app.get("/approvals")
async def list_approvals(status: Optional[ApprovalStatus] = None) -> List[ApprovalRequest]:
    """List approval requests"""
    if status:
        return [a for a in approvals_store if a.status == status]
    return approvals_store

@app.get("/approvals/{approval_id}")
async def get_approval(approval_id: str) -> ApprovalRequest:
    """Get a specific approval request"""
    for approval in approvals_store:
        if approval.id == approval_id:
            return approval
    raise HTTPException(status_code=404, detail="Approval not found")

@app.put("/approvals/{approval_id}/approve")
async def approve_request(approval_id: str, feedback: Optional[str] = None) -> ApprovalRequest:
    """Approve an approval request"""
    for approval in approvals_store:
        if approval.id == approval_id:
            approval.status = ApprovalStatus.APPROVED
            approval.reviewed_at = datetime.now()
            approval.user_feedback = feedback

            # Auto-create tasks from extracted tasks
            for task_title in approval.analysis.extracted_tasks:
                task = Task(
                    id=generate_task_id(),
                    title=task_title,
                    description=f"Extracted from email: {approval.analysis.summary}",
                    source_email_id=approval.email_id,
                    status=TaskStatus.PENDING,
                    priority=approval.analysis.priority,
                    created_at=datetime.now()
                )
                tasks_store.append(task)

            return approval
    raise HTTPException(status_code=404, detail="Approval not found")

@app.put("/approvals/{approval_id}/reject")
async def reject_request(approval_id: str, reason: Optional[str] = None) -> ApprovalRequest:
    """Reject an approval request"""
    for approval in approvals_store:
        if approval.id == approval_id:
            approval.status = ApprovalStatus.REJECTED
            approval.reviewed_at = datetime.now()
            approval.user_feedback = reason
            return approval
    raise HTTPException(status_code=404, detail="Approval not found")

# Email Sending

@app.post("/emails/send")
async def send_email(email_request: EmailToSend):
    """Send an email after approval"""
    approval = None
    for a in approvals_store:
        if a.id == email_request.approval_id:
            approval = a
            break

    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")

    if approval.status != ApprovalStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Approval must be approved first")

    # In production, this would use Gmail API or similar
    sent_email = {
        "id": f"sent_{len(sent_emails_store) + 1}",
        "to": email_request.to_email,
        "subject": email_request.subject,
        "body": email_request.body,
        "sent_at": datetime.now().isoformat(),
        "approval_id": email_request.approval_id
    }

    sent_emails_store.append(sent_email)

    # Mark original email as processed
    for email in emails_store:
        if email.id == approval.email_id:
            email.is_processed = True
            break

    return {
        "status": "sent",
        "sent_email": sent_email,
        "message": f"Email sent to {email_request.to_email}"
    }

@app.get("/emails/sent")
async def list_sent_emails() -> List[dict]:
    """List sent emails"""
    return sent_emails_store

# Task Management

@app.get("/tasks")
async def list_tasks() -> List[Task]:
    """List all tasks"""
    return tasks_store

@app.post("/tasks")
async def create_task(task: Task) -> Task:
    """Create a task manually"""
    task.id = generate_task_id()
    task.created_at = datetime.now()
    tasks_store.append(task)
    return task

@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task_update: Task) -> Task:
    """Update a task"""
    for i, task in enumerate(tasks_store):
        if task.id == task_id:
            task_update.id = task_id
            tasks_store[i] = task_update
            return task_update
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task"""
    global tasks_store
    tasks_store = [t for t in tasks_store if t.id != task_id]
    return {"status": "deleted", "task_id": task_id}

# Dashboard Statistics

@app.get("/stats")
async def get_stats():
    """Get dashboard statistics"""
    return {
        "total_emails": len(emails_store),
        "unprocessed_emails": len([e for e in emails_store if not e.is_processed]),
        "pending_approvals": len([a for a in approvals_store if a.status == ApprovalStatus.PENDING]),
        "approved_count": len([a for a in approvals_store if a.status == ApprovalStatus.APPROVED]),
        "pending_tasks": len([t for t in tasks_store if t.status == TaskStatus.PENDING]),
        "completed_tasks": len([t for t in tasks_store if t.status == TaskStatus.COMPLETED]),
        "emails_sent": len(sent_emails_store)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
