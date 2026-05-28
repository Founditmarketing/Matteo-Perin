const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'components');

const files = fs.readdirSync(dir);

files.forEach(file => {
    if (!file.endsWith('.tsx')) return;
    
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let original = content;

    // 1. Remove blur classes
    content = content.replace(/\bbackdrop-blur-[a-z0-9]+\b/g, '');
    content = content.replace(/\bblur-[a-z0-9]+\b/g, '');

    // 2. Remove Verona context
    content = content.replace(/Verona, Italy\./g, 'Italy.');
    content = content.replace(/Verona,<br \/>Italy\./g, 'Italy.<br />');
    content = content.replace(/Verona atelier/g, 'Italian atelier');
    content = content.replace(/in Verona/g, 'in Italy');
    content = content.replace(/Verona • New York/g, 'Milan • New York');
    content = content.replace(/Piazza Bra, Verona/g, 'Milan, Italy');
    content = content.replace(/Handmade in Verona/g, 'Handmade in Italy');
    content = content.replace(/Raised in Verona/g, 'Raised in Italy');
    content = content.replace(/\bVerona\b/g, 'Italy');
    
    // clean up any "Italy, Italy"
    content = content.replace(/Italy, Italy/g, 'Italy');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
