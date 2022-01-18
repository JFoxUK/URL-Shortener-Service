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
  let responseFromDatabase = checkDatabase(req.params.shortUrl);

  console.log('responseFromDatabase object == ??  ' + responseFromDatabase);

  if(responseFromDatabase.valid){
    console.log('**ENTERING If');
    console.log('VALID - TRUE AND URL IS  == ??  ' + responseFromDatabase.longUrl);
    res.redirect(responseFromDatabase.longUrl);
  }else{
    console.log('**ENTERING Else');
    console.log('URL NOT FOUND REDIRECTING TO INDEX.PUG');
  }
  //res.redirect(redirectUrl);
  //if logic for error
});

// apply the routes to our application
app.use('/', router);



// Database Functions
// ==============================================
function connectToDB(){
  console.log('**ENTERING connectToDB');
  const pool = new Pool(connectionString);
  pool.on('connect', () => console.log('connected to db'));
  return pool;
}

function checkDatabase(shortUrl) {
  console.log('**ENTERING checkDatabase');
  let pool = connectToDB();
  let queryStringStandard = 'SELECT id, long_url, short_url, date_created FROM url_store WHERE short_url = ';
  let queryString = queryStringStandard + '\'' + shortUrl.replace(/[^A-Z0-9]/ig, "") + '\'';
  let responseToReturn = {
    valid: false,
    longUrl: null
  };

  console.log('**Querying DB with POOL');
  pool.query(queryString)
  .then(res => {
    responseToReturn.valid = true;
    responseToReturn.longUrl = res.rows[0].long_url;
  })
  .catch(e => {
    responseToReturn.valid = false;
  })

  console.log(responseToReturn);
  return responseToReturn;
};


// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);

