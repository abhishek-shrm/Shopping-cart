var express=require('express');
var path=require('path');
var mongoose=require('mongoose');
var config=require('./config/database');
var pages=require('./routes/pages');
var adminPages=require('./routes/adminPages');
var bodyParser=require('body-parser');  
var session=require('express-session');
var expressValidator=require('express-validator');
var app=express();

mongoose.connect(config.database,{useNewUrlParser:true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public'))); 

//set global error variable
app.locals.errors=null;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));



app.use('/',pages);
app.use('/admin/pages',adminPages);

var port=3000;
app.listen(port,function(){
  console.log("Server is running...");
});