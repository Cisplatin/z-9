const express = require('express');
const bodyParser = require('body-parser');
const cryptohat = require('cryptohat');
const cron = require('cron');
const Ddos = require('ddos');
var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");

const app = express();

const port = 80;
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static('bower_components'));
app.use(bodyParser.urlencoded({extended: true}));

const ddos = new Ddos({'silentStart' : true});
app.use(ddos.express);

const HASH_LENGTH = 5;
const CLEANSE_FREQ = '0 0 4 * * *';
const EXPIRY_TIME = 48;
var maps = {};
var file = "url.db";
var exists = fs.existsSync(file);
var db = new sqlite3.Database(file);

var cleanse = new cron.CronJob(CLEANSE_FREQ, function() {
    var current_date = new Date();
    db.serialize(function() {
        db.each("SELECT rowid AS id, expiry FROM user_info", function(err, row) {
           if (new Date(row.expiry) < current_date) {
                db.run("DELETE FROM user_info WHERE rowid=(?)", row.id, function(error) {
                if(error){
                    console.log(error);
                } else {
                    console.log("Deletion Successful");
                }
            });
           }
        });
    });
});


app.get('/*', function(req, res, next) {
    db.serialize(function() {
        db.each("SELECT url FROM user_info WHERE shrunk = '" + req.url.substr(1) + "'", function(err, row) {
           if(err) {
                console.log(err);
           } else {
                res.redirect(row.url);
           }
        }, function(error, rows) { // oncomplete functions
            if(error) {
                console.log(error);
            } else {
                if( rows === 0) { // the case where the url doesn't exist in db
                    next();
                }
            }
        });
    });
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
    // TODO Handle https websites

    // Generate a new ID for the given URL
    do {
        var shrunk = cryptohat().substr(0, HASH_LENGTH);
    } while(shrunk in maps);

    // Filter the URL as required. Specifically, if the protocol isn't specified
    // as HTTP or HTTPS, then we add HTTP so that Node knows where to go
    var url = req.body.url.trim();
    var protocol = 'http://';
    if (url.substr(0, protocol.length) !== protocol) {
        url = protocol + url;
    }
    expiry = new Date();
    expiry.setHours(expiry.getHours() + EXPIRY_TIME);
    addUrlToDb(shrunk, (url.trim()).toString(), expiry.toString());
    // Return the new URL
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end('/' + shrunk);
});

app.listen(port, function () {
    console.log('z-9 listening on port ' + port + '.');
});

//initalizes the database i.e creates the db.url file if it doens't already exist
function initDb() {
    if (!exists) {
        console.log("Creating DB file.");
        fs.openSync(file, "w");
        db.serialize(function() {
            db.run("CREATE TABLE if not exists user_info (shrunk TEXT UNIQUE, url TEXT, expiry TEXT)");
        });
    }
}

//adds new urls to the database
function addUrlToDb(shrunk, url, expiry) {
    db.serialize(function() {
        var stmt = db.prepare("INSERT INTO user_info VALUES (?,?,?)");
        stmt.run(shrunk, url, expiry);
        stmt.finalize();
        db.each("SELECT rowid AS id, shrunk, url, expiry FROM user_info", function(err, row) {
           console.log(row.id + ": " + row.shrunk + "    " +  row.url + "    "  + row.expiry);
        });
    });
}

initDb();
cleanse.start();
