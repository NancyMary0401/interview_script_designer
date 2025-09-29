# Interview Script Designer API

A FastAPI-based backend service for generating and managing technical interview scripts based on candidate resumes.

## Features

- Upload and parse resume files (PDF/text)
- Generate interview questions using LLM
- Update questions with different parameters (breadth, depth, persona)
- Save and retrieve interview scripts
- SQLite database for persistence

## Prerequisites

- Python 3.9+
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd interview_script_designer
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the project root with the following variables:
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
   ```

## Database Setup

The application uses SQLite by default. To initialize the database:

1. Run the following command to create the database tables:
   ```bash
   python -c "from app.db.session import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

## Running the Application

1. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

2. The API will be available at:
   ```
   http://localhost:8000
   ```

3. Access the interactive API documentation at:
   ```
   http://localhost:8000/docs
   ```

## API Endpoints

- `POST /api/v1/upload-resume/` - Upload and parse a resume file
- `POST /api/v1/generate-questions/` - Generate interview questions from resume text
- `POST /api/v1/update-question/` - Update a question with new parameters
- `POST /api/v1/save-script/` - Save an interview script
- `GET /api/v1/get-script/{script_id}` - Retrieve a saved script by ID

## Project Structure

```
interview_script_designer/
├── app/
│   ├── api/
│   │   └── api_v1/
│   │       └── api.py         # API routes
│   ├── core/
│   │   └── config.py          # Application configuration
│   ├── db/
│   │   └── session.py         # Database session management
│   ├── models/
│   │   └── models.py          # Database models and schemas
│   ├── services/
│   │   ├── llm_service.py     # LLM integration
│   │   └── resume_parser.py   # Resume parsing logic
│   ├── __init__.py
│   └── main.py               # FastAPI application
├── tests/                     # Test files
├── .env.example              # Example environment variables
├── requirements.txt          # Project dependencies
└── README.md                 # This file
```

## Testing

To run the test suite:

```bash
pytest
```

## Deployment

For production deployment, consider using:

1. **Gunicorn** with Uvicorn workers:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```

2. **Docker** containerization:
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   COPY . .
   
   RUN pip install --no-cache-dir -r requirements.txt
   
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection URL | `sqlite:///./interview_scripts.db` |
| `LLM_PROVIDER` | LLM provider to use (`openai`, `groq`, `claude`) | `openai` |
| `OPENAI_API_KEY` | API key for OpenAI | - |
| `GROQ_API_KEY` | API key for Groq | - |
| `ANTHROPIC_API_KEY` | API key for Anthropic Claude | - |
| `SECRET_KEY` | Secret key for security | `your-secret-key-here` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration time in minutes | `1440` (24 hours) |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
