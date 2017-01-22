/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

// TODO: change to actually hash
function identity(pwd) {
  return pwd;
}

var hash = identity;

module.exports = {

  attributes: {
    email: {
      type: 'email',
      unique: true,
      required: true
    },

    passwordHash: {
      type: 'string',
      required: true
    },

    accountType: {
      type: 'string',
      enum: ['client', 'provider', 'driver'],
      required: true
    },

    client: {
      model: 'client',
      unique: true
    },

    provider: {
      model: 'provider',
      unique: true
    },

    driver: {
      model: 'driver',
      unique: true
    }
  },

  tryLogin: function(email, password, cb) {
    User.findOne({
      email: email,
      passwordHash: hash(password)
    }).exec(cb);
  }
};
