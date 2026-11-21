# MindfulMe — Mental Wellness Support Application

![MERN](https://img.shields.io/badge/Architecture-MERN-16a34a?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React-61dafb?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47a248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-111827?style=flat-square)

MindfulMe is a full-stack web application focused on mental wellness awareness and personal reflection. It combines mood journaling, self-assessment questionnaires, progress visualisation, and a conversational support interface.

> **Important:** MindfulMe is an educational wellness project, not a medical device or a substitute for diagnosis, therapy, or emergency care. Quiz results and chatbot responses should not be treated as clinical advice.

## Live Demo

- **Frontend:** [mental-health-three-iota.vercel.app](https://mental-health-three-iota.vercel.app)
- **Backend:** [mental-health-z4qe.vercel.app](https://mental-health-z4qe.vercel.app)

## Screenshots

Screenshots are stored in the repository's `screenshort/` directory:

- Dashboard — `screenshort/Dashboard.png`
- Mood tracker — `screenshort/MoodTracker.png`
- Chat interface — `screenshort/ChatInterface .png`
- Admin panel — `screenshort/AdminPanel.png`

## Main Features

### Account and profile
- JWT-based authentication
- Password hashing
- User and administrator roles
- Protected application areas
- Profile and password management

### Mood tracking
- Record daily mood using an emoji-based interface
- Add an intensity rating and notes
- Review mood history
- View mood trends and summaries

### Self-assessment
- Wellness questionnaires inspired by common screening formats
- Automatic score calculation
- Personal feedback and assessment history

### Chat support
- Conversational support interface
- Rule-based responses that can run without an external AI service
- Chat history support
- Safety-oriented crisis alert handling

### Administration and progress
- User management
- Platform and mood analytics
- Quiz activity insights
- Daily activity streak tracking
- PDF report generation

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| State management | Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Charts | Recharts |
| Animation | Framer Motion |
| PDF export | jsPDF |

## Repository Structure

- `client/` — React + Vite application
- `server/` — Node.js and Express API
- `screenshort/` — project screenshots

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB local instance or Atlas database

### 1. Clone

`git clone https://github.com/Sanjeev6235/mental_health.git`

### 2. Install dependencies

Install the root dependencies with `npm install` if the root package scripts are used. Also install dependencies inside the client and server directories if they have separate package files.

### 3. Configure the backend

Create the backend environment file and set the MongoDB connection string, JWT secret, and required server settings according to the server configuration. Keep all secrets private.

### 4. Run the application

Start the backend using its development script, then start the Vite frontend in a separate terminal. Open the local frontend URL shown in the terminal.

## Privacy & Safety

- Do not enter sensitive personal or medical information into a demo deployment.
- Protect database credentials and authentication secrets.
- Any screening questionnaire is for reflection/education only; it does not establish a diagnosis.
- If someone may be in immediate danger, contact local emergency services or a qualified crisis-support provider.

## Author

**Sanjeev Kumar** · [GitHub](https://github.com/Sanjeev6235)

---

Built as a learning project to explore full-stack development and wellness-focused user experiences.