from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
import os
import tempfile
from pathlib import Path
import subprocess
import logging
import io
import zipfile
from typing import List
import platform

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def get_soffice_cmd():
    return "soffice" if platform.system() == "Windows" else "libreoffice"

@router.post("/from/word")
async def convert_word_to_pdf(files: List[UploadFile] = File(...)):
    if not files:
        return JSONResponse(status_code=400, content={"detail": "No files uploaded."})
    if len(files) > 10:
        return JSONResponse(status_code=400, content={"detail": "Maximum 10 files allowed per request."})

    pdf_files = []
    temp_files = []
    output_dirs = []
    errors = []

    soffice_cmd = get_soffice_cmd()

    for file in files:
        if not file.filename.endswith((".doc", ".docx")):
            errors.append(f"Unsupported file: {file.filename}")
            continue
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_doc:
                content = await file.read()
                temp_doc.write(content)
                temp_doc_path = temp_doc.name
                temp_files.append(temp_doc_path)

            output_dir = tempfile.mkdtemp()
            output_dirs.append(output_dir)
            pdf_path = None
            result = subprocess.run([
                soffice_cmd,
                "--headless",
                "--convert-to", "pdf",
                "--outdir", output_dir,
                temp_doc_path
            ], capture_output=True, text=True)

            logger.info(f"LibreOffice stdout for {file.filename}: {result.stdout}")
            logger.info(f"LibreOffice stderr for {file.filename}: {result.stderr}")

            if result.returncode != 0:
                logger.error(f"LibreOffice error for {file.filename}: {result.stderr}")
                errors.append(f"LibreOffice error for {file.filename}: {result.stderr}")
                continue

            pdf_filename = Path(temp_doc_path).with_suffix('.pdf').name
            pdf_path = os.path.join(output_dir, pdf_filename)

            if not os.path.exists(pdf_path):
                errors.append(f"PDF not created for {file.filename}.")
                continue

            with open(pdf_path, "rb") as f:
                pdf_content = f.read()
                pdf_files.append((Path(file.filename).stem + ".pdf", pdf_content))
        except Exception as e:
            logger.error(f"Error processing {file.filename}: {str(e)}")
            errors.append(f"Error processing {file.filename}: {str(e)}")
        finally:
            try:
                os.unlink(temp_doc_path)
            except Exception:
                pass

    # Clean up output dirs
    for output_dir in output_dirs:
        try:
            for fname in os.listdir(output_dir):
                os.unlink(os.path.join(output_dir, fname))
            os.rmdir(output_dir)
        except Exception:
            pass

    if not pdf_files:
        # Return all errors for debugging
        return JSONResponse(status_code=500, content={"detail": "No valid Word files were converted.", "errors": errors})

    if len(pdf_files) == 1:
        filename, pdf_content = pdf_files[0]
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else:
        # Multiple files: return a ZIP
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            for filename, pdf_content in pdf_files:
                zip_file.writestr(filename, pdf_content)
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/x-zip-compressed",
            headers={"Content-Disposition": "attachment; filename=converted_pdfs.zip"}
        ) 