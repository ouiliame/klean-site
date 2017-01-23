const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const Route66 = require('../index');
const helper = require('./helper');
const _ = require('lodash');

chai.use(chaiAsPromised);

describe('problem', () => {
    describe('validation', () => {
        it('should create problem with correct vehicles & requests', () => {
            var p = helper.fakeProblem(5, 20);
            var myProblem = new Route66.Problem(p);
            expect(myProblem).to.have.ownProperty('problem');
        });

        it('should give error on duplicate vehicles', () => {
            var v = helper.fakeVehicle();
            var fleetWithDuplicates = [v, v, helper.fakeVehicle(), v];
            var p = helper.fakeProblem(0, 10, {fleet: fleetWithDuplicates});
            expect(() => new Route66.Problem(p)).to.throw(/duplicate keys in fleet/);
        });

        it('should give error on duplicate requests', () => {
            var r = helper.fakeServiceRequest();
            var reqWithDuplicates = [r, r, helper.fakeServiceRequest(), r];
            var p = helper.fakeProblem(5, 0, {requests: reqWithDuplicates});
            expect(() => new Route66.Problem(p)).to.throw(/duplicate keys in requests/);
        });
    });

    describe('routes', () => {
        it('should produce a route', () => {
            var p = helper.fakeProblem(5, 20);
            var myProblem = new Route66.Problem(p);
            return expect(myProblem.solve()).to.eventually.have.ownProperty('totalCost');
        });

        it('should have all requests in routes or unassignedJobs', () => {
            var numRequests = _.random(15, 35);
            var p = helper.fakeProblem(5, numRequests);
            var myProblem = new Route66.Problem(p);

            var getRequestCount = function (soln) {
                var requestsNotAssigned = soln.unassignedJobs;
                var requestsFromRoutes = _(soln.routes).flatMap('jobs').map('request').uniq().value();
                return _.concat(requestsFromRoutes, requestsNotAssigned).length;
            };

            return expect(myProblem.solve().then(getRequestCount)).to.eventually.equal(numRequests);
        });
    });
})