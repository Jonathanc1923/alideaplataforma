const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/UserWorkspace.jsx', 'utf8');
const lines = content.split('\n');
const results = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Match standalone $ followed by number or curly brace or text like $0.00, ${amount}, etc.
  if (line.match(/\$\s*[{0-9]/) || line.includes('>$<') || line.includes('"$') || line.includes("'$")) {
    results.push(`${i + 1}: ${line.trim()}`);
  }
}

console.log(`Found ${results.length} lines with $ currency symbol:`);
results.forEach(r => console.log(r));
