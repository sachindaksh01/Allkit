from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.tools.image import converter_router, bgremover_router
from app.routers.merge_pdf import router as merge_pdf_router
from app.routers.pdf_compression import router as pdf_compression_router
from app.routers.pdf_to_any import router as pdf_to_any_router
from app.routers.organize_pdf import router as organize_pdf_router
from .routers import convert

# Import the word_to_pdf router
# Using absolute import relative to the project root where 'src' is a package
from src.pdf.converters.word_to_pdf import router as word_to_pdf_router

app = FastAPI()

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(converter_router, prefix="/tools/image/converter", tags=["tools"])
app.include_router(bgremover_router, prefix="/tools/image/bgremover", tags=["tools"])
app.include_router(merge_pdf_router, prefix="/tools/pdf", tags=["tools"])
app.include_router(pdf_compression_router, prefix="/tools/pdf", tags=["tools"])
app.include_router(pdf_to_any_router, prefix="/api/pdf", tags=["convert"])
app.include_router(organize_pdf_router, prefix="/api/pdf", tags=["tools"])
app.include_router(convert.router, prefix="/api", tags=["convert"])

# Include the word_to_pdf router
app.include_router(word_to_pdf_router, prefix="/api/pdf")

# You can add other root level endpoints here if needed
# @app.get("/")
# async def root():
#     return {"message": "Welcome to AllKit API"}

# @app.get("/health")
# async g_check():
#     return {"status": "healthy"} 