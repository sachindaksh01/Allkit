from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from rembg import remove
from PIL import Image
import io
import zipfile
import tempfile
import os
from typing import List, Optional
import base64

router = APIRouter()

async def process_image(file: UploadFile, bg_color: Optional[str] = None) -> io.BytesIO:
    try:
        # Read image file
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents)).convert("RGBA")
        
        # Remove background
        output_image = remove(input_image)
        
        # Add background color if specified
        if bg_color and bg_color.lower() != 'transparent':
            bg_color_rgba = tuple(int(bg_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)) + (255,)
            bg = Image.new("RGBA", output_image.size, bg_color_rgba)
            bg.paste(output_image, mask=output_image.split()[3])
            output_image = bg
        
        # Save to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        return img_byte_arr
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@router.post("/remove-background")
async def remove_background(
    files: List[UploadFile] = File(...),
    bg_color: Optional[str] = Form(None)
):
    try:
        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files uploaded")

        # Create a ZIP file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for file in files:
                # Process each image
                img_byte_arr = await process_image(file, bg_color)
                
                # Add to ZIP with original filename (but .png extension)
                filename = os.path.splitext(file.filename)[0] + '.png'
                zip_file.writestr(filename, img_byte_arr.getvalue())

        # Prepare ZIP for download
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=transparent-images.zip"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/download-zip")
async def download_zip(
    files: List[UploadFile] = File(...),
    bg_color: Optional[str] = Form(None)
):
    try:
        with tempfile.TemporaryDirectory() as tmpdirname:
            zip_path = os.path.join(tmpdirname, 'images.zip')
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for file in files:
                    img_byte_arr = await process_image(file, bg_color)
                    zipf.writestr(
                        f"{os.path.splitext(file.filename)[0]}_processed.png",
                        img_byte_arr.getvalue()
                    )
            
            return StreamingResponse(
                open(zip_path, 'rb'),
                media_type='application/zip',
                headers={'Content-Disposition': 'attachment; filename=images.zip'}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 