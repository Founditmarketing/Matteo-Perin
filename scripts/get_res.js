const fs = require('fs');

function getDimensions(filePath) {
    const buffer = Buffer.alloc(100000); // Read first 100kb
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 100000, 0);
    fs.closeSync(fd);

    let offset = 0;
    while (offset < buffer.length - 8) {
        const size = buffer.readUInt32BE(offset);
        const type = buffer.toString('ascii', offset + 4, offset + 8);

        if (type === 'trak') {
            let tkhdOffset = offset + 8;
            while (tkhdOffset < offset + size) {
                const innerSize = buffer.readUInt32BE(tkhdOffset);
                const innerType = buffer.toString('ascii', tkhdOffset + 4, tkhdOffset + 8);
                
                if (innerType === 'tkhd') {
                    const version = buffer.readUInt8(tkhdOffset + 8);
                    
                    // Width and height are normally at the end of tkhd. 
                    // Size is usually 84 or 96 (for version 0 or 1).
                    // In version 0, width is at offset 76 from tkhd start.
                    // In version 1, width is at offset 88.
                    let start = tkhdOffset + 8; // skip size and type
                    start += (version === 1) ? 32 + 32 : 20 + 16;
                    // skip matrix
                    start += 36;
                    
                    const width = buffer.readUInt16BE(start);
                    const height = buffer.readUInt16BE(start + 4);
                    
                    // Return if valid resolution
                    if (width > 0 && height > 0) {
                        return { width, height };
                    }
                }
                tkhdOffset += innerSize;
            }
        }
        
        if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(type) || size === 1) {
            offset += 8; // Just dive in or skip? MP4 is a tree
            // We just do a flat scan for tkhd.
        } else {
            // Flat scan for 'tkhd'
            // offset += size;
            offset += 1;
        }
    }
    return null;
}

const vids = [
    'public/assets/Generated Video April 11, 2026 - 8_37PM.mp4',
    'public/assets/Generated Video April 11, 2026 - 8_38PM.mp4'
];

vids.forEach(v => {
    try {
        const d = getDimensions(v);
        console.log(v, d);
    } catch (e) {
        // Find tkhd by pure string search "tkhd"
        const buffer = fs.readFileSync(v);
        const idx = buffer.indexOf('tkhd');
        if (idx !== -1) {
            const version = buffer.readUInt8(idx + 4);
            let wIdx = idx + 4 + (version===1 ? 88 : 76);
            console.log(v, 'fallback', buffer.readUInt16BE(wIdx), buffer.readUInt16BE(wIdx+4));
        }
    }
});
