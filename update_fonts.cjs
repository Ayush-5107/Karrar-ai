const fs = require('fs');

const filePaths = [
    'src/pages/Dashboard.jsx',
    'src/pages/Landing.jsx',
    'src/pages/Login.jsx',
    'src/index.css'
];

filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Font family replacements
        content = content.replace(/"Playfair Display,serif"/g, '"Outfit, sans-serif"');
        content = content.replace(/"Playfair Display",serif/g, '"Outfit", sans-serif');
        content = content.replace(/'Playfair Display',serif/g, "'Outfit', sans-serif");
        
        content = content.replace(/"DM Sans, sans-serif"/g, '"Inter, sans-serif"');
        content = content.replace(/"DM Sans", sans-serif/g, '"Inter", sans-serif');
        
        content = content.replace(/"IBM Plex Mono,monospace"/g, '"JetBrains Mono, monospace"');
        content = content.replace(/"IBM Plex Mono",monospace/g, '"JetBrains Mono", monospace');

        content = content.replace(/fontFamily:\s*"system-ui"/g, 'fontFamily: "Inter, sans-serif"');
        
        // Also add body font in index.css just in case
        if (filePath === 'src/index.css' && !content.includes('font-family')) {
            content = content.replace('body {', 'body { font-family: "Inter", sans-serif; -webkit-font-smoothing: antialiased;');
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated fonts in ${filePath}`);
    }
});
