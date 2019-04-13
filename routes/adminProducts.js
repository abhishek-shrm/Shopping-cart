var express = require('express');
var router = express.Router();
var mkdirp=require('mkdirp');
var fs=require('fs-extra');
var resizeImg=require('resize-img');
var Product = require('../models/product');
var Category=require('../models/category');

module.exports = router;

//GET products index
router.get('/', (req, res) => {
  Product.find((err,products)=>{
    res.render('admin/products',{
      products:products,
      });
  });
});

//GET add products
router.get('/add-product', (req, res) => {
  var title = "";
  var desc = "";
  var price = "";
  
  Category.find((err,categories)=>{
    res.render('admin/add_product',{
      title:title,
      desc:desc,
      categories:categories,
      price:price
    });
  });
});

//POST add products

router.post('/add-product', (req, res) => {
  
  var imageFile;

  if(req.files!=null){
    imageFile=req.files.image.name;
  }
  else if(req.files==null){
    imageFile="";
  }


  req.checkBody('title', 'Title must not be empty').notEmpty();
  req.checkBody('desc', 'Descrition must not be empty').notEmpty();
  req.checkBody('price', 'Price must not be empty').isDecimal();
  req.checkBody('image','You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var category = req.body.category;
  var price = req.body.price;

  var errors = req.validationErrors();

  if (errors) {
    Category.find((err,categories)=>{
      res.render('admin/add_product',{
        errors:errors,
        title:title,
        desc:desc,
        categories:categories,
        price:price
      });
    });
  } else {
    Product.findOne({
      slug: slug
    }, (err, product) => {
      if (product) {
        req.flash('danger', 'Product title exists, please chose another');
        Category.find((err,categories)=>{
          res.render('admin/add_product',{
            title:title,
            desc:desc,
            categories:categories,
            price:price
          });
        });
      } else {

        var price2=parseFloat(price).toFixed(2);

        var product = new Product({
          title: title,
          slug: slug,
          desc:desc,
          image:imageFile,
          price:price2,
          category:category
        });
        product.save(err => {
          if (err) {
            console.log(err);
          } else {

            mkdirp('public/product_images/'+product._id,err=>{
              if(err){
              return console.log(err);
              }
            });
            mkdirp('public/product_images/'+product._id+'/gallery',err=>{
              if(err){
                return console.log(err);
              }
            });
            mkdirp('public/product_images/'+product._id+'/gallery/thumbs',err=>{
              if(err){
                return console.log(err);
              }
            });

            if(imageFile != ""){
              var productImage=req.files.image;
              var path='public/product_images/'+product._id+'/'+imageFile;
              productImage.mv(path,err=>{
                if(err){
                  return console.log(err);
                }
              });
            }

            req.flash('success', 'Product added');
            res.redirect('/admin/products');
          }
        });
      }
    });
  }

});


//GET edit page
router.get('/edit-page/:id', (req, res) => {
  Page.findById(req.params.id, (err, page) => {
    if (err) {
      console.log(err);
    }else{
    res.render('admin/edit_page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });}
  });
});

//POST edit page
router.post('/edit-page/:id',(req,res)=>{
  req.checkBody('title','Title must not be empty').notEmpty();
  req.checkBody('content','Content must not be empty').notEmpty();
  
  var title=req.body.title;
  var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();
  if(slug=="")
    slug=req.body.title.replace(/\s+/g,'-').toLowerCase();
  var content=req.body.content;
  var id=req.params.id;

  var errors=req.validationErrors();

  if(errors){
    res.render('admin/edit_page',{
      errors:errors,
      title:title,
      slug:slug,
      content:content,
      id:id
    });
  }else{
    Page.findOne({slug:slug,
    _id:{'$ne':id}},(err,page)=>{
      if(page){
        req.flash('danger','Page slug exists, please chose another');
        res.render('admin/edit_page',{
          title:title,
          slug:slug,
          content:content,
          id:id
        });
      }
      else{
        Page.findById(id,(err,page)=>{
          if(err){
            console.log(err);
          }
          else{
            page.title=title;
            page.content=content;
            page.slug=slug;
            
            page.save((err)=>{
              if(err){
                console.log(err);
              }
              else{
                req.flash('success','Page edited successfully');
                res.redirect('/admin/pages/edit-page/'+page.id);
              }
            });
          }
        });
      }
    });
  }
});

//GET delete page

router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndRemove(req.params.id,(err)=>{
    if(err){
      return console.log(err);
    }
    else{
      req.flash('success','Page deleted successfully');
      res.redirect('/admin/pages/');
    }
  });
});
