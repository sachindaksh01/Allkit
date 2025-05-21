from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import tempfile
import os
from PyPDF2 import PdfReader, PdfWriter
import json
import traceback

router = APIRouter()

@router.post("/api/pdf/organize/")
async def organize_pdf(
    files: list[UploadFile] = File(...),
    pageOrder: str = Form(...)
):
    try:
        print("DEBUG: Endpoint hit")
        print("DEBUG: Received files:", [f.filename for f in files])
        print("DEBUG: Received pageOrder:", pageOrder)
        # Parse page order from form data
        page_order = json.loads(pageOrder)
        print("DEBUG: Parsed page_order:", page_order)
        
        # Create a temporary directory to store files
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded files
            file_paths = []
            for file in files:
                file_path = os.path.join(temp_dir, file.filename)
                with open(file_path, "wb") as buffer:
                    content = await file.read()
                    buffer.write(content)
                file_paths.append(file_path)
            print("DEBUG: Files saved to temp:", file_paths)
            
            # Create output PDF
            output = PdfWriter()
            default_width, default_height = 595, 842  # A4 size in points
            
            # Process pages according to order
            for page_info in page_order:
                print("DEBUG: Processing page_info:", page_info)
                file_name = page_info.get("fileName")
                page_number = page_info.get("pageNumber")
                is_blank = page_info.get("isBlank", False)
                
                if is_blank:
                    # Try to use previous page size, else default
                    if len(output.pages) > 0:
                        prev_page = output.pages[-1]
                        width = float(prev_page.mediabox.width)
                        height = float(prev_page.mediabox.height)
                    else:
                        width, height = default_width, default_height
                    print(f"DEBUG: Adding blank page with size {width}x{height}")
                    output.add_blank_page(width=width, height=height)
                else:
                    # Find the corresponding file
                    file_path = next((p for p in file_paths if os.path.basename(p) == file_name), None)
                    print(f"DEBUG: Adding page {page_number} from file {file_name} (path: {file_path})")
                    if file_path:
                        reader = PdfReader(file_path)
                        if 0 <= page_number - 1 < len(reader.pages):
                            output.add_page(reader.pages[page_number - 1])
                        else:
                            print(f"DEBUG: Invalid page number {page_number} for file {file_name}")
                    else:
                        print(f"DEBUG: File not found for {file_name}")
            
            # Save the organized PDF
            output_path = os.path.join(temp_dir, "organized.pdf")
            with open(output_path, "wb") as output_file:
                output.write(output_file)
            print("DEBUG: PDF written to", output_path)
            
            # Return the organized PDF
            return FileResponse(
                output_path,
                media_type="application/pdf",
                filename="organized.pdf"
            )
            
    except Exception as e:
        print("DEBUG: Exception occurred")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e)) 