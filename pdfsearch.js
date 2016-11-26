var fs = require('fs'),
    PouchDB = require('pouchdb');

PouchDB.plugin(require('pouchdb-quick-search'));

var db = new PouchDB('db');

db.search({
    query : process.argv[2],
    fields : ['fulltext'],
    highlighting : true
}).then(function (res) {
    console.log('Found!');
    res.rows.forEach(function(e) {
        console.log(e.highlighting);
    });
}).catch(function (err) {
    console.log('Not found :(');
});