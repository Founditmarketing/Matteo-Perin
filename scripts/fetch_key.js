fetch('https://matteo-perin.vercel.app/')
    .then(r => r.text())
    .then(html => {
        const match = html.match(/src="(\/assets\/index-.*?\.js)"/);
        if (!match) return console.log('No js file found');
        return fetch('https://matteo-perin.vercel.app' + match[1]);
    })
    .then(r => r.text())
    .then(js => {
        const urlIndex = js.indexOf('uwwc');
        const keyIndex = js.indexOf('eyJpc');
        
        console.log('--- URL INJECTION ---');
        console.log(js.substring(urlIndex - 40, urlIndex + 80));
        
        console.log('\\n--- KEY INJECTION ---');
        console.log(js.substring(keyIndex - 50, keyIndex + 100));
    })
    .catch(console.error);
