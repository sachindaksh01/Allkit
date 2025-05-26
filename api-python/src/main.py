from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
from .pdf.from.excel_to_pdf import convert_excel_to_pdf
from .pdf.from.powerpoint_to_pdf import convert_powerpoint_to_pdf

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/pdf/from/excel")
async def excel_to_pdf(file: UploadFile = File(...)):
    try:
        pdf_bytes = await convert_excel_to_pdf(file)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={file.filename.rsplit('.', 1)[0]}.pdf"}
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/from/powerpoint")
async def powerpoint_to_pdf(file: UploadFile = File(...)):
    try:
        pdf_bytes = await convert_powerpoint_to_pdf(file)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={file.filename.rsplit('.', 1)[0]}.pdf"}
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 