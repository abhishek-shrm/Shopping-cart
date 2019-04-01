var express=require('express');
var path=require('path');
var mongoose=require('mongoose');
var config=require('./config/database');
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

app.get('/',(req,res)=>{
  res.render('index.ejs',{
    title:'Home'
  });
});

var port=3000;
app.listen(port,function(){
  console.log("Server is running...");
});