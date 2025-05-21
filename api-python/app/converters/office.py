import os
import tempfile
from fastapi import UploadFile, HTTPException
import subprocess
from typing import Literal
import sys
import traceback

async def convert_office_to_pdf(file: UploadFile, doc_type: Literal['word', 'powerpoint', 'excel']) -> bytes:
    """Convert Office documents (Word, PowerPoint, Excel) to PDF using LibreOffice CLI."""
    try:
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded file
            input_path = os.path.join(temp_dir, file.filename)
            with open(input_path, 'wb') as f:
                contents = await file.read()
                f.write(contents)
            
            # Set output path
            output_path = os.path.join(temp_dir, f"{os.path.splitext(file.filename)[0]}.pdf")
            
            # Find soffice executable
            soffice_cmd = 'soffice'
            if sys.platform == 'win32':
                soffice_cmd = r'C:\Program Files\LibreOffice\program\soffice.exe'  # <-- FULL PATH
            print("convert_office_to_pdf called, using soffice_cmd:", soffice_cmd)
            
            # Convert using LibreOffice
            try:
                result = subprocess.run([
                    soffice_cmd,
                    '--headless',
                    '--convert-to', 'pdf',
                    '--outdir', temp_dir,
                    input_path
                ], check=True, capture_output=True)
            except subprocess.CalledProcessError as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"LibreOffice conversion failed: {e.stderr.decode(errors='ignore')}"
                )
            except FileNotFoundError:
                raise HTTPException(
                    status_code=500,
                    detail="LibreOffice (soffice) is not installed or not in PATH. Please install it and add to PATH."
                )
            
            # Read the converted PDF
            if not os.path.exists(output_path):
                raise HTTPException(
                    status_code=500,
                    detail="PDF conversion failed - output file not found"
                )
            
            with open(output_path, 'rb') as f:
                pdf_bytes = f.read()
            
            return pdf_bytes
    except Exception as e:
        print("EXCEPTION:", e)
        print(traceback.format_exc())
        if not isinstance(e, HTTPException):
            raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
        raise e
    finally:
        await file.close() 