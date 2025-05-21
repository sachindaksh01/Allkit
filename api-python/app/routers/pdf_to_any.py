from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from ..converters.pdf_converter import PDFConverter
import io

router = APIRouter()

@router.post("/pdf-to-any")
async def convert_pdf(file: UploadFile, output_type: str):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # Read file content
        content = await file.read()
        
        # Convert based on output type
        if output_type == 'image':
            result = PDFConverter.to_images(io.BytesIO(content))
            return StreamingResponse(
                io.BytesIO(result),
                media_type='application/zip',
                headers={'Content-Disposition': 'attachment; filename=converted_images.zip'}
            )
        elif output_type == 'word':
            result = PDFConverter.to_word(io.BytesIO(content))
            return StreamingResponse(
                io.BytesIO(result),
                media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                headers={'Content-Disposition': 'attachment; filename=converted.docx'}
            )
        elif output_type == 'excel':
            result = PDFConverter.to_excel(io.BytesIO(content))
            return StreamingResponse(
                io.BytesIO(result),
                media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                headers={'Content-Disposition': 'attachment; filename=converted.xlsx'}
            )
        elif output_type == 'powerpoint':
            result = PDFConverter.to_powerpoint(io.BytesIO(content))
            return StreamingResponse(
                io.BytesIO(result),
                media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation',
                headers={'Content-Disposition': 'attachment; filename=converted.pptx'}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid output type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 