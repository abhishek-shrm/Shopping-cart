var express=require('express');
var router=express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var fs=require('fs-extra');
var auth=require('../config/auth');
var isUser=auth.isUser;

module.exports=router;

//GET all products

router.get('/',(req,res)=>{
  // router.get('/',isUser,(req,res)=>{
  Product.find((err,products)=>{
    if(err){
      console.log(err);
    }
    else{
        res.render('all_products',{
          title:'All Products',
          products:products
        });
      }
  });
});

//GET products by category

router.get('/:category',(req,res)=>{

  var categorySlug=req.params.category;
  
  Category.findOne({slug:categorySlug},(err,c)=>{
    Product.find({category:categorySlug},(err,products)=>{
      if(err){
        console.log(err);
      }
      else{
          res.render('cat_products',{
            title:c.title,
            products:products
          });
        }
    });
  });

});

//GET products details

router.get('/:category/:product',(req,res)=>{
  var galleryImages=null;
  var loggedIn=(req.isAuthenticated())?true:false;

  Product.findOne({slug:req.params.product},(err,product)=>{
    if(err){
      console.log(err);
    }
    else{
      var galleryDir='public/product_images/'+product._id+'/gallery';
      fs.readdir(galleryDir,(err,files)=>{
        if(err){
          console.log(err);
        }
        else{
          galleryImages=files;
          res.render('product',{
            title:product.title,
            p:product,
            galleryImages:galleryImages,
            loggedIn:loggedIn
          });
        }
      });
    }
  });
});