const express = require('express');
const cryptohat = require('cryptohat');
const app = express();

const port = 3000;
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static('bower_components'));

const HASH_LENGTH = 5;
var maps = {};

app.get('/*', function(req, res, next) {
    console.log(maps);
    if(req.url.substr(1) in maps) {
        res.redirect(maps[req.url.substr(1)]);
    } else {
        next();
    }
});

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.get('/add/:url', function(req, res) {
    // TODO Make sure that the generated string doesn't conflict
    // TODO Add an expiry date to each URL
    // TODO Allow for custom URL names
    // TODO Check for valid URL
    // TODO Remove URLs when too many are stored
    // TODO Handle invalid/expired links
    // TODO Handle empty request bodies
    var url = req.body.url;
    var shrunk = cryptohat().substr(0, HASH_LENGTH);
    maps[shrunk] = url;
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end(shrunk);
});

app.listen(port, function () {
    console.log('z-9 listening on port ' + port + '.');
});
