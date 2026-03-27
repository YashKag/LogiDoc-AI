# LogiDoc-AI 🚚

*A high-performance, local-first Logistics RAG (Retrieval-Augmented Generation) web application.*

## Overview
LogiDoc-AI is an advanced AI-powered document analysis platform specifically designed for the logistics industry. The application allows users to securely upload and query large volumes of logistics documents using a modern React frontend and a FastAPI backend. It features intelligent AI-based content verification to ensure only logistics-related documents are processed.

## Features
- **Intelligent RAG Pipeline**: Combines vector search with Large Language Models for accurate, context-aware answering.
- **Logistics Content Verification**: Uses AI to automatically filter and drop files that aren't related to logistics before processing.
- **FastAPI Backend**: High-performance asynchronous API layer.
- **React + Vite Frontend**: Responsive, modern, and high-performance UI.
- **Workspace Manager**: Quickly clear document databases to start fresh.

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, Vanilla CSS 
- **Backend**: Python, FastAPI, Uvicorn, ChromaDB
- **LLM Integrations**: OpenAI / Anthropic

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Clone the repository
```bash
git clone https://github.com/YashKag/LogiDoc-AI.git
cd LogiDoc-AI
```

### 2. Set up Environment Variables
Create a `.env` file in the root directory of the project and add your API keys. **This file should never be pushed to GitHub.**

```env
ANTHROPIC_API_KEY=your-anthropic-key-here
OPENAI_API_KEY=your-openai-key-here
```

### 3. Backend Setup
Open your terminal and set up the Python environment:

```bash
# Create a virtual environment
python3 -m venv venv

# Activate it (Mac/Linux)
source venv/bin/activate
# (Windows)
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Navigate to backend and start the server
cd backend
uvicorn main:app --reload --port 8000
```
> The API will be running at [http://localhost:8000](http://localhost:8000)

### 4. Frontend Setup
Open a *new* terminal window, keeping your backend running in the background.

```bash
# Navigate to the frontend directory
cd LogiDoc-AI/frontend

# Install node dependencies
npm install

# Start the Vite development server
npm run dev
```
> The Web Application will be running at [http://localhost:5173](http://localhost:5173)

---

## 📂 Project Structure
```text
LogiDoc-AI/
├── backend/          # FastAPI Python backend code & RAG engine
├── frontend/         # React + Vite application
├── logi_rag_v2/      # Additional server implementation
├── sample_docs/      # Sample logistics PDFs to test the application
├── requirements.txt  # Python requirements
├── .env              # API Keys (git-ignored)
└── .gitignore        # Ignored files
```
