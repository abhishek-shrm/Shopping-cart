var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var Product = require('../models/product');
var Category = require('../models/category');
var auth=require('../config/auth');
var isAdmin=auth.isAdmin;

module.exports = router;

//GET products index
router.get('/',isAdmin, (req, res) => {
  Product.find((err, products) => {
    res.render('admin/products', {
      products: products,
    });
  });
});

//GET add products
router.get('/add-product',isAdmin, (req, res) => {
  var title = "";
  var desc = "";
  var price = "";

  Category.find((err, categories) => {
    res.render('admin/add_product', {
      title: title,
      desc: desc,
      categories: categories,
      price: price
    });
  });
});

//POST add products

router.post('/add-product', (req, res) => {

  var imageFile;

  if (req.files != null) {
    imageFile = req.files.image.name;
  } else if (req.files == null) {
    imageFile = "";
  }


  req.checkBody('title', 'Title must not be empty').notEmpty();
  req.checkBody('desc', 'Descrition must not be empty').notEmpty();
  req.checkBody('price', 'Price must not be empty').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var category = req.body.category;
  var price = req.body.price;

  var errors = req.validationErrors();

  if (errors) {
    Category.find((err, categories) => {
      res.render('admin/add_product', {
        errors: errors,
        title: title,
        desc: desc,
        categories: categories,
        price: price
      });
    });
  } else {
    Product.findOne({
      slug: slug
    }, (err, product) => {
      if (product) {
        req.flash('danger', 'Product title exists, please chose another');
        Category.find((err, categories) => {
          res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
          });
        });
      } else {

        var price2 = parseFloat(price).toFixed(2);

        var product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          image: imageFile,
          price: price2,
          category: category
        });
        product.save(err => {
          if (err) {
            console.log(err);
          } else {

            mkdirp('public/product_images/' + product._id, err => {
              if (err) {
                return console.log(err);
              }
            });
            mkdirp('public/product_images/' + product._id + '/gallery', err => {
              if (err) {
                return console.log(err);
              }
            });
            mkdirp('public/product_images/' + product._id + '/gallery/thumbs', err => {
              if (err) {
                return console.log(err);
              }
            });

            if (imageFile != "") {
              var productImage = req.files.image;
              var path = 'public/product_images/' + product._id + '/' + imageFile;
              productImage.mv(path, err => {
                if (err) {
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


//GET edit product
router.get('/edit-product/:id',isAdmin, (req, res) => {

  var errors;
  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category.find((err, categories) => {
    Product.findById(req.params.id, (err, p) => {
      if (err) {
        console.log(err);
        res.redirect('/admin/products');
      } else {
        var galleryDir = 'public/product_images/' + p._id + '/gallery';
        var galleryImages = null;

        fs.readdir(galleryDir, (err, files) => {
          if (err) {
            console.log(err);
          } else {
            galleryImages = files;
            res.render('admin/edit_product', {
              title: p.title,
              errors: errors,
              desc: p.desc,
              categories: categories,
              category: p.category.replace(/\s+/g, '-').toLowerCase(),
              price: parseFloat(p.price).toFixed(2),
              image: p.image,
              galleryImages: galleryImages,
              id: p._id
            });
          }
        });
      }
    });
  });
});

//POST edit product
router.post('/edit-product/:id', (req, res) => {
  var imageFile;

  if (req.files != null) {
    imageFile = req.files.image.name;
  } else if (req.files == null) {
    imageFile = "";
  }

  req.checkBody('title', 'Title must not be empty').notEmpty();
  req.checkBody('desc', 'Descrition must not be empty').notEmpty();
  req.checkBody('price', 'Price must not be empty').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var category = req.body.category;
  var price = req.body.price;
  var pimage=req.body.pimage;
  var id=req.params.id;

  var errors = req.validationErrors();

  if(errors){
    req.session.errors=errors;
    res.redirect('/admin/products/edit-product/'+id);
  }
  else{
    Product.findOne({slug:slug,_id:{'$ne':id}},(err,p)=>{
      if(err){
        console.log(err);
      }
      if(p){
        req.flash('danger','Product already exists choose another');
        res.redirect('/admin/products/edit-product/'+id);
      }
      else{
        Product.findById(id,(err,p)=>{
          if(err){
            console.log(err);
          }
          p.title=title;
          p.slug=slug;
          p.desc=desc;
          p.price=parseFloat(price).toFixed(2);
          p.category=category;
          if(imageFile!=''){
            p.image=imageFile;
          }

          p.save(err=>{
            if(err){
              console.log(err);
            }
            else{
              if(imageFile!=''){
                if(pimage!=''){
                  fs.remove('public/product_images/'+id+'/'+pimage,err=>{
                    if(err){
                      console.log(err);
                    }
                  });
                  var productImage = req.files.image;
                  var path = 'public/product_images/' + id + '/' + imageFile;
                  productImage.mv(path, err => {
                  if (err) {
                   return console.log(err);
                  }
                  });
                }
              }
              req.flash('success', 'Product edited successfully');
              res.redirect('/admin/products/edit-product/'+id);
            }
          });
        });
      }
    });
  }req.flash('success', 'Product edited successfully');
  res.redirect('/admin/products/edit-product/'+id);

});

//POST product gallery

router.post('/product-gallery/:id', (req, res) => {
  var productImage=req.files.file;
  var id=req.params.id;
  var path='public/product_images/'+id+'/gallery/'+req.files.file.name;
  var thumbsPath='public/product_images/'+id+'/gallery/thumbs/'+req.files.file.name;

  productImage.mv(path,(err)=>{
    if(err){
      console.log(err);
    }
    else{
      resizeImg(fs.readFileSync(path),{width:100,height:100}).then(buf=>{
        fs.writeFile(thumbsPath,buf);
      });
    }
  });
  res.sendStatus(200);
});

//GET delete image

router.get('/delete-image/:image',isAdmin, (req, res) => {
  var originalImage='public/product_images/'+req.query.id+'/gallery/'+req.params.image;
  var thumbImage='public/product_images/'+req.query.id+'/gallery/thumbs/'+req.params.image;

  fs.remove(originalImage,(err)=>{
    if(err){
      console.log(err);
    }
    else{
      fs.remove(thumbImage,(err)=>{
        if(err){
          console.log(err);
        }
        else{
          req.flash('success', 'Image deleted successfully');
          res.redirect('/admin/products/edit-product/'+req.query.id);
        }
      });
    }
  });
});

//GET delete product

router.get('/delete-product/:id',isAdmin, (req, res) => {
  var id=req.params.id;
  var path='public/product_images/'+id;
  fs.remove(path,(err)=>{
    if(err){
      console.log(err);
    }
    else{
      Product.findByIdAndRemove(id,(err)=>{
        if(err){
          console.log(err);
        }
      });
      req.flash('success', 'Product deleted successfully');
      res.redirect('/admin/products');
    }
  });
});