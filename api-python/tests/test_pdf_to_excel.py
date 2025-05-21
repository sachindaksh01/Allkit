import os
import pytest
from src.pdf.convert.to_excel import PDFToExcelConverter, convert_pdf_to_excel

@pytest.fixture
def sample_pdf_path():
    # Path to a sample PDF file for testing
    return os.path.join(os.path.dirname(__file__), 'test_files', 'sample.pdf')

@pytest.fixture
def output_path():
    # Path for the output Excel file
    return os.path.join(os.path.dirname(__file__), 'test_files', 'output.xlsx')

def test_pdf_to_excel_converter_initialization():
    converter = PDFToExcelConverter()
    assert converter is not None
    assert hasattr(converter, 'temp_dir')
    assert os.path.exists(converter.temp_dir)

def test_convert_with_tables(sample_pdf_path, output_path):
    converter = PDFToExcelConverter()
    result = converter.convert(sample_pdf_path, output_path)
    assert result is True
    assert os.path.exists(output_path)
    # Clean up
    if os.path.exists(output_path):
        os.remove(output_path)

def test_convert_with_ocr(sample_pdf_path, output_path):
    converter = PDFToExcelConverter()
    # Force OCR by removing tables
    result = converter._convert_with_ocr(sample_pdf_path, output_path)
    assert result is True
    assert os.path.exists(output_path)
    # Clean up
    if os.path.exists(output_path):
        os.remove(output_path)

def test_convert_with_invalid_input():
    converter = PDFToExcelConverter()
    result = converter.convert('invalid.pdf', 'output.xlsx')
    assert result is False

def test_cleanup():
    converter = PDFToExcelConverter()
    temp_dir = converter.temp_dir
    converter._cleanup()
    assert not os.path.exists(temp_dir)

def test_convert_pdf_to_excel_function(sample_pdf_path, output_path):
    result = convert_pdf_to_excel(sample_pdf_path, output_path)
    assert result is True
    assert os.path.exists(output_path)
    # Clean up
    if os.path.exists(output_path):
        os.remove(output_path)

def test_convert_pdf_to_excel_with_invalid_input():
    result = convert_pdf_to_excel('invalid.pdf', 'output.xlsx')
    assert result is False 