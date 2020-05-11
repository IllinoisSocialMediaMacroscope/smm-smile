function isLoggedIn(req, res, next){
    if(req.isAuthenticated() || req.user != null){
        return next();
    }
    res.redirect("/account");
}

function isLoggedInPassing(req, res, next){
    return next();
}

module.exports = { isLoggedIn, isLoggedInPassing };
