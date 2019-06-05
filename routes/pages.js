var express=require('express');
var router=express.Router();
var Page = require('../models/pages');

module.exports=router;

//GET

router.get('/',(req,res)=>{
  Page.findOne({slug:'home'},(err,page)=>{
    if(err){
      console.log(err);
    }
    else{
        res.render('index',{
          title:page.title,
          content:page.content
        });
      }
  });
});

//GET a page
router.get('/:slug',(req,res)=>{
  var slug=req.params.slug;
  Page.findOne({slug:slug},(err,page)=>{
    if(err){
      console.log(err);
    }
    else{
      if(!page){
        res.redirect('/');
      }
      else{
        res.render('index',{
          title:page.title,
          content:page.content
        });
      }
    }
  });
});