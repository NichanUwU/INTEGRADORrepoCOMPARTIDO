import zipfile
import xml.etree.ElementTree as ET
import sys
import io

def extract_text(docx_filename):
    with zipfile.ZipFile(docx_filename) as zf:
        xml_content = zf.read('word/document.xml')
        tree = ET.parse(io.BytesIO(xml_content))
        root = tree.getroot()
        
        # XML namespace for WordprocessingML
        w_ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
        
        paragraphs = []
        for p in root.iter(f'{w_ns}p'):
            texts = [node.text for node in p.iter(f'{w_ns}t') if node.text]
            if texts:
                paragraphs.append(''.join(texts))
                
        return '\n'.join(paragraphs)

try:
    text = extract_text('plantilla contrato/MACHOTE DE CONTRATOS DE LOTES FINANCIADOS SIN ENGANCHE.docx')
    with open('plantilla_extract.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Extracted successfully!")
except Exception as e:
    print(f"Error: {e}")
