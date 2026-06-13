# AI shortlister

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Transformers.js](https://img.shields.io/badge/Transformers.js-Local_AI-orange.svg)](https://huggingface.co/docs/transformers.js/)

An intelligent hiring and applicant tracking platform that utilizes local Artificial Intelligence (Sentence Transformers) to move beyond simple keyword matching. It semantically analyzes, scores, and ranks candidate profiles against job descriptions to provide explainable recruitment decisions.

![Dashboard Preview](https://via.placeholder.com/1200x600.png?text=AI+Candidate+Ranking+Dashboard)

## ✨ Core Features

*   **🤖 Local Semantic AI Matching:** Uses `@xenova/transformers` running entirely locally to compute cosine similarity between a candidate's profile and the job description. Ensures 100% data privacy (no OpenAI API keys required).
*   **🧠 Advanced Conceptual Skill Search:** Understands technology families. If a JD asks for *React*, it recognizes that a *Full Stack* developer inherently possesses related skills. Matches "around topics" rather than just rigid string checks.
*   **📊 Universal Dataset Parsing:** Upload any arbitrary candidate JSON dataset. The powerful fuzzy-parser recursively scans for experience arrays, calculates total cumulative experience across all past roles (handling dates and raw numbers), and extracts all surrounding text to ensure no skill is missed.
*   **🔍 Explainable AI Insights:** Doesn't just give a black-box score. Provides a detailed breakdown of Semantic Match, Skills Score, Experience Score, and Behavioral Score, alongside explicitly matched/missing skills and a human-readable AI justification.
*   **💻 Master-Detail UI:** A state-of-the-art, premium React interface featuring glassmorphism, instant side-by-side detail viewing, and auto-scrolling functionality.
*   **📥 Export to CSV:** One-click generation of fully formatted CSV reports containing IDs, names, metric breakdowns, and final ranks.

## 🏗️ Architecture & Tech Stack

**Frontend Layer:**
*   **React + Vite:** For lightning-fast Hot Module Replacement (HMR) and optimized building.
*   **Tailwind CSS v4:** Utility-first CSS for the modern dark-mode aesthetic and responsive grid layouts.
*   **Lucide React:** Beautiful, consistent iconography.

**Backend & AI Layer:**
*   **Node.js & Express:** Robust REST API architecture.
*   **Transformers.js (`@xenova/transformers`):** Calculates vector embeddings for deep semantic text analysis.
*   **In-Memory Database Layer:** Designed for friction-free local execution without the overhead of installing MongoDB or Docker.
*   **CSV Writer:** For seamless report generation.

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/en/) (v18 or higher recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/candidate-ranking-ai.git
   cd candidate-ranking-ai
   ```

2. **Start the Backend Server:**
   The backend handles all the AI embedding generation and JSON parsing.
   ```bash
   cd server
   npm install
   npm start
   ```
   *The server will run on `http://localhost:5000`*

3. **Start the Frontend Application:**
   Open a new terminal window/tab.
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`*

## 💡 Usage Guide

1. **Analyze Job Description:** Paste your job description into the JD panel and click `Analyze JD`. The system will extract the core requirements.
2. **Upload Dataset:** Drag and drop your candidate dataset (`.json`). The system's recursive parser will automatically identify names, sum up cumulative experience durations, and extract text data.
3. **Rank Candidates:** Click `Rank Candidates` to trigger the AI engine. 
4. **Review Results:** The table will populate on the left. Click on any candidate to view their **Explainable AI Insights** pinned to the right pane.
5. **Export:** Click `Export CSV Report` to download the final ranking metrics.

##  Example Dataset Format

While the parser is built to aggressively extract data regardless of exact keys, providing a structured array of objects yields the best results:

```json
[
  {
    "name": "Jane Doe",
    "summary": "Full Stack Developer specializing in highly scalable web applications.",
    "experience": [
      {
        "company": "Tech Corp",
        "duration": "3 years",
        "role": "Senior Engineer"
      },
      {
        "company": "Startup Inc",
        "duration": "18 months",
        "role": "Frontend Developer"
      }
    ],
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Docker"]
  }
]
```

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  License

This project is licensed under the MIT License - see the LICENSE file for details.
