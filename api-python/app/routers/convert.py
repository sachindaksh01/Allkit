from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Literal, List
from ..converters import image, office
from fastapi.responses import StreamingResponse
import io
import zipfile

router = APIRouter()

@router.post("/convert-to-pdf")
async def convert_to_pdf(
    files: List[UploadFile] = File(...),
    type: Literal['image', 'word', 'powerpoint', 'excel'] = Form(...)
):
    """Convert various file types to PDF. Supports single or multiple files."""
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files uploaded")
        for file in files:
            if file.size and file.size > 50 * 1024 * 1024:
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} size must be less than 50MB"
                )
        pdf_results = []
        for file in files:
            if type == 'image':
                pdf_bytes = await image.convert_image_to_pdf(file)
            elif type in ['word', 'powerpoint', 'excel']:
                pdf_bytes = await office.convert_office_to_pdf(file, type)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported conversion type: {type}"
                )
            pdf_results.append((file.filename, pdf_bytes))
        # If only one file, return PDF directly
        if len(pdf_results) == 1:
            filename = pdf_results[0][0].rsplit('.', 1)[0] + '.pdf'
            return StreamingResponse(
                io.BytesIO(pdf_results[0][1]),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                }
            )
        # If multiple files, return ZIP
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zipf:
            for orig_name, pdf_bytes in pdf_results:
                pdf_name = orig_name.rsplit('.', 1)[0] + '.pdf'
                zipf.writestr(pdf_name, pdf_bytes)
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=converted_pdfs.zip"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Conversion failed: {str(e)}"
        ) 