const expect = require('chai').expect;
const schemas = require('../schemas');
const faker = require('faker');

// TODO: use helpers instead of inline faker.js
describe('schemas', () => {
    describe('location', () => {
        it('should validate w/ good latitude & longitude', () => {
            var result = schemas.location.validate({latitude: 12, longitude: 15});
            expect(result.error).to.be.null;

            result = schemas.location.validate({latitude: -33.25, longitude: 112.32123});
            expect(result.error).to.be.null;
        });

        it('should validate w/ type coercion (string)', () => {
            var result = schemas.location.validate({latitude: "33.25", longitude: "-123.234234"});
            expect(result.error).to.be.null;
        });

        it('should give an error w/ missing keys', () => {
            var result = schemas.location.validate({latitude: 12});
            expect(result.error).to.not.be.null;

            result = schemas.location.validate({longitude: 15});
            expect(result.error).to.not.be.null;
        });

        it('should give an error w/ bad keys', () => {
            var result = schemas.location.validate({latitude: false, longitude: 15});
            expect(result.error).to.not.be.null;

            result = schemas.location.validate({longitude: 15});
            expect(result.error).to.not.be.null;
        });

        it('should give an error w/ extraneous keys', () => {
            var result = schemas.location.validate({latitude: 12, longitude: 15, pie: 3});
            expect(result.error).to.not.be.null;
        });
    });

    describe('timeWindow', () => {

        it('should validate w/ good start & end', () => {
            var result = schemas.timeWindow.validate({start: 480, end: 1200});
            expect(result.error).to.be.null;
        });


        it('should not allow for negative start time or end time', () => {
            var result = schemas.timeWindow.validate({start: -25});
            expect(result.error).to.not.be.null;

            result = schemas.timeWindow.validate({start: 25, end: -1200});
            expect(result.error).to.not.be.null;
        });
    });

    describe('vehicle', () => {
        it('should validate w/ good data (defaults)', () => {
            var vehicle = {
                key: "a103",
                fryerOil: 1000,
            };

            var result = schemas.vehicle.validate(vehicle);
            expect(result.error).to.be.null;
            expect(result.value.startAt).to.be.undefined;
            expect(result.value).to.have.ownProperty('location');
            expect(result.value.costPerDistance).to.equal(1); // defaults
        });

        it('should validate w/ good data (override defaults)', () => {
            var vehicle = {
                key: "a103",
                location: {
                    latitude: 33.937289,
                    longitude: 44.212
                },
                startAt: 400,
                endBy: 800,
                costPerDistance: 2,
                fryerOil: 1000,
                greaseTrap: 500
            };

            var result = schemas.vehicle.validate(vehicle);
            expect(result.error).to.be.null;
            expect(result.value.costPerDistance).to.equal(2);
            expect(result.value.location.latitude).to.equal(33.937289);
        });

        it('should give an error w/ bad costPerDistance', () => {
            var vehicle = {
                key: "a103",
                costPerDistance: -2
            };
            var result = schemas.vehicle.validate(vehicle);
            expect(result.error).to.not.be.null;
        });
    });

    describe('serviceRequest', () => {
        it('should validate w/ good data (defaults)', () => {
            var request = {
                key: "123",
                location: {
                    latitude: 20,
                    longitude: -35
                },
                serviceType: 'fryerOil'
            };
            var result = schemas.serviceRequest.validate(request);
            expect(result.error).to.be.null;
            expect(result.value.materialCost).to.equal(0);
        });

        it('should validate w/ good data (override defaults)', () => {
            var request = {
                key: "123",
                location: {
                    latitude: 20,
                    longitude: -35
                },
                serviceType: 'fryerOil',
                materialCost: 5, // gallons
                timeCost: 20 // minutes
            };
            var result = schemas.serviceRequest.validate(request);
            expect(result.error).to.be.null;
            expect(result.value.materialCost).to.equal(5);
            expect(result.value.timeCost).to.equal(20);
        });

        it('should give an error w/ missing values', () => {
            var request = {
                key: "123"
            };
            var result = schemas.serviceRequest.validate(request);
            expect(result.error).to.not.be.null;
        });

        it('should give an error w/ unrecognized serviceType', () => {
            var request = {
                key: "123",
                location: {
                    latitude: 20,
                    longitude: -35
                },
                serviceType: 'massage'
            };

            var result = schemas.serviceRequest.validate(request);
            expect(result.error).to.not.be.null;
        });
    });

    describe('problem', () => {

        it('should be valid w/ single fleet & request', () => {
            var singleVehicle = {
                key: 'abc',
                fryerOil: 1000
            };

            var singleRequest = {
                key: '123',
                location: {
                    latitude: 12,
                    longitude: 15
                },
                serviceType: 'fryerOil'
            };

            var problem = {
                fleet: singleVehicle,
                requests: singleRequest
            };

            var result = schemas.problem.validate(problem);
            expect(result.error).to.be.null;
            expect(result.value.fleet).to.be.an('array');
            expect(result.value.requests).to.be.an('array');
        });

        it('should validate w/ array fleet & request', () => {
            var problem = {
                fleet: [
                    {
                        key: faker.random.uuid(),
                        fryerOil: 900
                    },
                    {
                        key: faker.random.uuid(),
                        startAt: 400,
                        endBy: 1200,
                        greaseTrap: 1200
                    }
                ],
                requests: [
                    {
                        key: faker.random.uuid(),
                        location: {
                            latitude: 12,
                            longitude: -5
                        },
                        timeWindow: {
                            start: 400,
                            end: 800
                        },
                        serviceType: 'greaseTrap'
                    },
                    {
                        key: faker.random.uuid(),
                        location: {
                            latitude: 4,
                            longitude: -25
                        },
                        materialCost: 45,
                        serviceType: 'hoodCleaning'
                    }
                ]
            };

            var result = schemas.problem.validate(problem);
            expect(result.error).to.be.null;
            expect(result.value.fleet).to.be.an('array');
            expect(result.value.requests).to.be.an('array');
        });

        it('should give an error with bad vehicle in fleet', () => {
            var problem = {
                fleet: [
                    {
                        fryerOil: 900
                    },
                    {
                        key: faker.random.uuid(),
                        startAt: 400,
                        endBy: 800,
                        greaseTrap: 1200
                    }
                ],
                requests: [
                    {
                        key: faker.random.uuid(),
                        location: {
                            latitude: 12,
                            longitude: -5
                        },
                        timeWindow: {
                            start: 400,
                            end: 800
                        },
                        serviceType: 'greaseTrap'
                    },
                    {
                        key: faker.random.uuid(),
                        location: {
                            latitude: 4,
                            longitude: -25
                        },
                        materialCost: 45,
                        serviceType: 'hoodCleaning'
                    }
                ]
            };

            var result = schemas.problem.validate(problem);
            expect(result.error).to.not.be.null;
        });

        it('should give an error with bad request in queue', () => {
            var problem = {
                fleet: [
                    {
                        key: faker.random.uuid(),
                        fryerOil: 900
                    },
                    {
                        key: faker.random.uuid(),
                        timeWindow: {
                            start: 400,
                            end: 1200
                        },
                        greaseTrap: 1200
                    }
                ],
                requests: [
                    {
                        key: faker.random.uuid(),
                        location: {
                            latitude: 12,
                            longitude: -5
                        },
                        timeWindow: {
                            start: 400,
                            end: 800
                        },
                        serviceType: 'massages'
                    },
                    {
                        key: faker.random.uuid(),
                        location: {
                            latitude: 4,
                            longitude: -25
                        },
                        materialCost: 45,
                        serviceType: 'hoodCleaning'
                    }
                ]
            };

            var result = schemas.problem.validate(problem);
            expect(result.error).to.not.be.null;
        });

    });

});