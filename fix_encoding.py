import os
import glob

replacements = {
    "Ã¡": "á", "Ã©": "é", "Ã³": "ó", "Ãº": "ú", "Ã±": "ñ", "Ã‘": "Ñ", "Ã‚Â·": "·",
    "Ã“": "Ó", "Ã‰": "É", "Ã\xad": "í", "Ã\x8d": "Í", "Ã¼": "ü", "âš™ï¸": "⚙️",
    "ðŸ“ ": "📌", "ðŸ—‘ï¸": "🗑️", "âœ ï¸": "✏️", "â€¢": "•", "Ã ": "í", "Â¿": "¿",
    "Ã": "í"
}

files = glob.glob('C:/Users/Salazar/Music/INTEGRADORrepoCOMPARTIDO/pages/*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    for bad, good in replacements.items():
        if bad in content:
            content = content.replace(bad, good)
            changed = True
            
    content = content.replace("í³", "ó").replace("í¡", "á").replace("í©", "é").replace("í±", "ñ")
            
    if changed:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file}")
