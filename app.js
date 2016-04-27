const express = require('express');
const bodyParser = require('body-parser');
const cryptohat = require('cryptohat');

const app = express();

const port = 3000;
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static('bower_components'));
app.use(bodyParser.urlencoded({extended: true}));

const HASH_LENGTH = 5;
var maps = {};

app.get('/*', function(req, res, next) {
    if(req.url.substr(1) in maps) {
        res.redirect(maps[req.url.substr(1)]);
    } else {
        next();
    }
});

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.post('/add', function(req, res) {
    // TODO Add an expiry date to each URL
    // TODO Remove URLs when too many are stored
    // TODO Handle invalid/expired links
    // TODO Add a copy link button
    // TODO Spamming protection

    // Generate a new ID for the given URL
    do {
        var shrunk = cryptohat().substr(0, HASH_LENGTH);
    } while(shrunk in maps);

    // Filter the URL as required. Specifically, if the protocol isn't specified
    // as HTTP or HTTPS, then we add HTTP so that Node knows where to go
    var url = req.body.url;
    var protocol = 'http://';
    if (url.substr(0, protocol.length) !== protocol) {
        url = protocol + url;
    }
    maps[shrunk] = url;

    // Return the new URl
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end(req.get('host') + '/' + shrunk);
});

app.listen(port, function () {
    console.log('z-9 listening on port ' + port + '.');
});
