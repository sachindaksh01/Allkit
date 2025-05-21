# PDF to Excel Converter

## Overview
The PDF to Excel Converter is a tool that converts PDF files to Excel format. It supports both table-based and OCR-based conversion methods.

## Features
- Convert PDF files to Excel format
- Support for table extraction
- OCR-based conversion for non-tabular content
- Concurrent conversion support
- Error handling and validation
- Progress tracking
- Memory efficient processing

## API Documentation

### Endpoint
```
POST /api/pdf/convert/to-excel
```

### Request
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - file: PDF file (required, max size: 50MB)

### Response
- Success (200 OK):
  - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  - Headers:
    - Content-Disposition: attachment; filename="converted.xlsx"
  - Body: Excel file content

- Error (400 Bad Request):
  - Content-Type: application/json
  - Body: { "error": "Error message" }

### Error Codes
- 400: Bad Request (Invalid file, missing file, file too large)
- 500: Internal Server Error

## Code Documentation

### PDFToExcelConverter Class

```python
class PDFToExcelConverter:
    def __init__(self):
        """Initialize the converter with a temporary directory."""
        
    def convert(self, input_path: str, output_path: str) -> bool:
        """
        Convert PDF to Excel format.
        
        Args:
            input_path (str): Path to input PDF file
            output_path (str): Path to output Excel file
            
        Returns:
            bool: True if conversion successful, False otherwise
        """
        
    def _convert_with_ocr(self, input_path: str, output_path: str) -> bool:
        """
        Convert PDF to Excel using OCR.
        
        Args:
            input_path (str): Path to input PDF file
            output_path (str): Path to output Excel file
            
        Returns:
            bool: True if conversion successful, False otherwise
        """
        
    def _cleanup(self):
        """Clean up temporary files."""
```

### Helper Functions

```python
def convert_pdf_to_excel(input_path: str, output_path: str) -> bool:
    """
    Convert PDF to Excel format.
    
    Args:
        input_path (str): Path to input PDF file
        output_path (str): Path to output Excel file
        
    Returns:
        bool: True if conversion successful, False otherwise
    """
```

## Performance Requirements

### Conversion Time
- Average conversion time: < 5 seconds
- Median conversion time: < 5 seconds
- Standard deviation: < 2 seconds
- Large file conversion time: < 30 seconds
- Error handling time: < 1 second

### Memory Usage
- Memory increase during conversion: < 500MB
- Concurrent conversions (5): < 15 seconds total

### File Size Limits
- Maximum input file size: 50MB
- Supported formats: PDF

## Testing

### Unit Tests
```bash
pytest api-python/tests/test_pdf_to_excel.py -v
```

### Integration Tests
```bash
pytest api-python/tests/integration/test_pdf_to_excel_integration.py -v
```

### End-to-End Tests
```bash
pytest api-python/tests/e2e/test_pdf_to_excel_e2e.py -v
```

### Performance Tests
```bash
pytest api-python/tests/performance/test_pdf_to_excel_performance.py -v
```

### Load Testing
```bash
locust -f api-python/tests/performance/test_pdf_to_excel_performance.py
```

## Dependencies
- tabula-py: For table extraction
- pdf2image: For PDF to image conversion
- pytesseract: For OCR
- pandas: For data manipulation
- openpyxl: For Excel file creation

## Installation
1. Install system dependencies:
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr
sudo apt-get install poppler-utils

# Windows
# Download and install Tesseract from https://github.com/UB-Mannheim/tesseract/wiki
# Download and install Poppler from http://blog.alivate.com.au/poppler-windows/
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage Examples

### Basic Usage
```python
from src.pdf.convert.to_excel import convert_pdf_to_excel

# Convert PDF to Excel
result = convert_pdf_to_excel('input.pdf', 'output.xlsx')
if result:
    print("Conversion successful")
else:
    print("Conversion failed")
```

### Using the Converter Class
```python
from src.pdf.convert.to_excel import PDFToExcelConverter

# Create converter instance
converter = PDFToExcelConverter()

# Convert PDF to Excel
result = converter.convert('input.pdf', 'output.xlsx')
if result:
    print("Conversion successful")
else:
    print("Conversion failed")
```

## Error Handling
The converter handles various error cases:
- Invalid file format
- File size exceeding limit
- Missing files
- OCR failures
- Table extraction failures

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

 