import os
import pytest
import requests
from fastapi.testclient import TestClient
from src.main import app
from src.pdf.convert.to_excel import PDFToExcelConverter

client = TestClient(app)

@pytest.fixture
def sample_pdf_path():
    return os.path.join(os.path.dirname(__file__), '../test_files/sample.pdf')

@pytest.fixture
def output_path():
    return os.path.join(os.path.dirname(__file__), '../test_files/output.xlsx')

def test_pdf_to_excel_api_endpoint(sample_pdf_path):
    """Test the PDF to Excel conversion API endpoint"""
    with open(sample_pdf_path, 'rb') as f:
        files = {'file': ('sample.pdf', f, 'application/pdf')}
        response = client.post('/api/pdf/convert/to-excel', files=files)
        
    assert response.status_code == 200
    assert response.headers['content-type'] == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    assert 'content-disposition' in response.headers
    assert 'attachment' in response.headers['content-disposition']

def test_pdf_to_excel_api_invalid_file():
    """Test API endpoint with invalid file"""
    files = {'file': ('invalid.txt', b'invalid content', 'text/plain')}
    response = client.post('/api/pdf/convert/to-excel', files=files)
    
    assert response.status_code == 400
    assert 'error' in response.json()

def test_pdf_to_excel_api_large_file(sample_pdf_path):
    """Test API endpoint with file exceeding size limit"""
    # Create a large file by duplicating content
    with open(sample_pdf_path, 'rb') as f:
        content = f.read()
    
    large_content = content * 1000  # Make file larger than 50MB
    
    files = {'file': ('large.pdf', large_content, 'application/pdf')}
    response = client.post('/api/pdf/convert/to-excel', files=files)
    
    assert response.status_code == 400
    assert 'error' in response.json()
    assert 'size limit' in response.json()['error'].lower()

def test_pdf_to_excel_api_missing_file():
    """Test API endpoint with missing file"""
    response = client.post('/api/pdf/convert/to-excel')
    
    assert response.status_code == 400
    assert 'error' in response.json()
    assert 'file' in response.json()['error'].lower()

def test_pdf_to_excel_conversion_flow(sample_pdf_path, output_path):
    """Test complete conversion flow from API to file system"""
    # First convert using API
    with open(sample_pdf_path, 'rb') as f:
        files = {'file': ('sample.pdf', f, 'application/pdf')}
        response = client.post('/api/pdf/convert/to-excel', files=files)
    
    assert response.status_code == 200
    
    # Save the response content
    with open(output_path, 'wb') as f:
        f.write(response.content)
    
    # Verify the file exists and is valid
    assert os.path.exists(output_path)
    assert os.path.getsize(output_path) > 0
    
    # Clean up
    if os.path.exists(output_path):
        os.remove(output_path)

def test_pdf_to_excel_error_handling():
    """Test error handling in the conversion process"""
    # Test with non-existent file
    files = {'file': ('nonexistent.pdf', b'', 'application/pdf')}
    response = client.post('/api/pdf/convert/to-excel', files=files)
    
    assert response.status_code == 400
    assert 'error' in response.json()

def test_pdf_to_excel_concurrent_requests(sample_pdf_path):
    """Test handling of concurrent conversion requests"""
    import threading
    
    def make_request():
        with open(sample_pdf_path, 'rb') as f:
            files = {'file': ('sample.pdf', f, 'application/pdf')}
            response = client.post('/api/pdf/convert/to-excel', files=files)
            assert response.status_code == 200
    
    # Create multiple threads to simulate concurrent requests
    threads = []
    for _ in range(5):
        thread = threading.Thread(target=make_request)
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join() 