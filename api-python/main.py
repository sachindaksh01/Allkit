from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image
import io
import os
import zipfile
from typing import List, Optional
import rembg
import tempfile
import shutil
import uuid
from PyPDF2 import PdfReader, PdfWriter
import json

app = FastAPI(
    title="AllKit API",
    description="Backend API for AllKit tools platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory if it doesn't exist
TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

def convert_image(image: Image.Image, format: str, quality: int = 85) -> bytes:
    """Convert image to specified format with quality setting"""
    output = io.BytesIO()
    
    if format.lower() == "jpg":
        # Convert to RGB if image is in RGBA mode
        if image.mode == "RGBA":
            image = image.convert("RGB")
        image.save(output, format="JPEG", quality=quality)
    else:
        image.save(output, format=format.upper(), quality=quality)
    
    return output.getvalue()

@app.post("/convert")
async def convert_images(
    files: List[UploadFile] = File(...),
    format: str = "png",
    quality: int = 85
):
    try:
        # Create a temporary directory for this request
        temp_dir = os.path.join(TEMP_DIR, str(uuid.uuid4()))
        os.makedirs(temp_dir, exist_ok=True)

        try:
            # Process each image
            converted_files = []
            for file in files:
                # Read and convert image
                contents = await file.read()
                image = Image.open(io.BytesIO(contents))
                
                # Convert image
                converted_data = convert_image(image, format, quality)
                
                # Save converted image
                output_filename = f"{os.path.splitext(file.filename)[0]}.{format}"
                output_path = os.path.join(temp_dir, output_filename)
                
                with open(output_path, "wb") as f:
                    f.write(converted_data)
                
                converted_files.append(output_path)
            
            # Create zip file
            zip_path = os.path.join(temp_dir, "converted_images.zip")
            with zipfile.ZipFile(zip_path, "w") as zipf:
                for file_path in converted_files:
                    zipf.write(file_path, os.path.basename(file_path))
            
            # Read the zip file
            with open(zip_path, "rb") as f:
                zip_data = f.read()
            
            # Clean up
            shutil.rmtree(temp_dir)
            
            # Return the zip file as a streaming response
            return StreamingResponse(
                io.BytesIO(zip_data),
                media_type="application/zip",
                headers={
                    "Content-Disposition": "attachment; filename=converted_images.zip"
                }
            )
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            raise e
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/remove-background")
async def remove_background(
    files: List[UploadFile] = File(...),
    background_color: Optional[str] = Form(None)
):
    # Create a temporary directory for processing
    temp_dir = f"temp_{uuid.uuid4()}"
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        # Create a ZIP file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for file in files:
                # Read the uploaded file
                contents = await file.read()
                input_image = Image.open(io.BytesIO(contents))
                
                # Remove background
                output_image = rembg.remove(input_image)
                
                # If background color is specified and not 'transparent', add the color
                if background_color and background_color.lower() != 'transparent':
                    # Create a new image with the specified background color
                    background = Image.new('RGBA', output_image.size, background_color)
                    # Composite the transparent image over the background
                    output_image = Image.alpha_composite(background, output_image)
                
                # Save the processed image to a bytes buffer
                output_buffer = io.BytesIO()
                output_image.save(output_buffer, format='PNG', optimize=True)
                output_buffer.seek(0)
                
                # Add to ZIP file
                filename = f"{os.path.splitext(file.filename)[0]}.png"
                zip_file.writestr(filename, output_buffer.getvalue())
        
        # Prepare the ZIP file for download
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=transparent-images.zip"
            }
        )
    
    finally:
        # Clean up temporary directory
        if os.path.exists(temp_dir):
            for file in os.listdir(temp_dir):
                os.remove(os.path.join(temp_dir, file))
            os.rmdir(temp_dir)

@app.post("/organize-pdf/")
async def organize_pdf(
    files: list[UploadFile] = File(...),
    pageOrder: str = Form(...)
):
    TEMP_DIR = "temp"
    file_map = {}
    for file in files:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(TEMP_DIR, f"{file_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_map[file.filename] = file_path

    # Parse page order
    page_order = json.loads(pageOrder)
    writer = PdfWriter()
    for page in page_order:
        if page.get("isBlank"):
            writer.add_blank_page(width=595, height=842)  # A4 size
        else:
            file_path = file_map[page["fileName"]]
            reader = PdfReader(file_path)
            writer.add_page(reader.pages[page["pageNumber"] - 1])

    output_path = os.path.join(TEMP_DIR, f"organized_{uuid.uuid4().hex}.pdf")
    with open(output_path, "wb") as f:
        writer.write(f)

    return FileResponse(output_path, filename="organized.pdf")

@app.get("/")
async def root():
    return {"message": "Welcome to AllKit API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 