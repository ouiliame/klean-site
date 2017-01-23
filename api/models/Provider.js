/**
 * Provider.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },

    user: {
      model: 'user',
      unique: true
    },

    clients: {
      collection: 'client',
      via: 'provider'
    },

    fleet: {
      collection: 'vehicle',
      via: 'provider'
    },

    drivers: {
      collection: 'driver',
      via: 'provider'
    }
  }
};
