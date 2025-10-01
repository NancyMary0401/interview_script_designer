from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from ..db.session import Base

# SQLAlchemy Models
class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(String(50), index=True, nullable=False)
    resume_text = Column(Text, nullable=True)
    questions_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Pydantic Models (Schemas)
class QuestionBase(BaseModel):
    id: int
    main_question: str
    breadth: str  # low, medium, high
    depth: int  # 0-3
    persona: str  # evidence-first, why-how, metrics-driven, storytelling
    followup_bank: List[str]
    children: List[dict] = Field(default_factory=list)

class ScriptBase(BaseModel):
    id: Optional[int] = None
    recruiter_id: str
    resume_text: Optional[str] = None
    questions_json: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class ScriptCreate(ScriptBase):
    pass

class ScriptUpdate(ScriptBase):
    pass

class ScriptInDB(ScriptBase):
    id: int
    
    class Config:
        orm_mode = True
