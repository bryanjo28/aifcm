// === [3] Middleware Auth: utils/authMiddleware.js ===
function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.admin) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = ensureLoggedIn;