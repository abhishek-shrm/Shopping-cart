var express=require('express');
var path=require('path');
var mongoose=require('mongoose');
var config=require('./config/database');
var pages=require('./routes/pages');
var adminPages=require('./routes/adminPages');
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

app.use('/',pages);
app.use('/admin/pages',adminPages);

var port=3000;
app.listen(port,function(){
  console.log("Server is running...");
});