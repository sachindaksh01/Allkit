from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
import os
import tempfile
from typing import Literal
import subprocess
import shutil
import zipfile
import io

router = APIRouter()

# Ghostscript PDFSETTINGS mapping
GHOSTSCRIPT_PRESETS = {
    "extreme": "/screen",        # lowest quality, smallest size
    "recommended": "/ebook",     # good quality, small size
    "less": "/printer"           # high quality, larger size
}

@router.post("/compress-pdf")
async def compress_pdf(
    files: list[UploadFile] = File(...),
    preset: Literal["extreme", "recommended", "less"] = Form("recommended")
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as zipf:
        for file in files:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as input_file:
                content = await file.read()
                input_file.write(content)
                input_file.flush()
                input_path = input_file.name

            output_path = input_path.replace('.pdf', '_compressed.pdf')
            gs_preset = GHOSTSCRIPT_PRESETS.get(preset, "/ebook")
            gs_command = [
                "gswin64c",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                f"-dPDFSETTINGS={gs_preset}",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                f"-sOutputFile={output_path}",
                input_path
            ]
            try:
                result = subprocess.run(gs_command, capture_output=True, text=True)
                print(f"Ghostscript stdout for {file.filename}:", result.stdout)
                print(f"Ghostscript stderr for {file.filename}:", result.stderr)
                if result.returncode != 0:
                    raise Exception(f"Ghostscript failed: {result.stderr}")
                if not os.path.exists(output_path):
                    raise Exception("Output PDF not created!")
                # Add compressed file to zip
                zipf.write(output_path, arcname=f"compressed_{file.filename}")
            except Exception as e:
                print(f"Ghostscript error for {file.filename}:", str(e))
            finally:
                try:
                    os.unlink(input_path)
                except:
                    pass
                try:
                    if os.path.exists(output_path):
                        os.unlink(output_path)
                except:
                    pass
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=compressed_pdfs.zip"}
    ) 