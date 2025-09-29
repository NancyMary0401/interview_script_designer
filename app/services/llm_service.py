import json
import logging
import re
import httpx
from typing import Dict, List, Optional, Any
from ..core.config import settings
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.client: Optional[AsyncOpenAI] = None
        self.model: str = settings.OPENAI_MODEL
        self._setup_provider()
    
    def _setup_provider(self):
        """Initialize the LLM provider with API key"""
        # Create an insecure httpx client that bypasses SSL verification
        insecure_client = httpx.AsyncClient(verify=False)

        if self.provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is not set in environment variables")
            self.client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                http_client=insecure_client
            )
            self.model = settings.OPENAI_MODEL
        elif self.provider == "groq":
            if not settings.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY is not set in environment variables")
            self.client = AsyncOpenAI(
                api_key=settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
                http_client=insecure_client
            )
            self.model = settings.GROQ_MODEL
        
    async def generate_questions(self, resume_text: str, num_questions: int = 10, breadth: str = "Medium", depth: int = 1, persona: str = "Why-How") -> Dict[str, Any]:
        """Generate interview questions based on resume text"""
        system_prompt = """You are an expert technical interviewer. Generate interview questions that verify real hands-on experience, decisions, trade-offs, and outcomes.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "claim": "specific claim from resume",
      "main_question": "the main question",
      "controls": {
        "breadth": "Low|Medium|High",
        "depth": 0,
        "persona": "Evidence-first|Why-How|Metrics-driven|Storytelling"
      },
      "follow_ups": [
        {
          "question": "follow-up question text",
          "nested": ["nested question 1", "nested question 2"]
        }
      ]
    }
  ]
}

Do not include any markdown code blocks, explanations, or other text."""

        # Generate dynamic instructions
        dynamic_instructions = self._generate_dynamic_prompt(breadth, depth, persona)

        user_prompt = f"""Generate {num_questions} interview questions for this resume:

{resume_text[:8000]}

Requirements:
- Breadth: {breadth}
- Depth: {depth} 
- Persona: {persona}

{dynamic_instructions}

Return only valid JSON with the exact structure specified."""

        try:
            if self.client is None:
                raise ValueError(f"Unsupported or uninitialized LLM provider: {self.provider}")
            
            response = await self._call_chat_api(system_prompt, user_prompt)
            return self._parse_llm_response(response)
            
        except Exception as e:
            logger.error(f"Error generating questions: {str(e)}")
            return self._create_fallback_questions(resume_text, breadth, depth, persona)
    
    async def update_question(
        self,
        resume_text: str,
        question: Dict[str, Any],
        breadth: Optional[str] = None,
        depth: Optional[int] = None,
        persona: Optional[str] = None
    ) -> Dict[str, Any]:
        """Regenerate follow-ups for a question based on updated parameters"""
        system_prompt = """You are an expert interviewer. Update the follow-ups for the given question based on the specified parameters.

Return ONLY valid JSON in this exact format:
{
  "id": 1,
  "claim": "original claim",
  "main_question": "original main question",
  "controls": {
    "breadth": "Low|Medium|High",
    "depth": 0,
    "persona": "Evidence-first|Why-How|Metrics-driven|Storytelling"
  },
  "follow_ups": [
    {
      "question": "follow-up question text",
      "nested": ["nested question 1", "nested question 2"]
    }
  ]
}

Do not include markdown code blocks, explanations, or other text."""

        # Get current parameters
        current_breadth = breadth or question.get("controls", {}).get("breadth") or question.get("breadth", "Medium")
        current_depth = depth if depth is not None else question.get("controls", {}).get("depth") or question.get("depth", 1)
        current_persona = persona or question.get("controls", {}).get("persona") or question.get("persona", "Why-How")

        dynamic_instructions = self._generate_dynamic_prompt(current_breadth, current_depth, current_persona)

        user_prompt = f"""Update this question with new parameters:

Original question: {json.dumps(question, indent=2)}

New parameters:
- Breadth: {current_breadth}
- Depth: {current_depth}
- Persona: {current_persona}

{dynamic_instructions}

Return only valid JSON with the updated follow-ups."""

        try:
            response = await self._call_chat_api(system_prompt, user_prompt)
            updated_question = self._parse_single_question(response)
            return updated_question

        except Exception as e:
            logger.error(f"Error updating question: {str(e)}")
            raise

    def _generate_dynamic_prompt(self, breadth: Optional[str], depth: Optional[int], persona: Optional[str]) -> str:
        """Generate dynamic prompt instructions"""
        instructions = []

        # Breadth instructions
        if breadth == "High":
            instructions.append("BREADTH High: Generate 5-7 follow-up questions covering multiple angles.")
        elif breadth == "Medium":
            instructions.append("BREADTH Medium: Generate 3-4 follow-up questions covering key aspects.")
        elif breadth == "Low":
            instructions.append("BREADTH Low: Generate 1-2 focused follow-up questions.")

        # Depth instructions
        if depth == 0:
            instructions.append("DEPTH 0: Each follow-up should have 1 nested question.")
        elif depth == 1:
            instructions.append("DEPTH 1: Each follow-up should have 1 nested question.")
        elif depth == 2:
            instructions.append("DEPTH 2: Each follow-up should have 2-3 nested questions.")
        elif depth == 3:
            instructions.append("DEPTH 3: Each follow-up should have 4-5 nested questions.")

        # Persona instructions
        if persona == "Evidence-first":
            instructions.append("PERSONA Evidence-first: Focus on concrete proof and tangible examples.")
        elif persona == "Why-How":
            instructions.append("PERSONA Why-How: Emphasize reasoning and decision-making processes.")
        elif persona == "Metrics-driven":
            instructions.append("PERSONA Metrics-driven: Push for quantitative measures and numbers.")
        elif persona == "Storytelling":
            instructions.append("PERSONA Storytelling: Encourage narrative with context and journey.")

        return "\n".join(instructions)
    
    async def _call_chat_api(self, system_prompt: str, user_prompt: str) -> str:
        """Make API call to the chat completions endpoint"""
        try:
            resp = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=4000,  # Increased token limit
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            logger.exception("LLM API error occurred")
            raise
    
    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse and validate the LLM response with improved logic"""
        try:
            # Clean the response
            cleaned_response = self._clean_response(response)
            logger.info(f"Cleaned response length: {len(cleaned_response)}")
            
            # Parse JSON
            data = json.loads(cleaned_response)
            
            # Validate structure
            if "questions" not in data or not isinstance(data["questions"], list):
                raise ValueError("Invalid response format: 'questions' array not found")
            
            # Validate and fix each question
            validated_questions = []
            for q in data["questions"]:
                validated_q = self._validate_question(q)
                if validated_q:
                    validated_questions.append(validated_q)
            
            if not validated_questions:
                raise ValueError("No valid questions found in response")
                
            return {"questions": validated_questions}
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            logger.debug(f"Response (first 500 chars): {response[:500]}")
            # Try alternative parsing methods
            return self._fallback_parse(response)
        except Exception as e:
            logger.error(f"Error parsing LLM response: {str(e)}")
            raise

    def _clean_response(self, response: str) -> str:
        """Clean the response text to extract valid JSON"""
        if not response:
            raise ValueError("Empty response")
            
        text = response.strip()
        
        # Remove markdown code blocks
        if "```json" in text:
            parts = text.split("```json", 1)
            if len(parts) > 1:
                json_part = parts[1].split("```", 1)[0]
                text = json_part.strip()
        elif "```" in text:
            parts = text.split("```", 1)
            if len(parts) > 1:
                json_part = parts[1].split("```", 1)[0]
                text = json_part.strip()
        
        # Find JSON boundaries
        start_pos = text.find('{')
        if start_pos == -1:
            raise ValueError("No JSON object found in response")
            
        # Find the matching closing brace
        brace_count = 0
        end_pos = len(text)
        
        for i in range(start_pos, len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_pos = i + 1
                    break
        
        json_text = text[start_pos:end_pos]
        
        # Fix common JSON issues
        json_text = self._fix_json_issues(json_text)
        
        return json_text
    
    def _fix_json_issues(self, json_text: str) -> str:
        """Fix common JSON formatting issues"""
        # Remove trailing commas
        json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
        
        # Fix unescaped newlines in strings (basic fix)
        json_text = json_text.replace('\n', '\\n')
        
        # Fix unescaped quotes in strings (very basic)
        # This is a simplified approach - a full solution would need proper string parsing
        json_text = re.sub(r'(?<!\\)"(?=[^"]*"[^"]*")', '\\"', json_text)
        
        return json_text
    
    def _validate_question(self, question: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Validate and fix a single question object"""
        try:
            # Ensure required fields exist
            required_fields = ["id", "claim", "main_question"]
            for field in required_fields:
                if field not in question:
                    logger.warning(f"Missing required field: {field}")
                    return None
            
            # Ensure controls exist
            if "controls" not in question:
                question["controls"] = {
                    "breadth": "Medium",
                    "depth": 1,
                    "persona": "Why-How"
                }
            
            # Ensure follow_ups exist
            if "follow_ups" not in question:
                question["follow_ups"] = []
            
            # Validate follow_ups structure
            valid_follow_ups = []
            for follow_up in question.get("follow_ups", []):
                if isinstance(follow_up, dict) and "question" in follow_up:
                    if "nested" not in follow_up:
                        follow_up["nested"] = []
                    elif not isinstance(follow_up["nested"], list):
                        follow_up["nested"] = []
                    valid_follow_ups.append(follow_up)
            
            question["follow_ups"] = valid_follow_ups
            
            return question
            
        except Exception as e:
            logger.error(f"Error validating question: {e}")
            return None
    
    def _parse_single_question(self, response: str) -> Dict[str, Any]:
        """Parse a single question response"""
        cleaned_response = self._clean_response(response)
        question = json.loads(cleaned_response)
        validated_question = self._validate_question(question)
        
        if not validated_question:
            raise ValueError("Invalid question format in response")
            
        return validated_question
    
    def _fallback_parse(self, response: str) -> Dict[str, Any]:
        """Fallback parsing when standard JSON parsing fails"""
        logger.warning("Using fallback parsing method")
        
        # Try to extract questions using regex
        question_pattern = r'"id"\s*:\s*(\d+).*?"claim"\s*:\s*"([^"]*)".*?"main_question"\s*:\s*"([^"]*)"'
        matches = re.findall(question_pattern, response, re.DOTALL)
        
        questions = []
        for match in matches:
            question = {
                "id": int(match[0]),
                "claim": match[1],
                "main_question": match[2],
                "controls": {
                    "breadth": "Medium",
                    "depth": 1,
                    "persona": "Why-How"
                },
                "follow_ups": [
                    {
                        "question": "Can you provide more details about this?",
                        "nested": ["What specific challenges did you face?"]
                    }
                ]
            }
            questions.append(question)
        
        if questions:
            return {"questions": questions}
        
        # Ultimate fallback
        raise ValueError("Could not parse any valid questions from response")

    def _create_fallback_questions(self, resume_text: str, breadth: str, depth: int, persona: str) -> Dict[str, Any]:
        """Create fallback questions when LLM fails"""
        logger.info("Creating fallback questions")
        
        # Extract key terms from resume
        lines = [line.strip() for line in resume_text.split('\n')[:20] if line.strip()]
        
        # Create basic questions
        questions = [
            {
                "id": 1,
                "claim": "Professional experience mentioned in resume",
                "main_question": "Can you walk me through your most significant professional experience?",
                "controls": {
                    "breadth": breadth,
                    "depth": depth,
                    "persona": persona
                },
                "follow_ups": [
                    {
                        "question": "What were the main challenges you faced?",
                        "nested": ["How did you overcome those challenges?"]
                    },
                    {
                        "question": "What was the impact of your work?",
                        "nested": ["How did you measure success?"]
                    }
                ]
            }
        ]
        
        return {"questions": questions}