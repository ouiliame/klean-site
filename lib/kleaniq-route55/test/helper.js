const faker = require('faker');
const schemas = require('../schemas');
const _ = require('lodash');

function fakeLocation(opts) {
    // this will be in SoCal area
    var defaults = {
        latitude: faker.finance.amount(32.5, 35.4, 6),
        longitude: faker.finance.amount(-117.15, -119.7, 6)
    };

    var options = Object.assign(defaults, opts);
    var result = schemas.location.validate(options);
    if (result.error !== null) {
        throw result.error;
    }
    return result.value;
};

function fakeTimeWindow (opts) {
    // FIXME: opts wont replace start
    var start = faker.random.number({min: 400, max: 800});
    var end = start + faker.random.number({min: 120, max: 600});
    var defaults = {
        start,
        end
    };
    var options = Object.assign(defaults, opts);
    var result = schemas.timeWindow.validate(options);
    if (result.error !== null) {
        throw result.error;
    }
    return result.value;
};

function fakeVehicle (opts) {
    var start = faker.random.number({min: 200, max: 600});
    var end = start + faker.random.number(800);
    var optionalKeys = {
        // location: fakeLocation(), -- pretty much always in LA
        startAt: start,
        endBy: end,
        costPerDistance: Math.random() * 2 + 0.5,
        fryerOil: faker.random.number({min: 1, max: 2500}),
        greaseTrap: faker.random.number({min: 1, max: 2500}),
        hoodCleaning: faker.random.number({min: 1, max: 2500}),
        hydroJetting: faker.random.number({min: 1, max: 2500})
    };
    var defaults = {
        key: faker.random.uuid(), // this should be random enough for no collisions
    };
    defaults = Object.assign(defaults, _.pickBy(optionalKeys, () => faker.random.boolean()));
    options = Object.assign(defaults, opts);

    var result = schemas.vehicle.validate(options);
    if (result.error !== null) {
        throw result.error;
    }
    return result.value;
};

function fakeServiceRequest (opts) {
    var optionalKeys = {
        timeWindow: fakeTimeWindow()
    };
    var defaults = {
        key: faker.random.uuid(),
        location: fakeLocation(),
        serviceType: _.sample(['fryerOil', 'greaseTrap', 'hoodCleaning', 'hydroJetting']),
        materialCost: faker.random.number({min: 30, max: 1500}),
        timeCost: faker.random.number({min: 5, max: 75})
    };
    defaults = Object.assign(defaults, _.pickBy(optionalKeys, () => faker.random.boolean()));
    options = Object.assign(defaults, opts);

    var result = schemas.serviceRequest.validate(options);
    if (result.error !== null) {
        throw result.error;
    }
    return result.value;
};

function fakeProblem(numVehicles, numRequests, opts) {
    var defaults = {
        fleet: _.times(numVehicles, fakeVehicle),
        requests: _.times(numRequests, fakeServiceRequest)
    };
    options = Object.assign(defaults, opts);
    var result = schemas.problem.validate(options);
    if (result.error !== null) {
        throw result.error;
    }
    return result.value;
}

module.exports = {
    fakeLocation,
    fakeTimeWindow,
    fakeVehicle,
    fakeServiceRequest,
    fakeProblem
};