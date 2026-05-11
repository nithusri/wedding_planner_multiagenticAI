# Smart Wedding Planner — Multi-Agent AI System

A premium, agentic AI-driven wedding planning application that leverages a **Supervisor-Worker multi-agent architecture** to provide a seamless, high-end wedding planning experience. The system integrates multiple state-of-the-art LLMs (Gemini, Groq, Cohere) to handle specialized tasks with expert-level precision.

## 🌟 Key Features

- **Multi-Agent Orchestration**: A central Supervisor (Concierge) manages the workflow and delegates tasks to specialized workers:
  - 🤵 **Concierge (Supervisor)**: The brain of the system (Gemini).
  - 🎨 **Cultural & Design Consultant**: Expert in traditions, themes, and aesthetics (Groq/Llama).
  - 💰 **Treasurer**: Budget allocation and financial feasibility (Gemini).
  - 📍 **Logistics Scout**: Venue selection and location logistics (Cohere).
  - 📋 **Vendor Orchestrator**: Professional vendor management and timelines (Groq/Llama).
  - 🍽️ **Catering Director**: Bespoke menu design and caterer selection (Groq/Llama).
- **Multi-LLM Integration**: Dynamically switches between **Gemini**, **Groq (Llama 3.3 70B)**, and **Cohere (Command R+)** for the best results.
- **Secure Authentication**: Complete user registration and login system backed by **MongoDB**, **Bcrypt**, and **JWT**.
- **Real-time Planning Panel**: An interactive dashboard that updates in real-time as the AI agents build your style profile, budget, and guest lists.
- **Premium UI/UX**: A stunning, high-end interface featuring a **Blue & Silver theme** with glassmorphism, smooth animations, and a responsive layout.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Lucide React, Axios, React Markdown.
- **Backend**: Node.js (Express 5), MongoDB (Mongoose), JSON Web Tokens (JWT).
- **AI Engine**: Google Gemini API, Groq Cloud SDK, Cohere SDK.
- **Styling**: Premium Custom CSS with variable-driven theme system (Dark/Light modes).

## 📂 Project Structure

```text
agentic AI/
├── backend/            # Express server and Agent engine
│   ├── agents/         # Specialist Agent logic (Base, Supervisor, Consultant, etc.)
│   ├── config/         # Multi-LLM provider configuration
│   ├── controllers/    # Route controllers (Auth, Wedding logic)
│   ├── models/         # MongoDB schemas (User, Wedding State)
│   ├── routes/         # API endpoints (/auth, /wedding)
│   └── state/          # Session state management
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # UI Components (Chat, StatePanel, Auth)
│   │   ├── assets/     # Images and visual assets
│   │   └── App.jsx     # Main Application entry
│   └── index.html      # HTML skeleton
└── README.md           # Project documentation
```

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** installed.
- **MongoDB** installed and running locally (default: `mongodb://127.0.0.1:27017/wedding-planner`).
- API Keys for **Gemini**, **Groq**, and **Cohere**.

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your keys:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/wedding-planner
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_key
   GROQ_API_KEY=your_key
   COHERE_API_KEY=your_key
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
1. **Register/Login**: Create a secure account to save your wedding plans.
2. **Consult the Concierge**: Start chatting with the lead agent.
3. **Plan Details**: Provide your budget, preferred culture, or guest count.
4. **Watch it Evolve**: The "Wedding Plan" panel on the right will update as the specialized agents (Treasurer, Consultant, etc.) generate data based on your conversation.
5. **Switch Themes**: Use the light/dark mode toggle for your preferred viewing experience.

## 📜 License
MIT
