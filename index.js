const heapdump = require('heapdump');
const archiver = require('archiver');
const fs = require('fs');
const http = require('http');

function writeHeapSnapshot() {
    const snapshotName = Date.now() + '.heapsnapshot';
    heapdump.writeSnapshot(snapshotName, function(err, snapshotFile) {
        const output = fs.createWriteStream(snapshotName + '.zip');
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.pipe(output);
        archive.append(fs.createReadStream(snapshotFile), { name: snapshotFile });
        archive.finalize();

        output.on('close', function() {
            fs.unlinkSync(snapshotFile);
            console.log(`Heap snapshot archive has been written to ${fs.realpathSync(snapshotFile + '.zip')} (${archive.pointer()} total bytes)`);
        });
    });
}

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    writeHeapSnapshot();
    res.end('Hello');
}).listen(process.env.PORT || 3000);
