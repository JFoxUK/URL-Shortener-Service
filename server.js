// BASE SETUP
// ==============================================
var express = require('express');
var app     = express();
var router  = express.Router();
var port    =   process.env.PORT || 8080;
var bodyParser = require('body-parser');
var NO_RECORD_FOUN_MESSAGE = 'No record found'
const { Pool, Client } = require('pg');
const connectionString = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
};
let pool;
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 
app.set('view engine', 'pug');
app.set('views','./views');
app.use(express.static(__dirname + '/views/includes/public'));


// ROUTES
// ==============================================
router.use(function(req, res, next) {
  next();
});

router.get('/', function(req, res) {
  res.render("index.pug");
});

router.get('/home', function(req, res) {
  res.render("index.pug");
});

router.post('/create', function(req, res) {
  //THESE TWO VARIABLES NEED CONVERTING TO STRING AND ESCAPING ' () {}
  let shortUrl = req.body.shortUrl;
  let longUrl = req.body.longUrl;

  connectDatabase.then(
    checkDatabase(shortUrl, true)
      .then( databaseCheckRes => {
        if(databaseCheckRes == NO_RECORD_FOUN_MESSAGE){
          connectDatabase.then(
            insertDatabase(shortUrl, longUrl)
              .then( () => {
                //SURFACE SUCCESS MESSAGE NEEDED HERE
                res.end();
                res.redirect("/home");
                res.locals.messageShow = true;
                res.locals.message = 'Short URL created - ' + req.get('host') + '/r/' + shortUrl;
                //NEEDS TO REDIRECT BACK TO HOME WITH SUCCESS MESSAGE
              })
              .catch(e => {
                //SURFACE ERROR MESSAGE NEEDED HERE
                res.end();
                res.redirect("/home");
                res.locals.messageShow = true;
                res.locals.message = e;
                //NEEDS TO REDIRECT BACK TO HOME WITH SUCCESS MESSAGE
              })
          )
        }else{
          //SURAFCE ERROR MESSAGE needed here as record exists
          //'*********** SURAFCE ERROR MESSAGE needed here \'Choose a different short URL\'
          res.end();
          res.redirect("/home");
          res.locals.messageShow = true;
          res.locals.message = 'Short URL already exists';
        }
      })
      //FATAL ERROR PAGE NEEDED OR SURFAE FATAL ERROR
      .catch(e => {
        console.error(e);
        res.end();
        res.redirect("/home");
        res.locals.messageShow = true;
        res.locals.message = e;
      })
  )

});


router.get('/r/:shortUrl', function(req, res) {
  connectDatabase.then(
    checkDatabase(req.params.shortUrl, false)
      .then( datdabaseRes => {
        res.redirect(datdabaseRes);
      })
      .catch(e => {
        //SURFACE ERROR MESSAGE NEEDED HERE
        res.end();
        res.redirect("/home");
        res.locals.messageShow = true;
        res.locals.message = e;
      })
  )
});

router.get('*', function(req, res){
  //404 PAGE NEEDED
  res.send('what???', 404);
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

var checkDatabase = function(shortUrl, isCreate) {

  if(!isCreate){
  
  return new Promise(function(resolve, reject){
    let queryStringStandard = 'SELECT id, long_url, short_url, date_created FROM url_store WHERE short_url = ';
    let queryString = queryStringStandard + '\'' + shortUrl.replace(/[^A-Z0-9]/ig, "") + '\'';

    pool.query(queryString)
    .then(res => {
      if(res.rows.length > 0){
        resolve(res.rows[0].long_url);
      }else{
        reject(NO_RECORD_FOUN_MESSAGE); 
      }
    })
    .catch(e => {
      console.error(e);
    })


  });
  }else if(isCreate){
    return new Promise(function(resolve, reject){
      let queryStringStandard = 'SELECT id, long_url, short_url, date_created FROM url_store WHERE short_url = ';
      let queryString = queryStringStandard + '\'' + shortUrl.replace(/[^A-Z0-9]/ig, "") + '\'';

      pool.query(queryString)
      .then(res => {
        if(res.rows.length > 0){
          reject(NO_RECORD_FOUN_MESSAGE);
          
        }else{
          resolve(NO_RECORD_FOUN_MESSAGE);
        }
      })
      .catch(e => {
        console.error(e);
      })


    });
  }

};

function insertDatabase(shortUrl, longUrl){
  let idForDB = getIdForDB();
  let dateFormatted = getFormatDate();
  return new Promise(function(resolve, reject){
    console.log(`${idForDB}, ${longUrl}, ${shortUrl}, ${dateFormatted}`);
    let queryString = `INSERT INTO url_store (id, long_url, short_url, date_created) VALUES (\'${idForDB}\', \'${longUrl}\', \'${shortUrl}\', \'${dateFormatted}\')`;

    pool.query(queryString)
    .then(res => {
      resolve(res);
    })
    .catch(e => {
      console.error(e);
      reject(Error(e));
    })


  });

};



function getFormatDate() {
    var d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2){ 
      month = '0' + month;
    }
    if (day.length < 2){ 
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }

function getIdForDB(){
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
  //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}



// START THE SERVER
// ==============================================
app.listen(port);
pool.on('connect', () => console.log('connected to db'));