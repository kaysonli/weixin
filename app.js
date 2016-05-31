var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serveIndex = require('serve-index');
var request = require('request-json');
var cors = require('cors');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var config = require('./config.js');

var serverUrl = config.serverUrl;
var appId = config.appId;
var appSecret = config.appSecret;

function getUser(username, callback) {
  var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryUser",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            name: 'name',
            value: username
        }, {
            name: 'page',
            value: 0
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            if(error) {
                callback(null);
            } else {
              callback(body.entrySet ? body.entrySet[0] : null);
            }
        }
    );
}


function verifyUserLogin(username, password, callback) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryUser",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            name: 'name',
            value: username
        }, {
            name: 'page',
            value: 0
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            if(error) {
                callback(false);
            } else {
              var isValid = body.entrySet && body.entrySet[0].pwd === password;
              callback({
                user: isValid ? body.entrySet[0] : null,
                message: isValid ? '' : '用户名或密码错误'
              });
            }
        }
    );
}

passport.use(new LocalStrategy({
        passReqToCallback: true
    },
    function(req, username, password, done) {
      verifyUserLogin(username, password, function(result) {
        if(!result.user) {
          return done(null, false, {
            message: result.message
          });
        }
        return done(null, result.user);
      });
        // User.findOne({ username: username }, function(err, user) {
        //     if (err) {
        //         return done(err); }
        //     if (!user) {
        //         return done(null, false, { message: 'Incorrect username.' });
        //     }
        //     if (!user.validPassword(password)) {
        //         return done(null, false, { message: 'Incorrect password.' });
        //     }
        //     return done(null, user);
        // });
        // req.login();
        // return done(null, { username: username});
    }
));
passport.serializeUser(function(user, done) {
    done(null, user.name);
});

passport.deserializeUser(function(name, done) {
    getUser(name, function(user) {
      done(null, user);
    });
});

var routes = require('./routes/index');
var users = require('./routes/users');
var weixin = require('./routes/weixin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../')));

// Serve URLs like /ftp/thing as public/ftp/thing
app.use('/michong', serveIndex(path.join(__dirname, '../michong'), {'icons': true}));

app.use(cors({
    origin: '*'
}));
var expressSession = require('express-session');
app.use(expressSession({ secret: 'petmeet' }));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', routes);
app.use('/users', users);
app.use('/weixin', weixin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
