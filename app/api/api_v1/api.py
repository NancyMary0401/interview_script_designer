from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List, Optional
import json
from ...models.models import ScriptBase, ScriptCreate, ScriptInDB, QuestionBase, Script
from ...services.llm_service import LLMService
from ...services.resume_parser import ResumeParser
from ...db.session import get_db
from sqlalchemy.orm import Session
import logging
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

api_router = APIRouter()

# Initialize services
llm_service = LLMService()
resume_parser = ResumeParser()

@api_router.post("/upload-resume/", response_model=dict)
async def upload_resume(
    file: UploadFile = File(...)
):
    """
    Upload and parse a resume file (PDF or text).
    Returns the extracted text content.
    """
    try:
        # Read file content
        content = await file.read()
        
        # Parse resume content
        text = await resume_parser.parse_resume(content, file.filename)
        
        return {"status": "success", "resume_text": text}
        
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process resume: {str(e)}"
        )

@api_router.post("/generate-questions/", response_model=dict)
async def generate_questions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Generate interview questions based on resume text.
    
    Accepts a resume file, generates interview questions, and returns them.
    """
    try:
        content = await file.read()
        resume_text = await resume_parser.parse_resume(content, file.filename)

        # Validate resume text
        if not resume_text or len(resume_text.strip()) < 50:
            raise ValueError("Resume text is too short or empty. Please upload a valid resume file.")

        num_questions = 10 # Default number of questions

        # Set correct default parameters for initial question generation
        # These parameters are fixed for initial generation and should not be overridden
        INITIAL_BREADTH = "Low"  # Fixed low breadth for initial questions
        INITIAL_DEPTH = 0  # Fixed no depth for initial questions
        INITIAL_PERSONA = "Why-How"  # Fixed default persona

        # Generate questions using LLM with fixed parameters
        result = await llm_service.generate_questions(
            resume_text=resume_text,
            num_questions=num_questions,
            breadth=INITIAL_BREADTH,
            depth=INITIAL_DEPTH,
            persona=INITIAL_PERSONA
        )

        return {"status": "success", "data": result}

    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate questions: {str(e)}"
        )

@api_router.post("/update-question/", response_model=dict)
async def update_question(
    request: dict,
    db: Session = Depends(get_db)
):
    """
    Update a question with new parameters and regenerate follow-ups.
    
    Expected request format:
    {
        "resume_text": "...",
        "question": {
            "id": 1,
            "claim": "...",
            "main_question": "...",
            "controls": {
                "breadth": "Low",
                "depth": 1,
                "persona": "Why-How"
            },
            "follow_ups": [...]
        },
        "breadth": "",  # optional - new breadth value
        "depth": "",           # optional - new depth value
        "persona": "Metrics-driven",  # optional - new persona value
        "regenerate_followups": true  # optional flag (ignored, always regenerates)
    }
    """
    try:
        resume_text = request.get("resume_text")
        question = request.get("question")
        
        if not resume_text or not question:
            raise ValueError("resume_text and question are required")
        
        # Log the incoming request for debugging
        logger.info(f"DEBUG: Update request received")
        logger.info(f"DEBUG: Request keys: {list(request.keys())}")
        logger.info(f"DEBUG: Raw breadth: {request.get('breadth')} (type: {type(request.get('breadth'))})")
        logger.info(f"DEBUG: Raw depth: {request.get('depth')} (type: {type(request.get('depth'))})")
        logger.info(f"DEBUG: Raw persona: {request.get('persona')} (type: {type(request.get('persona'))})")
        logger.info(f"DEBUG: Question ID: {question.get('id')}, Main question: {question.get('main_question', '')[:100]}...")
        logger.info(f"DEBUG: Question controls: {question.get('controls', {})}")
            
        # Get update parameters (these override the question's current values)
        breadth = request.get("breadth")
        depth = request.get("depth")
        persona = request.get("persona")
        
        logger.info(f"DEBUG: Extracted parameters - breadth: {breadth}, depth: {depth}, persona: {persona}")
        
        # Update question using LLM
        updated_question = await llm_service.update_question(
            resume_text=resume_text,
            question=question,
            breadth=breadth,
            depth=depth,
            persona=persona
        )
        
        logger.info(f"Successfully updated question {question.get('id')} with breadth: {updated_question.get('controls', {}).get('breadth')}")
        
        return {"status": "success", "data": updated_question}
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error in update_question endpoint: {str(e)}")
        logger.error(f"Request data: {request}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid JSON in request or response: {str(e)}"
        )
    except ValueError as e:
        logger.error(f"Value error in update_question endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid request data: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error updating question: {str(e)}")
        logger.error(f"Request data: {request}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to update question: {str(e)}"
        )

@api_router.post("/save-script/", response_model=ScriptInDB)
async def save_script(
    script_data: ScriptCreate,
    db: Session = Depends(get_db)
):
    """
    Save an interview script to the database.
    """
    try:
        # Convert questions to JSON string
        questions_json = json.dumps(script_data.questions_json) if isinstance(script_data.questions_json, (dict, list)) else script_data.questions_json
        
        # Create new script record
        db_script = Script(
            recruiter_id=script_data.recruiter_id,
            resume_text=script_data.resume_text,
            questions_json=questions_json
        )
        
        db.add(db_script)
        db.commit()
        db.refresh(db_script)
        
        return db_script
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving script: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save script: {str(e)}"
        )

@api_router.get("/get-script/{script_id}", response_model=ScriptInDB)
async def get_script(
    script_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a saved script by ID.
    """
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Script with ID {script_id} not found"
        )
    
    # Parse questions JSON if it's a string
    if isinstance(script.questions_json, str):
        try:
            script.questions_json = json.loads(script.questions_json)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse questions_json for script ID {script_id}")
    
    return script