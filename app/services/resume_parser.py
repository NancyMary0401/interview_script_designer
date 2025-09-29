import logging
import os
from typing import Optional, Union, BinaryIO
import PyPDF2
from PyPDF2.errors import PdfReadError
from io import BytesIO

logger = logging.getLogger(__name__)

class ResumeParser:
    """Service for parsing resume content from various file formats."""
    
    @staticmethod
    async def parse_resume(file: Union[bytes, BinaryIO], filename: str) -> str:
        """
        Parse resume content from a file.
        
        Args:
            file: File content as bytes or file-like object
            filename: Original filename (used to determine file type)
            
        Returns:
            str: Extracted text content
            
        Raises:
            ValueError: If the file type is not supported or parsing fails
        """
        try:
            file_ext = os.path.splitext(filename.lower())[1]
            
            if file_ext == '.pdf':
                return await ResumeParser._parse_pdf(file)
            elif file_ext in ['.txt', '.md', '.markdown']:
                if isinstance(file, bytes):
                    return file.decode('utf-8', errors='replace')
                return file.read().decode('utf-8', errors='replace')
            else:
                raise ValueError(f"Unsupported file type: {file_ext}")
                
        except Exception as e:
            logger.error(f"Error parsing resume: {str(e)}")
            raise ValueError(f"Failed to parse resume: {str(e)}")
    
    @staticmethod
    async def _parse_pdf(pdf_content: Union[bytes, BinaryIO]) -> str:
        """Extract text from PDF content."""
        try:
            # Ensure we have a file-like object
            if isinstance(pdf_content, bytes):
                pdf_file = BytesIO(pdf_content)
            else:
                pdf_file = pdf_content
                
            # Reset file pointer to the beginning
            if hasattr(pdf_file, 'seek'):
                pdf_file.seek(0)
                
            # Read PDF content
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text_parts = []
            
            for page in pdf_reader.pages:
                try:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
                except Exception as page_error:
                    logger.warning(f"Error extracting text from PDF page: {str(page_error)}")
                    continue
            
            if not text_parts:
                raise ValueError("No text could be extracted from the PDF")
                
            return "\n\n".join(text_parts)
            
        except PdfReadError as e:
            raise ValueError(f"Invalid PDF file: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error processing PDF: {str(e)}")
        finally:
            # Clean up file-like object if we created it
            if 'pdf_file' in locals() and isinstance(pdf_file, BytesIO):
                pdf_file.close()
