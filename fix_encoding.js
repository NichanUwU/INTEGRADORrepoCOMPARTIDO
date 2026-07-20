const fs = require('fs');
const path = require('path');

const map = {
  'Ã¡': 'á', 'Ã©': 'é', 'Ã³': 'ó', 'Ãº': 'ú', 'Ã±': 'ñ', 'Ã‘': 'Ñ', 'Ã‚Â·': '·',
  'Ã“': 'Ó', 'Ã‰': 'É', 'Ã\xad': 'í', 'Ã\x8d': 'Í', 'Ã¼': 'ü', 'âš™ï¸': '⚙️',
  'ðŸ“ ': '📌', 'ðŸ—‘ï¸': '🗑️', 'âœ ï¸': '✏️', 'â€¢': '•', 'Ã': 'í', 'Â¿': '¿'
};

const dir = 'C:/Users/Salazar/Music/INTEGRADORrepoCOMPARTIDO/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [bad, good] of Object.entries(map)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }
  
  // also fix double Ã
  content = content.replace(/í³/g, 'ó').replace(/í¡/g, 'á').replace(/í©/g, 'é').replace(/í±/g, 'ñ');
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', f);
  }
});
