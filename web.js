console.log("Running".green);
var gzippo = require('gzippo');
var express = require('express');
var morgan = require('morgan');
var app = express();

app.use(morgan('dev'));
app.use(gzippo.staticGzip("" + __dirname + "/www"));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.all('/*', function(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

app.listen(process.env.PORT || 5000);
