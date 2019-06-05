var express=require('express');
var path=require('path');
var mongoose=require('mongoose');
var config=require('./config/database');
var pages=require('./routes/pages');
var products=require('./routes/products.js');
var adminPages=require('./routes/adminPages');
var adminCategories=require('./routes/adminCategories');
var adminProducts=require('./routes/adminProducts');
var bodyParser=require('body-parser');  
var session=require('express-session');
var expressValidator=require('express-validator');
var fileUpload=require('express-fileupload');
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
app.use(fileUpload());

//set global error variable
app.locals.errors=null;

//Get page model
var Page=require('./models/pages');

//Get all pages to pass to header.ejs
Page.find({}).sort({
  sorting: 1
}).exec((err, pages) => {
  if(err){
    console.log(err);
  }
  else{
    app.locals.pages=pages;
  }
});

//Get category model
var Category=require('./models/category');

//Get all categories to pass to header.ejs
Category.find((err, categories) => {
  if(err){
    console.log(err);
  }
  else{
    app.locals.categories=categories;
  }
});

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
  },
  customValidators:{
    isImage:function(value,filename){
      var extension=(path.extname(filename)).toLowerCase();
      switch(extension){
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default:
          return false;
      }
    }
  }
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}));


app.use('/products',products);
app.use('/',pages);
app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);


var port=3000;
app.listen(port,function(){
  console.log("Server is running...");
});