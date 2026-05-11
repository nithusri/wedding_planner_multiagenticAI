# Smart Wedding Planner — Multi-Agent System

A sophisticated, AI-driven wedding planning application that uses a **Supervisor-Worker multi-agent architecture** to help users design and organize their perfect wedding. Powered by the **Gemini API**.

## 🚀 Features

- **Multi-Agent Orchestration**: A Supervisor agent delegates tasks to specialized workers:
  - 🎨 **Cultural Consultant**: Expert in traditions, style profiles, and decor.
  - 💰 **Treasurer**: Budget allocation and financial feasibility analyst.
  - 📍 **Logistics Scout**: Venue selection and logistics expert.
  - 📋 **Vendor Orchestrator**: Event coordination and timeline management.
- **Dynamic State Management**: Shared wedding state that updates in real-time as you chat.
- **Premium UI**: A beautiful, wedding-themed dark interface with rose gold and blush accents.
- **Real-time Planning Panel**: Track your style profile, budget, venues, and timeline as the AI builds them.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Lucide React, Axios.
- **Backend**: Node.js, Express, Google Generative AI (Gemini).
- **Architecture**: Multi-agent system with a Supervisor-Worker pattern.

## 📂 Project Structure

```text
agentic AI/
├── backend/            # Express server and Agent engine
│   ├── agents/         # AI Agent logic (Supervisor, Consultant, etc.)
│   ├── config/         # Configuration (Gemini API setup)
│   ├── controllers/    # Route controllers
│   ├── routes/         # API routes
│   └── state/          # In-memory session state management
├── frontend/           # React + Vite application
│   ├── src/            # UI components and logic
│   └── index.html      # Entry point
└── README.md           # Project documentation
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js installed.
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your API key:
   ```env
   PORT=5001
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🤵 How to Use
1. Open the application in your browser (usually `http://localhost:5173`).
2. Start chatting with the Wedding Concierge.
3. You can ask general questions or provide specific details like budget, culture, or guest count.
4. Watch the "Wedding Plan" panel on the right populate as the agents work together!

## 📜 License
MIT
