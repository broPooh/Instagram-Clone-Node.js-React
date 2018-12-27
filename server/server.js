var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var logger = require('morgan');
const config = require('./modules/config');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var likesRouter = require('./routes/likes');
var commentsRouter = require('./routes/comments');
var commentLikesRouter = require('./routes/commentLikes');
var bookmarksRouter = require('./routes/bookmarks');
var relationshipsRouter = require('./routes/relationships');

var app = express();

// cors
app.use(cors());

// mongoose
mongoose.connect(process.env.MONGODB_URI || config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected');
});

// flash
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cookie-parser
app.use(cookieParser());

// validator
app.use(validator());

// session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
//  cookie: { secure: true }
}));

// passport
require('./modules/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/likes', likesRouter);
app.use('/comments', commentsRouter);
app.use('/commentLikes', commentLikesRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/relationships', relationshipsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

//module.exports = app;
var port = 5002;
app.listen(process.env.PORT || port, () => console.log('Example app listening on port '+port+'!'));
