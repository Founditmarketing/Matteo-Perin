const fs = require('fs');
const cp = require('child_process');
const ffmpeg = require('ffmpeg-static');
const file = 'public/assets/house-hero-new.mp4';
const tmp = file + '.tmp.mp4';
cp.execSync(`"${ffmpeg}" -y -i "${file}" -c copy -movflags +faststart "${tmp}"`);
fs.renameSync(tmp, file);
console.log('Done');
