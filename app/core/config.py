from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Interview Script Designer"
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./interview_scripts.db"
    
    # LLM settings
    LLM_PROVIDER: str = "openai"  # or "groq", "claude", etc.
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
    )

settings = Settings()
