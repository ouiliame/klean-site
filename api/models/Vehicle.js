/**
 * Vehicle.js
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

    // belongs to which service provider?
    provider: {
      model: 'provider',
      unique: true
    },

    fryerOilCap: {
      type: 'integer',
      required: true,
      defaultsTo: 0
    },

    greaseTrapCap: {
      type: 'integer',
      required: true,
      defaultsTo: 0
    },

    hoodCleaningCap: {
      type: 'integer',
      required: true,
      defaultsTo: 0
    },

    hydroJettingCap: {
      type: 'integer',
      required: true,
      defaultsTo: 0
    }
  }
};
