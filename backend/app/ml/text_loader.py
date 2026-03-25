import os
import nltk
from pathlib import Path
from docx import Document
import PyPDF2

# Download NLTK data
from nltk.tokenize import sent_tokenize
import ssl

def ensure_nltk_resources():
    """Ensure required NLTK resources are downloaded once."""
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context

    resources = ['tokenizers/punkt', 'tokenizers/punkt_tab']
    for resource in resources:
        try:
            nltk.data.find(resource)
        except (LookupError, OSError):
            res_name = resource.split('/')[-1]
            print(f"Downloading NLTK {res_name} tokenizer...")
            nltk.download(res_name, quiet=True)

# =========================
# 1. TEXT EXTRACTION
# =========================

def load_txt(path):
    """Load text from a .txt file."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        # Try with different encoding if UTF-8 fails
        with open(path, "r", encoding="latin-1") as f:
            return f.read()

def load_docx(path):
    """Load text from a .docx file."""
    try:
        doc = Document(path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
        return "\n".join(full_text)
    except Exception as e:
        raise ValueError(f"Error reading DOCX file: {e}")

def load_pdf(path):
    """Load text from a .pdf file."""
    try:
        text = ""
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            if len(reader.pages) == 0:
                raise ValueError("PDF file has no pages")
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Error reading PDF file: {e}")

def load_input(input_data):
    """Load text from file or raw string input.
    
    Args:
        input_data (str): File path or raw text
        
    Returns:
        str: Loaded text content
        
    Raises:
        FileNotFoundError: If file path is provided but file doesn't exist
        ValueError: If file format is unsupported or reading fails
    """
    if os.path.isfile(input_data):
        file_path = Path(input_data)
        
        if file_path.suffix.lower() == ".txt":
            return load_txt(input_data)
        elif file_path.suffix.lower() == ".docx":
            return load_docx(input_data)
        elif file_path.suffix.lower() == ".pdf":
            return load_pdf(input_data)
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}. Supported formats: .txt, .docx, .pdf")
    else:
        # Assume raw string input
        return input_data

# =========================
# 2. SENTENCE SPLITTING
# =========================

def split_into_sentences(text):
    """Split text into sentences using NLTK tokenizer.
    
    Args:
        text (str): Input text to split
        
    Returns:
        list: List of sentences, empty strings filtered out
    """
    if not text or not text.strip():
        return []
    
    try:
        sentences = sent_tokenize(text)
        # Filter out empty sentences
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences
    except Exception as e:
        print(f"Error splitting sentences: {e}")
        return []
