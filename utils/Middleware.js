// === [3] Middleware Auth: utils/authMiddleware.js ===
function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.admin) {
    return next(); // ⬅️ PENTING: pakai `return` agar tidak lanjut ke bawah
  }

  // Jika permintaan dari API (bukan browser)
  if (req.originalUrl.startsWith('/api')) {
    return res.status(401).json({ error: 'Access denied. Please login.' });
  }

  // Jika permintaan ke halaman biasa
  return res.redirect('/login');
}


module.exports = ensureLoggedIn;