/**
 * RoutesController
 *
 * @description :: Server-side logic for managing routes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: function (req, res) {
		userId = req.session.user.id;
		routes = Routes.find({ user: userId });
		return res.view({ routes: routes });
  },

	new: function (req, res) {
		return res.ok();
	},

	findOne: function (req, res) {
		return res.ok();
	}
};
