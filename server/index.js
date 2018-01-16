const express = require('express');
const path = require('path');
const yelp = require('yelp-fusion');
const apiKey = '4OXAW5GC7aWnQiy_pm6K_AwGNP2dTis_CDk48CiKd60uQAp3oiNOU_J_rKWCevn3RGeDS9fsbhX0UHeCpoJbtSc9v9LytN9EuZBejaG0plho5CYExoW-HjgD_dAyWnYx';
const client = yelp.client(apiKey);
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://glandon22:taylord22@ds163796.mlab.com:63796/nightlife'
var user = {};
var tempQuery = '';
var redirect = false;
const app = express();
const PORT = process.env.PORT || 5000;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

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