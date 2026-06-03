const fs = require('fs');
const path = require('path');

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (let file of list) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.mp4') || file.endsWith('.mov') || file.endsWith('.webm')) {
            results.push({file, time: stat.mtime});
        }
    }
    return results;
}

const vids = getFiles('public').sort((a,b)=>b.time-a.time);
fs.writeFileSync('vid_list.txt', JSON.stringify(vids, null, 2), 'utf8');
