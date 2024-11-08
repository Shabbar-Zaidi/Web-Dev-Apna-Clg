module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.path,"++++++", req.originalUrl);
  if (!req.isAuthenticated()) {
    // Redirect URL
    req.session.redirectUrl= req.originalUrl
    req.flash("error", "You must be signed in to create a new listing!");
    return res.redirect("/login");
  }
  next();
}; // This middleware is used to check whether user is logged in or not. If user is not logged in then it will show error message and redirect to login page

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    // console.log("Redirect URL", res.locals.redirectUrl);
    // console.log("req.session.redirectUrl", req.session.redirectUrl);
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
} // This middleware is used to save redirect URL in locals so that it can be used in other routes because req.session.redirectUrl is not available in other routes due to passport session(remove it), so we are saving it in locals