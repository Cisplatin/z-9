const express = require('express');
const cryptohat = require('cryptohat');
const app = express();

const port = 3000;
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static('bower_components'));

const HASH_LENGTH = 5;
var maps = {};

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.get('/add/:url', function(req, res) {
    // TODO Make sure that the generated string doesn't conflict
    // TODO Add an expiry date to each URL
    // TODO Allow for custom URL names
    if(!(req.params.url in maps)) {
        maps[req.params.url] = cryptohat().substring(0, HASH_LENGTH);
    }
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(maps[req.params.url]);
});

app.listen(port, function () {
    console.log('z-9 listening on port ' + port + '.');
});
