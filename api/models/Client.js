/**
 * Client.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    user: {
      model: 'user',
      unique: true
    },

    name: {
      type: 'string',
      required: true
    },

    provider: {
      model: 'provider'
    },

    address: {
      type: 'string',
      required: true
    },

    containerSize: {
      type: 'float',
      required: true,
      defaultsTo: 0
    },

    frequency: {
      type: 'integer'
    },

    latitude: {
      type: 'float'
    },

    longitude: {
      type: 'float'
    },

    telephone: {
      type: 'string'
    }
  }
};
