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
        system_prompt = """You are an expert technical interviewer. Your task is to generate follow-up questions that match the exact parameters provided.

CRITICAL REQUIREMENTS:
1. For breadth="Low": Generate EXACTLY 1 follow-up
   For breadth="Medium": Generate EXACTLY 2-3 follow-ups
   For breadth="High": Generate EXACTLY 4-5 follow-ups

2. For depth=1: Each follow-up MUST have EXACTLY 1 nested question
   For depth=2: Each follow-up MUST have EXACTLY 2-3 nested questions
   For depth=3: Each follow-up MUST have EXACTLY 4-5 nested questions

3. Follow persona style EXACTLY:
   - Evidence-first: Focus on concrete proof and examples
   - Why-How: Focus on reasoning and process
   - Metrics-driven: Focus on numbers and measurements
   - Storytelling: Focus on context and journey

Return ONLY valid JSON in this exact format:
{
  "id": <original_id>,
  "claim": "<original_claim>",
  "main_question": "<original_main_question>",
  "controls": {
    "breadth": "<provided_breadth>",
    "depth": <provided_depth>,
    "persona": "<provided_persona>"
  },
  "follow_ups": [
    {
      "question": "technical follow-up question",
      "nested": ["detailed nested question 1", "detailed nested question 2", ...]
    },
    ...
  ]
}

Do not include any other text or explanations."""

        # Get current parameters
        current_breadth = breadth or question.get("controls", {}).get("breadth") or question.get("breadth", "Medium")
        current_depth = depth if depth is not None else question.get("controls", {}).get("depth") or question.get("depth", 1)
        current_persona = persona or question.get("controls", {}).get("persona") or question.get("persona", "Why-How")

        dynamic_instructions = self._generate_dynamic_prompt(current_breadth, current_depth, current_persona)

        user_prompt = f"""Generate technical follow-up questions for this interview question:

ORIGINAL QUESTION:
{json.dumps(question, indent=2)}

REQUIRED PARAMETERS - YOU MUST FOLLOW THESE EXACTLY:
1. Breadth: {current_breadth}
   - This determines the number of follow-up questions
   - Low: EXACTLY 1 follow-up
   - Medium: EXACTLY 2-3 follow-ups
   - High: EXACTLY 4-5 follow-ups

2. Depth: {current_depth}
   - This determines the number of nested questions per follow-up
   - 1: EXACTLY 1 nested question per follow-up
   - 2: EXACTLY 2-3 nested questions per follow-up
   - 3: EXACTLY 4-5 nested questions per follow-up

3. Persona: {current_persona}
   - This determines the questioning style
   - Evidence-first: Ask for concrete examples and proof
   - Why-How: Focus on reasoning and decision-making
   - Metrics-driven: Ask about numbers, measurements, and impact
   - Storytelling: Focus on context and journey

The follow-up questions should:
1. Be specific to the claim: "{question['claim']}"
2. Follow the {current_persona} style
3. Have EXACTLY the required number of follow-ups and nested questions
4. Be technical and detailed

Return only valid JSON with the updated follow-ups."""

        try:
            response = await self._call_chat_api(system_prompt, user_prompt)
            updated_question = self._parse_single_question(response)
            
            # Ensure the response uses the correct parameters
            if updated_question.get("controls"):
                updated_question["controls"]["breadth"] = current_breadth
                updated_question["controls"]["depth"] = current_depth
                updated_question["controls"]["persona"] = current_persona
            else:
                updated_question["controls"] = {
                    "breadth": current_breadth,
                    "depth": current_depth,
                    "persona": current_persona
                }
            
            logger.info(f"Updated question with parameters - breadth: {current_breadth}, depth: {current_depth}, persona: {current_persona}")
            return updated_question

        except Exception as e:
            logger.error(f"Error updating question: {str(e)}")
            raise

    def _generate_dynamic_prompt(self, breadth: Optional[str], depth: Optional[int], persona: Optional[str]) -> str:
        """Generate dynamic prompt instructions"""
        instructions = []

        # Breadth instructions - number of follow-up questions
        if breadth == "High":
            instructions.append("BREADTH High: Generate exactly 4-5 follow-up questions covering multiple angles.")
        elif breadth == "Medium":
            instructions.append("BREADTH Medium: Generate exactly 2-3 follow-up questions covering key aspects.")
        elif breadth == "Low":
            instructions.append("BREADTH Low: Generate exactly 1 follow-up question.")

        # Depth instructions - number of nested questions per follow-up
        # UI mapping: 1=Low, 2=Medium, 3=High
        if depth == 1:
            instructions.append("DEPTH 1 (Low): Each follow-up should have exactly 1 nested question.")
        elif depth == 2:
            instructions.append("DEPTH 2 (Medium): Each follow-up should have exactly 2-3 nested questions.")
        elif depth == 3:
            instructions.append("DEPTH 3 (High): Each follow-up should have exactly 4-5 nested questions.")
        else:
            # Fallback for any other values
            instructions.append(f"DEPTH {depth}: Each follow-up should have exactly 1 nested question.")

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
        logger.info(f"Original response length: {len(text)}")
        
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
        logger.info(f"Extracted JSON text length: {len(json_text)}")
        
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
        
        # Fix single quotes to double quotes
        json_text = re.sub(r"'([^']*)':", r'"\1":', json_text)
        json_text = re.sub(r":\s*'([^']*)'", r': "\1"', json_text)
        
        # Remove any leading/trailing whitespace
        json_text = json_text.strip()
        
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
            
            # Ensure controls exist with correct values
            controls = question.get("controls", {})
            breadth = controls.get("breadth", "Medium")
            depth = controls.get("depth", 1)
            persona = controls.get("persona", "Why-How")
            
            # Determine required counts based on breadth and depth
            follow_up_counts = {
                "Low": 1,
                "Medium": (2, 3),  # min, max
                "High": (4, 5)     # min, max
            }
            
            nested_counts = {
                1: 1,           # Low: exactly 1
                2: (2, 3),      # Medium: 2-3
                3: (4, 5)       # High: 4-5
            }
            
            # Validate follow-ups exist
            if "follow_ups" not in question or not isinstance(question["follow_ups"], list):
                logger.warning("Invalid or missing follow-ups")
                return None
            
            current_follow_ups = question["follow_ups"]
            
            # Validate follow-up count matches breadth
            min_follow_ups = follow_up_counts[breadth] if isinstance(follow_up_counts[breadth], int) else follow_up_counts[breadth][0]
            max_follow_ups = follow_up_counts[breadth] if isinstance(follow_up_counts[breadth], int) else follow_up_counts[breadth][1]
            
            if len(current_follow_ups) < min_follow_ups or len(current_follow_ups) > max_follow_ups:
                logger.warning(f"Follow-up count {len(current_follow_ups)} doesn't match breadth {breadth} ({min_follow_ups}-{max_follow_ups})")
                return None
            
            # Validate each follow-up has correct number of nested questions
            min_nested = nested_counts[depth] if isinstance(nested_counts[depth], int) else nested_counts[depth][0]
            max_nested = nested_counts[depth] if isinstance(nested_counts[depth], int) else nested_counts[depth][1]
            
            for follow_up in current_follow_ups:
                if not isinstance(follow_up, dict) or "question" not in follow_up or "nested" not in follow_up:
                    logger.warning("Invalid follow-up structure")
                    return None
                
                if not isinstance(follow_up["nested"], list):
                    logger.warning("Invalid nested questions structure")
                    return None
                
                nested_count = len(follow_up["nested"])
                if nested_count < min_nested or nested_count > max_nested:
                    logger.warning(f"Nested question count {nested_count} doesn't match depth {depth} ({min_nested}-{max_nested})")
                    return None
            
            # If we get here, the structure is valid
            question["controls"] = {
                "breadth": breadth,
                "depth": depth,
                "persona": persona
            }
            
            return question
            
        except Exception as e:
            logger.error(f"Error validating question: {e}")
            return None
            
    def _generate_follow_up_question(self, claim: str, index: int) -> str:
        """Generate a follow-up question based on the claim"""
        follow_ups = [
            "What specific techniques or methods did you use to achieve this improvement?",
            "How did you measure and validate the performance gains?",
            "What challenges did you encounter during this process?",
            "How did you ensure the improvements were sustainable?",
            "What was the impact on the end users and stakeholders?"
        ]
        return follow_ups[min(index - 1, len(follow_ups) - 1)]
    
    def _generate_nested_question(self, follow_up: str, index: int) -> str:
        """Generate a nested question based on the follow-up"""
        nested_questions = [
            "Can you provide specific examples?",
            "What metrics or tools did you use?",
            "How did you overcome any obstacles?",
            "What were the key learnings?",
            "How would you approach this differently now?"
        ]
        return nested_questions[min(index - 1, len(nested_questions) - 1)]
    
    def _parse_single_question(self, response: str) -> Dict[str, Any]:
        """Parse a single question response and ensure correct counts"""
        try:
            cleaned_response = self._clean_response(response)
            logger.info(f"Cleaned response for single question: {cleaned_response[:200]}...")
            question = json.loads(cleaned_response)
            
            # Get the required parameters
            controls = question.get("controls", {})
            breadth = controls.get("breadth", "Medium")
            depth = controls.get("depth", 1)
            persona = controls.get("persona", "Why-How")
            
            # Determine required counts
            follow_up_counts = {
                "Low": 1,
                "Medium": (2, 3),
                "High": (4, 5)
            }
            nested_counts = {
                1: 1,
                2: (2, 3),
                3: (4, 5)
            }
            
            # Get required follow-up count
            required_follow_ups = (
                follow_up_counts[breadth] if isinstance(follow_up_counts[breadth], int)
                else follow_up_counts[breadth][0]  # Use minimum for tuple
            )
            
            # Get required nested count
            required_nested = (
                nested_counts[depth] if isinstance(nested_counts[depth], int)
                else nested_counts[depth][0]  # Use minimum for tuple
            )
            
            # Ensure we have follow-ups
            current_follow_ups = question.get("follow_ups", [])
            
            # Generate more follow-ups if needed
            while len(current_follow_ups) < required_follow_ups:
                current_follow_ups.append({
                    "question": self._generate_follow_up_question_by_persona(
                        claim=question["claim"],
                        index=len(current_follow_ups),
                        persona=persona
                    ),
                    "nested": []
                })
            
            # Ensure each follow-up has correct number of nested questions
            for follow_up in current_follow_ups:
                current_nested = follow_up.get("nested", [])
                
                # Generate more nested questions if needed
                while len(current_nested) < required_nested:
                    current_nested.append(
                        self._generate_nested_question_by_persona(
                            claim=question["claim"],
                            follow_up_index=current_follow_ups.index(follow_up),
                            nested_index=len(current_nested),
                            persona=persona
                        )
                    )
                
                follow_up["nested"] = current_nested
            
            # Update the question with corrected counts
            question["follow_ups"] = current_follow_ups[:required_follow_ups]
            question["controls"] = {
                "breadth": breadth,
                "depth": depth,
                "persona": persona
            }
            
            # Validate the final structure
            validated_question = self._validate_question(question)
            if not validated_question:
                raise ValueError("Failed to generate valid question structure")
            
            return validated_question
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error in _parse_single_question: {e}")
            logger.error(f"Raw response: {response[:500]}")
            # Try fallback parsing
            return self._fallback_parse_single_question(response)
        except Exception as e:
            logger.error(f"Error parsing single question: {e}")
            raise
    
    def _fallback_parse_single_question(self, response: str, breadth: str = "Medium", depth: int = 1, persona: str = "Why-How") -> Dict[str, Any]:
        """Fallback parsing for single question when JSON parsing fails"""
        logger.warning("Using fallback parsing method for single question")
        
        # Try to extract question using regex
        question_pattern = r'"id"\s*:\s*(\d+).*?"claim"\s*:\s*"([^"]*)".*?"main_question"\s*:\s*"([^"]*)"'
        match = re.search(question_pattern, response, re.DOTALL)
        
        if match:
            # Generate appropriate number of follow-ups based on breadth
            follow_ups = []
            if breadth == "Low":
                num_follow_ups = 1
            elif breadth == "Medium":
                num_follow_ups = 2
            else:  # High
                num_follow_ups = 4
            
            # Generate appropriate number of nested questions based on depth
            num_nested = 1 if depth == 1 else (2 if depth == 2 else 4)
            
            # Generate follow-ups with correct counts
            for i in range(num_follow_ups):
                nested_questions = []
                for j in range(num_nested):
                    nested_questions.append(
                        self._generate_nested_question_by_persona(
                            claim=match.group(2),
                            follow_up_index=i,
                            nested_index=j,
                            persona=persona
                        )
                    )
                
                follow_ups.append({
                    "question": self._generate_follow_up_question_by_persona(
                        claim=match.group(2),
                        index=i,
                        persona=persona
                    ),
                    "nested": nested_questions
                })
            
            question = {
                "id": int(match.group(1)),
                "claim": match.group(2),
                "main_question": match.group(3),
                "controls": {
                    "breadth": breadth,
                    "depth": depth,
                    "persona": persona
                },
                "follow_ups": follow_ups
            }
            return question
        
        # Ultimate fallback
        raise ValueError("Could not parse valid question from response")
        
    def _generate_follow_up_question_by_persona(self, claim: str, index: int, persona: str) -> str:
        """Generate a follow-up question based on claim and persona"""
        if persona == "Evidence-first":
            questions = [
                "What specific evidence demonstrates your success in this area?",
                "Can you provide concrete examples of your implementation?",
                "What tangible results validate this approach?",
                "How did you document and measure these improvements?",
                "What empirical data supports your decisions?"
            ]
        elif persona == "Metrics-driven":
            questions = [
                "What key metrics did you use to measure success?",
                "How did you quantify the impact of your changes?",
                "What performance benchmarks did you establish?",
                "Can you break down the 20% improvement in numbers?",
                "What monitoring tools did you implement?"
            ]
        elif persona == "Storytelling":
            questions = [
                "Walk me through the journey of implementing this solution.",
                "How did this project evolve from start to finish?",
                "What was the context behind these decisions?",
                "How did stakeholders respond to these changes?",
                "What memorable challenges shaped this experience?"
            ]
        else:  # Why-How
            questions = [
                "What was your reasoning behind this approach?",
                "How did you determine the best solution?",
                "Why did you choose these specific methods?",
                "How did you implement these changes?",
                "What was your decision-making process?"
            ]
        return questions[min(index, len(questions) - 1)]
    
    def _generate_nested_question_by_persona(self, claim: str, follow_up_index: int, nested_index: int, persona: str) -> str:
        """Generate a nested question based on follow-up and persona"""
        if persona == "Evidence-first":
            questions = [
                "What specific tools or technologies were involved?",
                "How did you verify the results?",
                "What documentation supports this?",
                "Can you show examples of the implementation?",
                "What testing validated this approach?"
            ]
        elif persona == "Metrics-driven":
            questions = [
                "What was the baseline vs. final measurement?",
                "How did you track these improvements?",
                "What metrics showed the biggest impact?",
                "Can you quantify the resource savings?",
                "What performance data did you collect?"
            ]
        elif persona == "Storytelling":
            questions = [
                "What led to this particular decision?",
                "How did the team respond to this?",
                "What unexpected discoveries did you make?",
                "How did this affect the project timeline?",
                "What lessons emerged from this experience?"
            ]
        else:  # Why-How
            questions = [
                "What alternatives did you consider?",
                "How did you overcome the challenges?",
                "Why was this the optimal solution?",
                "How did you ensure quality?",
                "What trade-offs did you evaluate?"
            ]
        return questions[min(nested_index, len(questions) - 1)]

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