from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import tempfile
import os
from PyPDF2 import PdfReader, PdfWriter
import json
import traceback
import io

router = APIRouter()

@router.post("/organize-pdf")
async def organize_pdf(
    files: list[UploadFile] = File(...),
    pageOrder: str = Form(...)
):
    try:
        print("DEBUG: Endpoint hit")
        page_order = json.loads(pageOrder)
        print("DEBUG: Page order loaded:", page_order)
        print("DEBUG: Files received:", [f.filename for f in files])
        with tempfile.TemporaryDirectory() as temp_dir:
            file_paths = []
            for file in files:
                file_path = os.path.join(temp_dir, file.filename)
                try:
                    content = await file.read()
                    with open(file_path, "wb") as buffer:
                        buffer.write(content)
                except Exception as file_err:
                    print(f"ERROR: Failed to save file {file.filename}: {file_err}")
                    raise HTTPException(status_code=400, detail=f"Failed to save file {file.filename}: {file_err}")
                file_paths.append(file_path)
            print("DEBUG: Files saved to temp:", file_paths)

            output = PdfWriter()
            default_width, default_height = 595, 842

            for page_info in page_order:
                print("DEBUG: Processing page_info:", page_info)
                file_name = page_info["fileName"]
                page_number = page_info["pageNumber"]
                is_blank = page_info.get("isBlank", False)

                if is_blank:
                    if len(output.pages) > 0:
                        prev_page = output.pages[-1]
                        width = float(prev_page.mediabox.width)
                        height = float(prev_page.mediabox.height)
                    else:
                        width, height = default_width, default_height
                    print(f"DEBUG: Adding blank page with size {width}x{height}")
                    output.add_blank_page(width=width, height=height)
                else:
                    file_path = next((p for p in file_paths if os.path.basename(p) == file_name), None)
                    print(f"DEBUG: Adding page {page_number} from file {file_name} (path: {file_path})")
                    if file_path:
                        try:
                            reader = PdfReader(file_path)
                        except Exception as pdf_err:
                            print(f"ERROR: Failed to read PDF {file_name}: {pdf_err}")
                            raise HTTPException(status_code=400, detail=f"Failed to read PDF {file_name}: {pdf_err}")
                        if 0 <= page_number - 1 < len(reader.pages):
                            try:
                                output.add_page(reader.pages[page_number - 1])
                            except Exception as add_page_err:
                                print(f"ERROR: Failed to add page {page_number} from {file_name}: {add_page_err}")
                                raise HTTPException(status_code=400, detail=f"Failed to add page {page_number} from {file_name}: {add_page_err}")
                        else:
                            print(f"ERROR: Invalid page number {page_number} for file {file_name}")
                            raise HTTPException(status_code=400, detail=f"Invalid page number {page_number} for file {file_name}")
                    else:
                        print(f"ERROR: File not found for {file_name}")
                        raise HTTPException(status_code=400, detail=f"File not found for {file_name}")

            # Save the organized PDF to a BytesIO buffer
            output_buffer = io.BytesIO()
            try:
                output.write(output_buffer)
            except Exception as write_err:
                print(f"ERROR: Failed to write output PDF: {write_err}")
                raise HTTPException(status_code=500, detail=f"Failed to write output PDF: {write_err}")
            output_buffer.seek(0)
            print("DEBUG: PDF written to buffer")

            return StreamingResponse(
                output_buffer,
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=organized.pdf"}
            )
    except HTTPException as he:
        print(f"DEBUG: HTTPException occurred: {he.detail}")
        raise he
    except Exception as e:
        print("DEBUG: Exception occurred")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 