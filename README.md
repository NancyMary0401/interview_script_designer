# Interview Script Designer

A full-stack application for generating and managing technical interview scripts based on candidate resumes. Built with React + Vite, shadcn/ui components, and FastAPI.

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **OpenAI API Key** - [Get your API key](https://platform.openai.com/api-keys)

### Optional Prerequisites
- **Groq API Key** - [Get your API key](https://console.groq.com/)


## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd interview_script_designer

# Create Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Backend Setup
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Create environment file
# Create backend/.env with the configuration below
```

**Create `backend/.env` with the following content:**
```env
# Database Configuration
DATABASE_URL=sqlite:///./interview_scripts.db

# LLM Provider Configuration
# Choose one provider: openai, groq, or claude
LLM_PROVIDER=openai

# OpenAI Configuration (required if using OpenAI)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Groq Configuration (optional)
# GROQ_API_KEY=your_groq_api_key_here
# GROQ_MODEL=llama-3.1-70b-versatile


# Security Configuration
# Change this to a secure random string in production
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# CORS Configuration
# Add your frontend URLs here (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Project Configuration
PROJECT_NAME=Interview Script Designer
API_V1_STR=/api/v1
```

### 3. Frontend Setup
```bash
# Install Node.js dependencies
cd ../frontend
npm install

# Create environment file
# Create frontend/.env with the configuration below
```

**Create `frontend/.env` with the following content:**
```env
# Backend API Configuration
# URL of your backend API server
VITE_API_URL=http://localhost:8000/api/v1

# Development Configuration
# Uncomment and modify if needed for development
# VITE_DEV_PORT=5173
# VITE_DEV_HOST=localhost
```

### 4. Database Setup
```bash
# Initialize database tables
cd ../scripts
python create_tables.py
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Verify Installation

**Test Backend:**
```bash
# In backend directory
python -c "from app.main import app; print('✅ Backend imports successfully')"
```

**Test Frontend:**
```bash
# In frontend directory
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

### 8. First Steps

1. **Upload a Resume**: Use the resume upload feature to test the application
2. **Generate Questions**: Create interview questions based on the uploaded resume
3. **Test API**: Visit http://localhost:8000/docs to explore the API endpoints
4. **Save Scripts**: Test the script saving functionality

## 📁 Project Structure

```
interview_script_designer/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/           # API routes
│   │   ├── core/             # Configuration
│   │   ├── db/               # Database models & session
│   │   ├── services/          # Business logic
│   │   └── main.py           # FastAPI app
│   ├── tests/                # Backend tests
│   ├── requirements.txt      # Python dependencies
│   ├── run.py               # Server runner
│
├── frontend/                  # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── custom/      # Custom components
│   │   ├── store/           # Zustand state management
│   │   └── lib/             # Utilities
│   └── package.json         # Node dependencies
│
├── scripts/                  # Utility scripts
│   ├── create_tables.py     # Database initialization
│   └── init_db.py
│
└── README.md
```


## 🔑 Getting API Keys

### OpenAI API Key (Required)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the key and add it to your `backend/.env` file
5. **Important**: Add billing information to your OpenAI account to use the API

### Optional: Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `backend/.env` file


## 🔧 Configuration

### Backend Environment Variables
The following variables can be configured in `backend/.env`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | No | `sqlite:///./interview_scripts.db` |
| `LLM_PROVIDER` | AI provider to use (`openai`, `groq`, `claude`) | Yes | `openai` |
| `OPENAI_API_KEY` | OpenAI API key | Yes* | - |
| `OPENAI_MODEL` | OpenAI model to use | No | `gpt-4o-mini` |
| `GROQ_API_KEY` | Groq API key | No | - |
| `GROQ_MODEL` | Groq model to use | No | `llama-3.1-70b-versatile` |
| `SECRET_KEY` | Secret key for JWT tokens | Yes | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | `http://localhost:5173,http://localhost:3000` |

*Required if using OpenAI as LLM provider

### Frontend Environment Variables
The following variables can be configured in `frontend/.env`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `http://localhost:8000/api/v1` |
| `VITE_DEV_PORT` | Development server port | No | `5173` |
| `VITE_DEV_HOST` | Development server host | No | `localhost` |

## 📊 Features

- **Resume Upload**: Upload and parse PDF/text resumes
- **Question Generation**: AI-powered interview question generation
- **Question Customization**: Adjust breadth, depth, and persona
- **Script Management**: Save and retrieve interview scripts
- **Real-time Preview**: Live preview of questions and follow-ups
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS


## 📝 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc


### Environment-Specific Issues

#### Windows
- Use `venv\Scripts\activate` to activate virtual environment

#### macOS/Linux
- Use `source venv/bin/activate` to activate virtual environment
