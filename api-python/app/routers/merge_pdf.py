from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from PyPDF2 import PdfMerger
import io
import tempfile
import os

router = APIRouter()

@router.post("/merge-pdf")
async def merge_pdf(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required")
    
    # Validate that all files are PDFs
    for file in files:
        if not file.content_type == "application/pdf":
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
    
    try:
        merger = PdfMerger()
        
        # Create temporary files to store the uploaded PDFs
        temp_files = []
        for file in files:
            content = await file.read()
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_file.write(content)
            temp_file.close()
            temp_files.append(temp_file.name)
        
        # Merge PDFs
        for temp_file in temp_files:
            merger.append(temp_file)
        
        # Create output buffer
        output_buffer = io.BytesIO()
        merger.write(output_buffer)
        merger.close()
        
        # Clean up temporary files
        for temp_file in temp_files:
            os.unlink(temp_file)
        
        # Reset buffer position
        output_buffer.seek(0)
        
        # Return merged PDF
        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=merged.pdf"
            }
        )
        
    except Exception as e:
        # Clean up temporary files in case of error
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e)) 