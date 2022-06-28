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
let pool;
  
app.use(bodyParser.json());       // to support JSON-encoded bodies
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
  res.send('POST request to the homepage')
});


router.get('/r/:shortUrl', function(req, res) {

  //CONNECT AND CHECK
  connectDatabase.then(
    checkDatabase(req.params.shortUrl)
    .then( res => {
      console.log('checkdatdabase .then');
      res.redirect(res);
    })
    .catch(e => {
      console.error(e);
      console.log('checkdatdabase .catch');
      res.redirect(307, '/home');
    })

    )
  });

// apply the routes to our application
app.use('/', router);



// Database Functions
// ==============================================

var connectDatabase = new Promise(function(resolve, reject){
  try{
    pool = new Pool(connectionString);
    resolve(pool);
  }catch (e){
    reject(e);
  }
});

var checkDatabase = function(shortUrl) {
  
  return new Promise(function(resolve, reject){
    console.log('**ENTERING checkDatabase');
    let queryStringStandard = 'SELECT id, long_url, short_url, date_created FROM url_store WHERE short_url = ';
    let queryString = queryStringStandard + '\'' + shortUrl.replace(/[^A-Z0-9]/ig, "") + '\'';

    pool.query(queryString)
    .then(res => {
      resolve(res.rows[0].long_url);
    })
    .catch(e => {
      console.error(e);
      reject(Error('No record found')); 
    })


  });

};


// START THE SERVER
// ==============================================
app.listen(port);
pool.on('connect', () => console.log('connected to db'));



