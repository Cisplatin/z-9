const express = require('express');
const bodyParser = require('body-parser');
const cryptohat = require('cryptohat');
const cron = require('cron');
const Ddos = require('ddos')

const app = express();

const port = 3000;
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static('bower_components'));
app.use(bodyParser.urlencoded({extended: true}));

const ddos = new Ddos({'silentStart' : true});
app.use(ddos.express);

const HASH_LENGTH = 5;
const CLEANSE_FREQ = '0 0 4 * * *';
const EXPIRY_TIME = 48;
var maps = {};

var cleanse = new cron.CronJob(CLEANSE_FREQ, function() {
    var current_date = new Date();
    for(var key in maps) {
        if(maps[key]['expiry'] < current_date) {
            delete maps[key];
        }
    }
});

app.get('/*', function(req, res, next) {
    if(req.url.substr(1) in maps) {
        res.redirect(maps[req.url.substr(1)]['url']);
    } else {
        next();
    }
});

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.post('/add', function(req, res) {
    // TODO Handle invalid/expired links
    // TODO Add a copy link button
    // TODO Work on design
    // TODO Return same link for already generated sites
    // TODO Make the pressed link work properly

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
    expiry = new Date();
    expiry.setHours(expiry.getHours() + EXPIRY_TIME);
    maps[shrunk] = {
        'url' : url,
        'expiry' : expiry,
    };

    // Return the new URL
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end(req.get('host') + '/' + shrunk);
});

app.listen(port, function () {
    console.log('z-9 listening on port ' + port + '.');
});
