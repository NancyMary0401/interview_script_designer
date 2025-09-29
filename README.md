# Interview Script Designer

A full-stack application for generating and managing technical interview scripts based on candidate resumes. Built with Next.js, shadcn/ui components, and FastAPI.

## Features

- Modern, responsive UI built with shadcn/ui components
- Upload and parse resume files (PDF/text)
- Generate interview questions using LLM
- Update questions with different parameters (breadth, depth, persona)
- Save and retrieve interview scripts
- Real-time preview and editing
- Dark/light mode support
- SQLite database for persistence

## Tech Stack

### Frontend
- Next.js 14+
- TypeScript
- shadcn/ui components
- Tailwind CSS
- React Query for data fetching
- Zustand for state management

### Backend
- Python 3.9+
- FastAPI
- SQLite database
- LLM integration (OpenAI/Groq/Claude)

## Prerequisites

- Node.js 18+ (Frontend)
- Python 3.9+ (Backend)
- pip (Python package manager)
- pnpm (recommended) or npm

## Installation

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd frontend
   pnpm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```
   # Required for OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional: Uncomment and set if using other providers
   # GROQ_API_KEY=your_groq_api_key
   # ANTHROPIC_API_KEY=your_anthropic_api_key
   
   # Database settings (SQLite by default)
   DATABASE_URL=sqlite:///./interview_scripts.db
   
   # Security
   SECRET_KEY=your-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   
   # CORS settings
   ALLOWED_ORIGINS=http://localhost:3000
   ```

4. Initialize the database:
   ```bash
   python -c "from app.db.session import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## Project Structure

```
interview_script_designer/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [...routes]
│   ├── components/
│   │   ├── ui/          # shadcn components
│   │   └── custom/      # custom components
│   ├── lib/
│   │   └── utils.ts
│   ├── styles/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   └── services/
│   ├── tests/
│   └── requirements.txt
│
└── README.md
```

## API Endpoints

- `POST /api/v1/upload-resume/` - Upload and parse a resume file
- `POST /api/v1/generate-questions/` - Generate interview questions from resume text
- `POST /api/v1/update-question/` - Update a question with new parameters
- `POST /api/v1/save-script/` - Save an interview script
- `GET /api/v1/get-script/{script_id}` - Retrieve a saved script by ID

API documentation available at `http://localhost:8000/docs`

## Development

### Frontend Development

- Components use shadcn/ui - refer to [shadcn/ui documentation](https://ui.shadcn.com) for component usage
- Styling is done with Tailwind CSS
- State management uses Zustand
- API integration uses React Query

### Backend Development

To run the test suite:
```bash
pytest
```

## Deployment

### Frontend Deployment

1. Build the frontend:
   ```bash
   cd frontend
   pnpm build
   ```

2. For production, use a Node.js server or deploy to platforms like Vercel or Netlify.

### Backend Deployment

1. For production, use Gunicorn with Uvicorn workers:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```

2. Docker deployment:
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   COPY . .
   
   RUN pip install --no-cache-dir -r requirements.txt
   
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

## Environment Variables

### Frontend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

### Backend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection URL | `sqlite:///./interview_scripts.db` |
| `LLM_PROVIDER` | LLM provider to use (`openai`, `groq`, `claude`) | `openai` |
| `OPENAI_API_KEY` | API key for OpenAI | - |
| `GROQ_API_KEY` | API key for Groq | - |
| `ANTHROPIC_API_KEY` | API key for Anthropic Claude | - |
| `SECRET_KEY` | Secret key for security | `your-secret-key-here` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration time in minutes | `1440` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.