var fs = require('fs'),
    extract = require('pdf-text-extract'),
    PouchDB = require('pouchdb'),
    glob = require('glob'),
    path = require('path'),
    hasha = require('hasha');

var argv = require('yargs').argv;

PouchDB.plugin(require('pouchdb-quick-search'));

var db = new PouchDB('db');

function md5sum(filepath) {
    return hasha.fromFileSync(filepath, {algorithm: 'md5'});
}

filepaths = glob.sync(path.join(argv.dir, '*/**/*.pdf'));

console.log('Indexing ' + filepaths.length + ' pdf files from ' + argv.dir);

while(filepaths.length > 0) {
    // slice off chunks of 10 files to avoid problems with spawning pdftotext process
    filepaths.splice(0,10).forEach((filepath) => {
        var filehash = md5sum(filepath);
        extract(filepath, (err, pages) => {
            if (err) {
                console.log(err)
                return
            }
            pages.forEach(function (element, index) {
                entry = {
                    _id : hasha(element),
                    filename: path.basename(filepath),
                    localpath : filepath, 
                    pageindex: index,
                    fulltext: element
                }
                db.put(entry,  (err, result) => {
                        if(!err) {
                            console.log(entry['filename'] + ' ' + entry['pageindex'] + ' ' + entry['_id']);
                        }
                });
            });
        });
    });
}

db.search({
    fields : ['fulltext'],
    build : true
}).then(function (info) {
  console.log(info);
}).catch(function (err) {
  console.log(err);
});
