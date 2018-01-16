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

passport.use(new Strategy({
  consumerKey: 'wfVxmvSCWBv4l5p01ln1zWW3T',
  //process.env.CONSUMER_KEY,
  consumerSecret: 'OFGbfZepZmvevXYK8qVurpIl1OAH9OnSFPmQKVIgYR5Bm1PJAW',
  //process.env.CONSUMER_SECRET,
  callbackURL: 'https://tranquil-castle-96224.herokuapp.com:3001/login/twitter/return'
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

/* GET home page. */
app.get('/api/:term', function(req, res, next) {
  var term = req.params.term;
  tempQuery = term;
  client.search({
    term:'bar',
    location: term
  }).then(response => {
    //save businesses return in object
    var businesses = response.jsonBody.businesses;  
    var loopLength = businesses.length >= 10 ? 10 : businesses.length;
    var responseObject = []; 
      for (var i = 0; i < loopLength; i++) {
        //save this long object string to a var for code clarity
        var marker = response.jsonBody.businesses[i];
        responseObject.push({
          name: marker.name,
          image: marker.image_url,
          category: marker.categories[0].title,
          rating: marker.rating,
          price: marker.price,
          yelpUrl: marker.url,
          votes: 0
        });
      }
      mongo.connect(url, function(err,db) {
        var collection= db.collection('test');
        var fuck = collection.find({}, {name: 1, votes: 1}).toArray(function(err,data) {
          for (var i = 0; i < responseObject.length; i++) {
            for (var j = 0; j < data.length; j++) {
              if (data[j].name === responseObject[i].yelpUrl) {
               responseObject[i].votes = data[j].votes; 
              }
            }
          }
          res.send(responseObject);
        });

             
      });
      
  }).catch(e => {
      console.log(e);
  });
});

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/login/twitter/return', 
  passport.authenticate('twitter', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('https://tranquil-castle-96224.herokuapp.com/');
  });

app.get('/verify', function(req,res) {
  if (redirect) {
    redirect = false;
    res.send([user, tempQuery]);
  }

  else {
    res.send(user);
  }
});

app.get('/logout', function(req,res) {
  user = {};
  req.session.destroy()
  req.logout()
  res.redirect('https://tranquil-castle-96224.herokuapp.com/');
});

app.get('/attendingBar/:bar', function(req,res) {
  if (user.status) {
    mongo.connect(url, function(err,db) {
      if (err) {
        console.log(err);
      }

      else {
        var collection = db.collection('test');
        collection.find({name: req.params.bar}).toArray(function(err,data) {
          if (err) {
            console.log(err);
          }

          else {
            //found bar
            if (data.length != 0) {
              //update the entry w bar and vote count bc it already exists
              //there is only one vote for the bar, and that vote came from current user, so when click again they are un-registering
              if (data[0].user.length == 1 && data[0].user[0] == user.handle) {
                collection.remove({name: req.params.bar});
              }
              //add additional else if statement that covers cases where there is already more than one vote for the bar, but one may or may not have come from current user 
              else if (data[0].user.indexOf(user.handle) !== -1) {
                //remove instnace of the users handle so that they can vote again for this bar if they wish
                var index = data[0].user.indexOf(user.handle);
                data[0].user.splice(index, 1);

                collection.update({name: req.params.bar},
                  {
                    $inc: {votes: -1},
                    $set: {createdAt: new Date(), user: data[0].user}
                  });
              }
              

              //more than one vote for the bar already
              else {
                //also need to add the users handle to the voted array
                data[0].user.push(user.handle);
                collection.update({name: req.params.bar},
                {
                  $inc: {votes: 1},
                  $set: {createdAt: new Date(), user: data[0].user}
                });
              }
            }
            //create new entry
            else {
              collection.createIndex({"createdAt": 1}, {expireAfterSeconds: 86400});
              collection.insert({
                name: req.params.bar,
                votes: 1,
                user: [user.handle],
                createdAt: new Date()
              }, function(err, data) {
                console.log(data);
              });
            }
          }
        });

        
      }
    });
    res.redirect('https://tranquil-castle-96224.herokuapp.com/');
  }
  //user needs to login before they can go to a bar
  else {
    redirect = true;
    res.redirect('https://tranquil-castle-96224.herokuapp.com:3001/login/twitter');
  }
  
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
