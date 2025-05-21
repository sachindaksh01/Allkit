from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image
import io
import zipfile
import tempfile
import os
from typing import List, Optional

router = APIRouter()

@router.post("/convert")
async def convert_images(
    files: List[UploadFile] = File(...),
    output_format: str = Form(...),
    quality: int = Form(80),
    scale: int = Form(100)
):
    try:
        with tempfile.TemporaryDirectory() as tmpdirname:
            zip_path = os.path.join(tmpdirname, 'converted_images.zip')
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for file in files:
                    # Read image
                    contents = await file.read()
                    img = Image.open(io.BytesIO(contents))
                    
                    # Resize if needed
                    if scale != 100:
                        new_size = (int(img.width * scale / 100), int(img.height * scale / 100))
                        img = img.resize(new_size, Image.Resampling.LANCZOS)
                    
                    # Convert and save
                    output = io.BytesIO()
                    img.save(output, format=output_format.upper(), quality=quality)
                    output.seek(0)
                    
                    # Add to zip
                    zipf.writestr(
                        f"{os.path.splitext(file.filename)[0]}.{output_format.lower()}",
                        output.getvalue()
                    )
            
            return StreamingResponse(
                open(zip_path, 'rb'),
                media_type='application/zip',
                headers={'Content-Disposition': 'attachment; filename=converted_images.zip'}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 