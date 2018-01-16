const express = require('express');
const path = require('path');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
const yelp = require('yelp-fusion');
const apiKey = '4OXAW5GC7aWnQiy_pm6K_AwGNP2dTis_CDk48CiKd60uQAp3oiNOU_J_rKWCevn3RGeDS9fsbhX0UHeCpoJbtSc9v9LytN9EuZBejaG0plho5CYExoW-HjgD_dAyWnYx';
const client = yelp.client(apiKey);
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://glandon22:taylord22@ds163796.mlab.com:63796/nightlife'
var user = {};
var tempQuery = '';
var redirect = false;

const app = express();
const PORT = process.env.PORT || 5000;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));
/*
passport.use(new Strategy({
  consumerKey: 'wfVxmvSCWBv4l5p01ln1zWW3T',
  //process.env.CONSUMER_KEY,
  consumerSecret: 'OFGbfZepZmvevXYK8qVurpIl1OAH9OnSFPmQKVIgYR5Bm1PJAW',
  //process.env.CONSUMER_SECRET,
  callbackURL: 'http://localhost:3001/login/twitter/return'
},
function(token, tokenSecret, profile, cb) {
  // In this example, the user's Twitter profile is supplied as the user
  // record.  In a production-quality application, the Twitter profile should
  // be associated with a user record in the application's database, which
  // allows for account linking and authentication with other identity
  // providers.
  user.status = true;
  user.image = profile.photos[0].value;
  user.name = profile.displayName;
  user.handle = profile.username;
  return cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());
*/

// Answer API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});