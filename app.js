const express = require('express');
const app = express();

const port = 3000;
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static('bower_components')); 

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.listen(port, function () {
    console.log('z-9 listening on port ' + port + '.');
});
