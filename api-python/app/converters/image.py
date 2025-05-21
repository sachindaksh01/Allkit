from PIL import Image
import io
from fastapi import UploadFile, HTTPException
import img2pdf

async def convert_image_to_pdf(file: UploadFile) -> bytes:
    """Convert an image file to PDF."""
    try:
        # Read the image file
        contents = await file.read()
        
        # Validate image format
        try:
            img = Image.open(io.BytesIO(contents))
            img.verify()  # Verify it's a valid image
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Convert to PDF using img2pdf
        pdf_bytes = img2pdf.convert(contents)
        return pdf_bytes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert image: {str(e)}")
    finally:
        await file.close() 