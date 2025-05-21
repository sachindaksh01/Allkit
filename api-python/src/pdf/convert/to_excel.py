import os
import tempfile
import pandas as pd
import tabula
from pdf2image import convert_from_path
import pytesseract
from PIL import Image
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFToExcelConverter:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        
    def convert(self, input_path: str, output_path: str) -> bool:
        """
        Convert PDF to Excel format
        
        Args:
            input_path (str): Path to input PDF file
            output_path (str): Path to output Excel file
            
        Returns:
            bool: True if conversion successful, False otherwise
        """
        try:
            # First try to extract tables using tabula-py
            logger.info("Attempting to extract tables using tabula-py...")
            tables = tabula.read_pdf(input_path, pages='all', multiple_tables=True)
            
            if tables:
                # If tables are found, convert them to Excel
                logger.info(f"Found {len(tables)} tables in the PDF")
                with pd.ExcelWriter(output_path) as writer:
                    for i, table in enumerate(tables):
                        table.to_excel(writer, sheet_name=f'Table_{i+1}', index=False)
                return True
            
            # If no tables found, try OCR
            logger.info("No tables found. Attempting OCR...")
            return self._convert_with_ocr(input_path, output_path)
            
        except Exception as e:
            logger.error(f"Error converting PDF to Excel: {str(e)}")
            return False
        finally:
            # Clean up temporary files
            self._cleanup()
    
    def _convert_with_ocr(self, input_path: str, output_path: str) -> bool:
        """
        Convert PDF to Excel using OCR
        
        Args:
            input_path (str): Path to input PDF file
            output_path (str): Path to output Excel file
            
        Returns:
            bool: True if conversion successful, False otherwise
        """
        try:
            # Convert PDF to images
            images = convert_from_path(input_path)
            
            # Extract text from images using OCR
            data = []
            for i, image in enumerate(images):
                text = pytesseract.image_to_string(image)
                # Split text into rows and columns
                rows = [row.split() for row in text.split('\n') if row.strip()]
                if rows:
                    data.extend(rows)
            
            if data:
                # Convert to DataFrame and save as Excel
                df = pd.DataFrame(data)
                df.to_excel(output_path, index=False, header=False)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error in OCR conversion: {str(e)}")
            return False
    
    def _cleanup(self):
        """Clean up temporary files"""
        try:
            for file in os.listdir(self.temp_dir):
                os.remove(os.path.join(self.temp_dir, file))
            os.rmdir(self.temp_dir)
        except Exception as e:
            logger.error(f"Error cleaning up temporary files: {str(e)}")

def convert_pdf_to_excel(input_path: str, output_path: str) -> bool:
    """
    Convert PDF to Excel format
    
    Args:
        input_path (str): Path to input PDF file
        output_path (str): Path to output Excel file
        
    Returns:
        bool: True if conversion successful, False otherwise
    """
    converter = PDFToExcelConverter()
    return converter.convert(input_path, output_path) 