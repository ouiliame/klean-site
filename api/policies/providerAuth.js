/**
 * providerAuth
 *
 * @module      :: Policy
 * @description :: Allow if user is a provider
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.session.user && req.session.user.accountType === 'provider') {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.redirect('/login');
};
