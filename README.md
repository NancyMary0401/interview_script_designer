# Interview Script Designer

A full-stack application for generating and managing technical interview scripts based on candidate resumes. Built with React + Vite, shadcn/ui components, and FastAPI.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd interview_script_designer

# Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your API keys

# Initialize database
cd scripts && python create_tables.py

# Start development servers (in separate terminals)
```

**Start Development Servers:**
```bash
# Terminal 1 - Backend
cd backend
python run.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

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
│   └── .env.example         # Environment template
│
├── frontend/                  # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── custom/      # Custom components
│   │   ├── store/           # Zustand state management
│   │   └── lib/             # Utilities
│   ├── package.json         # Node dependencies
│   └── .env.example         # Frontend environment template
│
├── scripts/                  # Utility scripts
│   ├── create_tables.py     # Database initialization
│   └── init_db.py
│
└── README.md
```

## 🛠️ Development Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python run.py
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Database Setup
```bash
cd scripts
python create_tables.py
```

## 🔧 Configuration

### Backend Environment Variables
Copy `backend/.env.example` to `backend/.env` and configure:

- `DATABASE_URL`: Database connection string (default: SQLite)
- `OPENAI_API_KEY`: OpenAI API key (required)
- `GROQ_API_KEY`: Groq API key (optional)
- `ANTHROPIC_API_KEY`: Anthropic API key (optional)

### Frontend Environment Variables
Copy `frontend/.env.example` to `frontend/.env` and configure:

- `VITE_API_URL`: Backend API URL (default: http://localhost:8000/api/v1)

## 📊 Features

- **Resume Upload**: Upload and parse PDF/text resumes
- **Question Generation**: AI-powered interview question generation
- **Question Customization**: Adjust breadth, depth, and persona
- **Script Management**: Save and retrieve interview scripts
- **Real-time Preview**: Live preview of questions and follow-ups
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

## 🚀 Production Deployment

### Frontend Production Build
```bash
cd frontend
npm run build
# Built files will be in frontend/dist/
```

### Backend Production
```bash
cd backend
pip install -r requirements.txt
# Use a production WSGI server like Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

## 📝 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**: Make sure ports 8000 and 5173 are available
2. **Database errors**: Run `cd scripts && python create_tables.py` to create tables
3. **API connection issues**: Check that `VITE_API_URL` in frontend/.env matches your backend URL
4. **Python import errors**: Make sure you're in the correct directory

### Development Tips

- Run backend and frontend in separate terminals for best development experience
- Backend auto-reloads on file changes
- Frontend hot-reloads on file changes
- Check browser console and terminal logs for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.