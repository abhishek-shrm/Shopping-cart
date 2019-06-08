exports.isUser=function(req,res,next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    req.flash('danger','Please log In');
    res.redirect('/users/login');
  }
}

exports.isAdmin=function(req,res,next){
  if(req.isAuthenticated()&&res.locals.user.admin==1){
    next();
  }
  else{
    req.flash('danger','Please log In as Admin');
    res.redirect('/users/login');
  }
}