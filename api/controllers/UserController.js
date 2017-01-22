/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {



  /**
   * `UserController.login()`
   */
  login: function (req, res) {
		User.tryLogin(req.param('email'), req.param('password'), function(err, user) {
			if (err) return res.negotiate(err);
			if (!user) {
				return res.redirect('/login');
			}
			req.session.user = user;
			return res.redirect('/app');
		});
  },


  /**
   * `UserController.logout()`
   */
  logout: function (req, res) {
		req.session.user = null;
		return res.redirect('/');
  },


  /**
   * `UserController.signup()`
   */
  signup: function (req, res) {
    return res.json({
      todo: 'signup() is not implemented yet!'
    });
  }
};
