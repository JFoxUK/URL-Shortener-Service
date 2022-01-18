// BASE SETUP
// ==============================================
var express = require('express');
var app     = express();
var router  = express.Router();
var port    =   process.env.PORT || 8080;
var bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
const connectionString = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
};
  




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

  console.log('**ENTERING shortURL Route');
  console.log('**Calling CheckDatabase');
  checkDatabase(req.params.shortUrl)
  .then( res => {
    res.redirect(res);
  })
  .catch(e => {
    console.error(e);
    res.render("index.pug");
  })
});

// apply the routes to our application
app.use('/', router);



// Database Functions
// ==============================================
function checkDatabase(shortUrl) {
  console.log('**ENTERING checkDatabase');
  let queryStringStandard = 'SELECT id, long_url, short_url, date_created FROM url_store WHERE short_url = ';
  let queryString = queryStringStandard + '\'' + shortUrl.replace(/[^A-Z0-9]/ig, "") + '\'';

  console.log('**Querying DB with POOL');
  pool.query(queryString)
  .then(res => {
    console.log(res.rows[0].long_url);
    Promise.resolve(res.rows[0].long_url);
  })
  .catch(e => {
    console.error(e);
    Promise.reject('No record found');
  })

};


// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);

const pool = new Pool(connectionString);
pool.on('connect', () => console.log('connected to db'));

