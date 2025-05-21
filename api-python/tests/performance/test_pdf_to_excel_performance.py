import os
import time
import pytest
import statistics
import concurrent.futures
from locust import HttpUser, task, between
from src.pdf.convert.to_excel import PDFToExcelConverter

class PDFToExcelUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        self.sample_pdf_path = os.path.join(os.path.dirname(__file__), '../test_files/sample.pdf')
    
    @task
    def convert_pdf_to_excel(self):
        with open(self.sample_pdf_path, 'rb') as f:
            files = {'file': ('sample.pdf', f, 'application/pdf')}
            self.client.post('/api/pdf/convert/to-excel', files=files)

def test_conversion_performance():
    """Test performance of PDF to Excel conversion"""
    converter = PDFToExcelConverter()
    sample_pdf_path = os.path.join(os.path.dirname(__file__), '../test_files/sample.pdf')
    output_path = os.path.join(os.path.dirname(__file__), '../test_files/output.xlsx')
    
    # Run multiple conversions and measure time
    times = []
    for _ in range(10):
        start_time = time.time()
        result = converter.convert(sample_pdf_path, output_path)
        end_time = time.time()
        
        assert result is True
        times.append(end_time - start_time)
        
        # Clean up
        if os.path.exists(output_path):
            os.remove(output_path)
    
    # Calculate statistics
    avg_time = statistics.mean(times)
    median_time = statistics.median(times)
    std_dev = statistics.stdev(times)
    
    # Assert performance requirements
    assert avg_time < 5.0  # Average conversion time should be less than 5 seconds
    assert median_time < 5.0  # Median conversion time should be less than 5 seconds
    assert std_dev < 2.0  # Standard deviation should be less than 2 seconds

def test_memory_usage():
    """Test memory usage during conversion"""
    import psutil
    import os
    
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss / 1024 / 1024  # MB
    
    converter = PDFToExcelConverter()
    sample_pdf_path = os.path.join(os.path.dirname(__file__), '../test_files/sample.pdf')
    output_path = os.path.join(os.path.dirname(__file__), '../test_files/output.xlsx')
    
    # Run conversion
    result = converter.convert(sample_pdf_path, output_path)
    assert result is True
    
    # Measure memory after conversion
    final_memory = process.memory_info().rss / 1024 / 1024  # MB
    memory_increase = final_memory - initial_memory
    
    # Assert memory requirements
    assert memory_increase < 500  # Memory increase should be less than 500MB
    
    # Clean up
    if os.path.exists(output_path):
        os.remove(output_path)

def test_concurrent_conversions():
    """Test performance with concurrent conversions"""
    converter = PDFToExcelConverter()
    sample_pdf_path = os.path.join(os.path.dirname(__file__), '../test_files/sample.pdf')
    output_paths = [
        os.path.join(os.path.dirname(__file__), f'../test_files/output_{i}.xlsx')
        for i in range(5)
    ]
    
    start_time = time.time()
    
    # Run concurrent conversions
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(converter.convert, sample_pdf_path, output_path)
            for output_path in output_paths
        ]
        results = [future.result() for future in futures]
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Assert all conversions were successful
    assert all(results)
    
    # Assert performance requirements
    assert total_time < 15.0  # Total time for 5 concurrent conversions should be less than 15 seconds
    
    # Clean up
    for output_path in output_paths:
        if os.path.exists(output_path):
            os.remove(output_path)

def test_large_file_performance():
    """Test performance with large PDF files"""
    converter = PDFToExcelConverter()
    sample_pdf_path = os.path.join(os.path.dirname(__file__), '../test_files/sample.pdf')
    output_path = os.path.join(os.path.dirname(__file__), '../test_files/output.xlsx')
    
    # Create a large file by duplicating content
    with open(sample_pdf_path, 'rb') as f:
        content = f.read()
    
    large_content = content * 100  # Make file larger
    large_file = os.path.join(os.path.dirname(__file__), '../test_files/large.pdf')
    
    try:
        with open(large_file, 'wb') as f:
            f.write(large_content)
        
        # Measure conversion time
        start_time = time.time()
        result = converter.convert(large_file, output_path)
        end_time = time.time()
        
        assert result is True
        conversion_time = end_time - start_time
        
        # Assert performance requirements
        assert conversion_time < 30.0  # Large file conversion should take less than 30 seconds
        
    finally:
        # Clean up
        if os.path.exists(large_file):
            os.remove(large_file)
        if os.path.exists(output_path):
            os.remove(output_path)

def test_error_recovery_performance():
    """Test performance of error recovery"""
    converter = PDFToExcelConverter()
    invalid_path = 'invalid.pdf'
    output_path = os.path.join(os.path.dirname(__file__), '../test_files/output.xlsx')
    
    # Measure error handling time
    start_time = time.time()
    result = converter.convert(invalid_path, output_path)
    end_time = time.time()
    
    assert result is False
    error_handling_time = end_time - start_time
    
    # Assert performance requirements
    assert error_handling_time < 1.0  # Error handling should take less than 1 second 