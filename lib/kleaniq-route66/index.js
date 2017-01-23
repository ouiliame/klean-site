"use strict";
const java = require('java');
const fs = require('fs');
const Promise = require('bluebird');
const _ = require('lodash');
const schemas = require('./schemas');

java.classpath.pushDir('./jar_dependencies/');
java.asyncOptions = {
    asyncSuffix: 'Async',
    syncSuffix: '',
    promiseSuffix: 'P',
    promisify: Promise.promisify
};

const indices = {
    fryerOil: 0,
    greaseTrap: 1,
    hoodCleaning: 2,
    hydroJetting: 3
};

const jsprit = {
    Location: java.import('jsprit.core.problem.Location'),
    VehicleType: java.import('jsprit.core.problem.vehicle.VehicleTypeImpl').Builder,
    Vehicle: java.import('jsprit.core.problem.vehicle.VehicleImpl').Builder,
    Service: java.import('jsprit.core.problem.job.Service').Builder,
    TimeWindow: java.import('jsprit.core.problem.solution.route.activity.TimeWindow'),
    Problem: java.import('jsprit.core.problem.VehicleRoutingProblem').Builder,
    FiniteFleetSize: java.import('jsprit.core.problem.VehicleRoutingProblem').FleetSize.FINITE,
    SchrimpfFactory: java.import('jsprit.core.algorithm.box.SchrimpfFactory'),
    Solutions: java.import('jsprit.core.util.Solutions'),
    // TODO: replace the following cost with a more accurate predictive model
    NaiveEuclideanCost: java.import('com.kleaniq.Route66.NaiveEuclideanCost')
};

function makeLocation(location) {
    var result = schemas.location.validate(location);
    if (result.error !== null) {
        throw result.error;
    }
    var l = result.value;
    return jsprit.Location.newInstance(l.latitude, l.longitude);
}

// time window is characteristic of Service Requests, NOT VEHICLES
// USE startAt: ____, and endBy: ______ for vehicles
function makeTimeWindow(timeWindow) {
    var result = schemas.timeWindow.validate(timeWindow);
    if (result.error !== null) {
        throw result.error;
    }

    var tw = result.value;
    return jsprit.TimeWindow.newInstance(tw.start, tw.end);
}

function makeVehicle(vehicle) {
    var result = schemas.vehicle.validate(vehicle);
    if (result.error !== null) {
        throw result.error;
    }

    var v = result.value;

    var typeBuilder = jsprit.VehicleType.newInstance(v.key + '__type');
    _(['fryerOil', 'greaseTrap', 'hoodCleaning', 'hydroJetting']).forEach((skill) => {
        if (v.hasOwnProperty(skill)) {
            typeBuilder.addCapacityDimension(indices[skill], v[skill]);
        }
    });

    if (v.hasOwnProperty('costPerDistance')) {
        typeBuilder.setCostPerDistance(v.costPerDistance);
    }

    var type = typeBuilder.build();

    var vehicleBuilder = jsprit.Vehicle.newInstance(v.key);
    vehicleBuilder.setType(type);
    vehicleBuilder.setStartLocation(makeLocation(v.location));

    if (v.hasOwnProperty('startAt')) {
        vehicleBuilder.setEarliestStart(v.startAt);
    }

    if (v.hasOwnProperty('endBy')) {
        vehicleBuilder.setLatestArrival(v.endBy);
    }

    _(['fryerOil', 'greaseTrap', 'hoodCleaning', 'hydroJetting']).forEach((skill) => {
        if (v.hasOwnProperty(skill)) {
            vehicleBuilder.addSkill(skill);
        }
    });

    return vehicleBuilder.build();
};

function makeServiceRequest(request) {
    var result = schemas.serviceRequest.validate(request);
    if (result.error !== null) {
        throw result.error;
    }

    var r = result.value;
    var serviceBuilder = jsprit.Service.newInstance(r.key);
    serviceBuilder.setLocation(makeLocation(r.location));
    serviceBuilder.addSizeDimension(indices[r.serviceType], r.materialCost);
    serviceBuilder.addRequiredSkill(r.serviceType);
    serviceBuilder.setServiceTime(r.timeCost);
    if (r.hasOwnProperty('timeWindow')) {
        serviceBuilder.setTimeWindow(makeTimeWindow(r.timeWindow));
    }

    return serviceBuilder.build();
}

class Problem {

    /**
     * Creates a problem from a problem definition
     * @param problem
     */
    constructor(problem) {
        var result = schemas.problem.validate(problem);
        if (result.error !== null) {
            throw result.error;
        }

        var p = result.value;
        this.fleet = p.fleet;
        this.requests = p.requests;

        // ensure that keys are unique for fleet
        var dupVehicleKeys = _(this.fleet).countBy('key').pickBy((v) => v > 1).value();
        var dupRequestKeys = _(this.requests).countBy('key').pickBy((v) => v > 1).value();
        if (!_.isEmpty(dupVehicleKeys)) {
            throw new Error("duplicate keys in fleet: " + JSON.stringify(dupVehicleKeys));
        }

        if (!_.isEmpty(dupRequestKeys)) {
            throw new Error("duplicate keys in requests: " + JSON.stringify(dupRequestKeys));
        }

        var problemBuilder = jsprit.Problem.newInstance();
        _(this.fleet).forEach((vehicle) => {
            problemBuilder.addVehicle(makeVehicle(vehicle));
        });

        _(this.requests).forEach((request) => {
            problemBuilder.addJob(makeServiceRequest(request));
        });

        problemBuilder.setFleetSize(jsprit.FiniteFleetSize);
        problemBuilder.setRoutingCost(new jsprit.NaiveEuclideanCost());
        this.problem = problemBuilder.build();
    }

    /**
     * Builds friendly JSON repr of the solution
     * @param solution
     * @returns {{totalCost: number, unassignedJobs: Array, routes: Array}}
     * @private
     */
    _buildResponse(solution) {
        // scary java Objects
        var javaRoutes = solution.getRoutes().toArray();
        var routes = _.map(javaRoutes, (r) => {
            return {
                vehicle: r.getVehicle().getId(),
                jobs: _.map(r.getActivities().toArray(), (a) => {
                    return {
                        request: a.getJob().getId(),
                        arrivalTime: Math.round(a.getArrTime()),
                        departureTime: Math.round(a.getEndTime())
                    }
                })
            }
        });

        return {
            totalCost: Math.round(solution.getCost()),
            unassignedJobs: _.map(solution.getUnassignedJobs().toArray(), (j) => j.getId()),
            routes
        };
    }

    // TODO: add options ??
    /**
     * Solves the Problem defined, returns a bluebird Promise
     * @param opts
     */
    solve(opts) {
        var options = Object.assign({maxIterations: 256}, opts);
        var algorithm = (new jsprit.SchrimpfFactory()).createAlgorithm(this.problem);
        algorithm.setMaxIterations(options.maxIterations);
        return algorithm.searchSolutionsP().then((solutionRoutes) => {
            return jsprit.Solutions.bestOfP(solutionRoutes);
        }).then((bestSolution) => {
            return this._buildResponse(bestSolution);
        });
    }
}

module.exports = {
    Problem
};
