from markitdown import MarkItDown
import sys

md = MarkItDown()
try:
    result = md.convert("person.docx")
    with open("person.md", "w", encoding="utf-8-sig") as f:
        f.write(result.text_content)
    print("Successfully converted person.docx to person.md")
except Exception as e:
    print(f"Error: {e}")
