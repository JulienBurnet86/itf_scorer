var express = require('express');
var path = require('path');

var app = express();

var staticPath = path.join(__dirname, '/static');
app.use(express.static(staticPath));
app.use("/modules", express.static(path.join(__dirname, "node_modules")));

// Allows you to set port in the project properties.
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('listening');
});
