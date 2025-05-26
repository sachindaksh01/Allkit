import os
import tempfile
from fastapi import UploadFile, HTTPException
import subprocess
import sys
import io

async def convert_powerpoint_to_pdf(file: UploadFile) -> bytes:
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            input_path = os.path.join(temp_dir, file.filename)
            with open(input_path, 'wb') as f:
                f.write(await file.read())
            output_path = os.path.join(temp_dir, f"{os.path.splitext(file.filename)[0]}.pdf")
            soffice_cmd = 'soffice'
            if sys.platform == 'win32':
                soffice_path = r'C:\Program Files\LibreOffice\program\soffice.exe'
                soffice_cmd = soffice_path if os.path.exists(soffice_path) else 'soffice'
            result = subprocess.run([
                soffice_cmd, '--headless', '--convert-to', 'pdf', '--outdir', temp_dir, input_path
            ], capture_output=True)
            if result.returncode != 0:
                raise HTTPException(status_code=500, detail=f"LibreOffice conversion failed: {result.stderr.decode(errors='ignore')}")
            if not os.path.exists(output_path):
                raise HTTPException(status_code=500, detail="PDF not created.")
            with open(output_path, 'rb') as f:
                return f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 