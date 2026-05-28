const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'components');
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (!file.endsWith('.tsx')) return;
    
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix Italy.<br /> resulting from previous script
    content = content.replace(/Italy\.<br \/>/g, 'Italy');
    
    // Remove periods inside heading tags at the end of the text
    // E.g. <h2>Curate Your Life.</h2> -> <h2>Curate Your Life</h2>
    // And also strings that are just right before the closing tag, maybe with space
    content = content.replace(/\.\s*<\/h([1-6])>/gi, '</h$1>');
    
    // Some headers might have periods inside like <h2>Matteo<br />Perin.</h2> -> <h2>Matteo<br />Perin</h2>
    // We already handled \.</h*> but what if it's "Perin." and the next is </h1>
    // What if it is `Matteo<br />Perin.` on a separate line?
    content = content.replace(/Perin\.\s*<\/h/g, 'Perin</h');
    content = content.replace(/Inquiry Received\.\s*<\/h/g, 'Inquiry Received</h');
    content = content.replace(/The Private Dossier\.\s*<\/h/g, 'The Private Dossier</h');
    content = content.replace(/Life\.\s*<\/h/g, 'Life</h');
    content = content.replace(/Received\.\s*<\/h/g, 'Received</h');
    content = content.replace(/Code\.\s*<\/h/g, 'Code</h'); // The Design Code.
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated headings in ${file}`);
    }
});
