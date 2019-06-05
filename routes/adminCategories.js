var express = require('express');
var router = express.Router();
var Category = require('../models/category');

module.exports = router;

//GET page index
router.get('/', (req, res) => {
  Category.find((err,categories)=>{
    if(err){
      return console.log(err);
    }
    else{
      res.render('admin/categories',{
        categories:categories
      });
    }
  });
});

//GET add category
router.get('/add-category', (req, res) => {
  var title = "";

  res.render('admin/add_category', {
    title: title
  });
});

//POST add category

router.post('/add-category', (req, res) => {
  req.checkBody('title', 'Title must not be empty').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add_category', {
      errors: errors,
      title: title
    });
  } else {
    Category.findOne({
      slug: slug
    }, (err, category) => {
      if (category) {
        req.flash('danger', 'Category title exists, please chose another');
        res.render('admin/add_category', {
          title: title,
        });
      } else {
        var category = new Category({
          title: title,
          slug: slug,
        });
        category.save(err => {
          if (err) {
            console.log(err);
          } else {
            Category.find((err, categories) => {
              if(err){
                console.log(err);
              }
              else{
                req.app.locals.categories=categories;
              }
            });
            req.flash('success', 'Category added');
            res.redirect('/admin/categories');
          }
        });
      }
    });
  }

});

//GET edit category
router.get('/edit-category/:id', (req, res) => {
  Category.findById(req.params.id, (err, category) => {
    if (err) {
      console.log(err);
    }else{
    res.render('admin/edit_category', {
      title: category.title,
      id: category._id
    });}
  });
});

//POST edit category
router.post('/edit-category/:id',(req,res)=>{
  req.checkBody('title','Title must not be empty').notEmpty();

  var title=req.body.title;
  var slug=title.replace(/\s+/g,'-').toLowerCase();
  var id=req.params.id;

  var errors=req.validationErrors();

  if(errors){
    res.render('admin/edit_category',{
      errors:errors,
      title:title,
      id:id
    });
  }else{
    Category.findOne({slug:slug,
    _id:{'$ne':id}},(err,category)=>{
      if(category){
        req.flash('danger','Category title exists, please chose another');
        res.render('admin/edit_category',{
          title:title,
          id:id
        });
      }
      else{
        Category.findById(id,(err,category)=>{
          if(err){
            console.log(err);
          }
          else{
            category.title=title;
            category.slug=slug;
            
            category.save((err)=>{
              if(err){
                console.log(err);
              }
              else{
                Category.find((err, categories) => {
                  if(err){
                    console.log(err);
                  }
                  else{
                    req.app.locals.categories=categories;
                  }
                });
                req.flash('success','Category edited successfully');
                res.redirect('/admin/categories/edit-category/'+category.id);
              }
            });
          }
        });
      }
    });
  }
});

//GET delete category

router.get('/delete-category/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id,(err)=>{
    if(err){
      return console.log(err);
    }
    else{
      Category.find((err, categories) => {
        if(err){
          console.log(err);
        }
        else{
          req.app.locals.categories=categories;
        }
      });
      req.flash('success','Category deleted successfully');
      res.redirect('/admin/categories/');
    }
  });
});
