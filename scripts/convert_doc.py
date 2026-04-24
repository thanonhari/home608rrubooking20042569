from markitdown import MarkItDown
import sys

md = MarkItDown()
try:
    result = md.convert("person.docx")
    # Force UTF-8 encoding for output
    sys.stdout.reconfigure(encoding='utf-8')
    print(result.text_content)
except Exception as e:
    print(f"Error: {e}")
