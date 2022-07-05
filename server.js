/*
GLOBAL TODO LIST:

- Add validation to Long URL to include http(s)://www.
- Escape quotes etc on inputs from malicious code
- Break server.js up into seperate files
- Add 404
- Make Long URL required but if short URL is missing, generate random 6 char string
- Animate full box to flip on click of login or INFO



- Look to change promise.then into async await simialr to:

router.post('/create', async function(req, res) {
  const { shortUrl, longUrl } = req.body
  try {
    await connectDatabase
    const databaseCheckRes = await checkDatabase(shortUrl, true)
    if(databaseCheckRes !== NO_RECORD_FOUND_MESSAGE) throw new Error('Short URL already exists')
    await insertDatabase(shortUrl, longUrl)
    res.locals.message = 'MY MESSAGE HERE'   
  } catch (error) {
    res.locals.message = error
  }

  res.locals.messageShow = true
  res.render(whatever )
});



*/



// BASE SETUP
// ==============================================
const dotenv = require('dotenv');
var express = require('express');
dotenv.load();
var app     = express();
var router  = express.Router();
const session = require('express-session');
var bodyParser = require('body-parser');
const http = require('http');
const logger = require('morgan');
const { auth } = require('express-openid-connect');
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views/includes/public'));
app.set('view engine', 'pug');
app.set('views','./views');
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: 'https://jfoxuk-urlshortener.herokuapp.com/'
};

var NO_RECORD_FOUND_MESSAGE = 'No record found'
const { Pool, Client } = require('pg');
const connectionString = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
};
let pool;

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}

var globalUser;
var urls;

// ROUTES
// ==============================================
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  globalUser = res.locals.user;
  if(globalUser){
    urls = getURLData();
    console.log('URLS >>>' + JSON.stringify(urls));
  }
  next();
});

router.get('/', function(req, res) {
  res.render("index.pug");
});

const { requiresAuth } = require('express-openid-connect');

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
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
        if(databaseCheckRes == NO_RECORD_FOUND_MESSAGE){
          connectDatabase.then(
            insertDatabase(shortUrl, longUrl)
              .then( () => {
                //SURFACE SUCCESS MESSAGE NEEDED HERE
                res.locals.messageShow = true;
                res.locals.message = 'Short URL created - ' + req.get('host') + '/r/' + shortUrl;
                res.render("index.pug");
                //NEEDS TO REDIRECT BACK TO HOME WITH SUCCESS MESSAGE
              })
              .catch(e => {
                //SURFACE ERROR MESSAGE NEEDED HERE
                res.locals.messageShow = true;
                res.locals.message = e;
                res.render("index.pug");
                //NEEDS TO REDIRECT BACK TO HOME WITH SUCCESS MESSAGE
              })
          )
        }else{
          //SURAFCE ERROR MESSAGE needed here as record exists
          //'*********** SURAFCE ERROR MESSAGE needed here \'Choose a different short URL\'
          res.locals.messageShow = true;
          res.locals.message = 'Short URL already exists';
          res.render("index.pug");
        }
      })
      //FATAL ERROR PAGE NEEDED OR SURFAE FATAL ERROR
      .catch(e => {
        console.error(e);
        res.locals.messageShow = true;
        res.locals.message = e;
        res.render("index.pug");
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
        res.locals.messageShow = true;
        res.locals.message = e;
        res.render("index.pug");
      })
  )
});

router.get('*', function(req, res){
  //404 PAGE NEEDED
  res.send('404 - NOT FOUND');
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
        reject(NO_RECORD_FOUND_MESSAGE); 
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
          reject('SHORT URL HAS ALREADY BEEN USED - PLEASE CHOOSE A DIFFERENT SHORT URL');
          
        }else{
          resolve(NO_RECORD_FOUND_MESSAGE);
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
    let usernameEmail;
    if(globalUser != null){
      usernameEmail = globalUser.email;
    }else{
      usernameEmail = '000000';
    }
    let queryString = `INSERT INTO url_store (id, long_url, short_url, date_created, username) VALUES (\'${idForDB}\', \'${longUrl}\', \'${shortUrl}\', \'${dateFormatted}\', \'${usernameEmail}\')`;

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

function getURLData(){
  return new Promise(function(resolve, reject){
    connectDatabase.then()
    .then(() => {
      let queryString = `SELECT id, long_url, short_url, date_created, username FROM url_store WHERE username =  '\${globalUser.email}\'`;
      console.log('queryString >>> " '+ queryString);
      return pool.query(queryString)
    })
    .then(databaseQuery => {
      console.log('DB QUERY >> ' + JSON.stringify(databaseQuery));
      resolve(databaseQuery);
    })
    .catch(e => {
      console.error(e);
      reject(Error(e));
    })
  })
}



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
app.listen(port, () => console.log('listening on ' + port));
pool.on('connect', () => console.log('connected to db'));