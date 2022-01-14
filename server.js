// BASE SETUP
// ==============================================

var express = require('express');
var app     = express();
var router  = express.Router();
var port    =   process.env.PORT || 8080;
var bodyParser = require('body-parser')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.set('view engine', 'pug');
app.set('views','./views');
app.use(express.static(__dirname + '/views/includes/public'));


// ROUTES
// ==============================================

router.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});

router.get('/', function(req, res) {
  console.log('I am the home page with empty URL');
  res.render("index.pug");
});

router.get('/home', function(req, res) {
  console.log('I am the home page');
  res.render("index.pug");
});

router.post('/create', function(req, res) {
  console.log('Call me to create');
  var longUrl = req.body.longUrl;
  console.log(longUrl);
});


router.get('/r/:shortUrl', function(req, res) {
  console.log('I need to redirect to the real URL');
  console.log('THE SHORT URL HERE IS >> ' + req.params.shortUrl);
  //Query database
  //IF EXISTS > REDIRECT
  //IF NOT, THORW ERROR MESSAGE
});

// apply the routes to our application
app.use('/', router);



// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);