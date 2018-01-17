const express = require('express');
const path = require('path');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
const yelp = require('yelp-fusion');
const apiKey = process.env.API_KEY;
const client = yelp.client(apiKey);
var mongo = require('mongodb').MongoClient;
var url = process.env.MONGO_URL;
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

//create user object
var user = {};

var tempQuery = '';
var redirect = false;

const app = express();
const PORT = process.env.PORT || 5000;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

//initialize passport for twitter logins
passport.use(new Strategy({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callbackURL: 'https://limitless-falls-29953.herokuapp.com/login/twitter/return'
},
function(token, tokenSecret, profile, cb) {

  //build the user object after login. data is used to communicate with frontend for user data rendering
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

app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

//log user in via twitter
app.get('/login/twitter',
  passport.authenticate('twitter'));

//redirect from twitter  
app.get('/login/twitter/return', 
  passport.authenticate('twitter', { failureRedirect: '/failedLogin' }),
  function(req, res) {
    res.redirect('/');
  });

//log user out
app.get('/logout', function(req,res) {
  user = {};
  req.session.destroy()
  req.logout()
  res.redirect('/');
});  

//componentDidMount calls to server to check if user is logged in
app.get('/verify', function(req,res) {
  if (redirect) {
    redirect = false;
    res.send([user, tempQuery]);
  }

  else {
    res.send(user);
  }
});  

/* query yelp with term sent from front end, then send response back*/
app.get('/api/:term', function(req, res, next) {
  var term = req.params.term;
  tempQuery = term;
  client.search({
    term:'bar',
    location: term
  }).then(response => {
    //save businesses returned in object
    var businesses = response.jsonBody.businesses; 
    
    //save max 10 bars/restaurants to be displayed. if less than 10 in search results, only render that amount
    var loopLength = businesses.length >= 10 ? 10 : businesses.length;
    var responseObject = []; 
      for (var i = 0; i < loopLength; i++) {
        //save this long object string to a var for code clarity
        var marker = response.jsonBody.businesses[i];
        //only save relevant info about the bar to be sent to front end
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
        if (err) {
          console.log(err);
          return res.redirect('/mongoCrash');
        }
        var collection= db.collection('bars');
        //check to see if bar is currently in database and get amount of people attending
        var search = collection.find({}, {name: 1, votes: 1}).toArray(function(err,data) {
          if (err) {
            console.log(err);
            res.redirect('/collectionError')
          }
          //copmaring search results against database
          for (var i = 0; i < responseObject.length; i++) {
            for (var j = 0; j < data.length; j++) {
              if (data[j].name === responseObject[i].yelpUrl) {
                //if bar is found, add the current attendees to bar info being sent to front end
                responseObject[i].votes = data[j].votes; 
              }
            }
          }
          res.send(responseObject);
        });       
      });   
  }).catch(e => {
      console.log(e);
      return res.redirect('/yelpFailed');
  });
});

//add user to bar attendees list
app.get('/attendingBar/:bar', function(req,res) {
  if (user.status) {
    mongo.connect(url, function(err,db) {
      if (err) {
        console.log(err);
        return res.redirect('/mongoFailed1');
      }

      else {
        var collection = db.collection('bars');
        collection.find({name: req.params.bar}).toArray(function(err,data) {
          if (err) {
            console.log(err);
            return res.redirect('/mongoFailed2');
          }

          else {
            //found bar
            if (data.length != 0) {
              //update the entry w bar and vote count bc it already exists
              //there is only one vote for the bar, and that vote came from current user, they are un-registering
              if (data[0].user.length == 1 && data[0].user[0] == user.handle) {
                collection.remove({name: req.params.bar});
              }
              //there is more than one attendee for current bar and one of them is from current user. user is un-registering
              else if (data[0].user.indexOf(user.handle) !== -1) {
                //remove instance of the users handle so that they can vote again for this bar if they wish
                var index = data[0].user.indexOf(user.handle);
                data[0].user.splice(index, 1);

                collection.update({name: req.params.bar},
                  {
                    $inc: {votes: -1},
                    $set: {createdAt: new Date(), user: data[0].user}
                  });
              }
              
              //more than one vote for the bar already but none from current user
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
            //create new bar entry
            else {
              collection.createIndex({"createdAt": 1}, {expireAfterSeconds: 86400});
              collection.insert({
                name: req.params.bar,
                votes: 1,
                user: [user.handle],
                createdAt: new Date()
              }, function(err, data) {
                    if (err) {
                      console.log(err);
                      return res.redirect('/insertFailed')
                    }                
              });
            }
          }
        });
      }
    });
    res.redirect('/');
  }
  //user needs to login before they can go to a bar
  else {
    redirect = true;
    res.redirect('/login/twitter');
  }
  
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});