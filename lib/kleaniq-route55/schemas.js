const Joi = require('joi');

const location = Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required()
});

/**
 * Points to 1500 Canal Ave. Long Beach, CA 90813
 * @type {{latitude: number, longitude: number}}
 */
const defaultLocation = {
    latitude: 33.785765,
    longitude: -118.213798
};

const timeWindow = Joi.object({
    start: Joi.number().integer().min(0).required(),
    end: Joi.number().integer().min(0).required()
});

const vehicle = Joi.object({
    key: Joi.string().required(), // ID to reference this vehicle by
    location: location.default(defaultLocation),
    startAt: Joi.number().integer().min(0).optional(),
    endBy: Joi.number().integer().min(0).optional(),
    costPerDistance: Joi.number().min(0).default(1.0),
    fryerOil: Joi.number().integer().positive().optional(), // define capacity or leave out key
    greaseTrap: Joi.number().integer().positive().optional(),
    hoodCleaning: Joi.number().integer().positive().optional(),
    hydroJetting: Joi.number().integer().positive().optional()
});

const serviceRequest = Joi.object({
    key: Joi.string().required(),
    location: location.required(),
    timeWindow: timeWindow.optional(),
    serviceType: Joi.string().required()
        .valid(['fryerOil', 'greaseTrap', 'hoodCleaning', 'hydroJetting']),
    materialCost: Joi.number().integer().min(0).default(0),
    timeCost: Joi.number().integer().min(0).default(0)
});

const problem = Joi.object({
    fleet: Joi.array().items(vehicle).min(1).single(),
    requests: Joi.array().items(serviceRequest).min(1).single()
});

module.exports = {
    location,
    timeWindow,
    vehicle,
    serviceRequest,
    problem
}