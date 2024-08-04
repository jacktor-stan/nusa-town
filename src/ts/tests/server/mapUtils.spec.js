"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var chai_1 = require("chai");
var serverMap_1 = require("../../server/serverMap");
var mocks_1 = require("../mocks");
var serverRegion_1 = require("../../server/serverRegion");
var worldMap_1 = require("../../common/worldMap");
describe('mapUtils', function () {
    var map;
    function addEntities(region) {
        var entities = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            entities[_i - 1] = arguments[_i];
        }
        entities.forEach(function (e) { return serverRegion_1.addEntityToRegion(region, e, map); });
    }
    beforeEach(function () {
        map = serverMap_1.createServerMap('', 0, 10, 10);
    });
    describe('findEntities()', function () {
        it('returns all entities matching given predicate (1)', function () {
            var entity = mocks_1.serverEntity(3);
            addEntities(worldMap_1.getRegion(map, 3, 4), mocks_1.serverEntity(1), mocks_1.serverEntity(2), entity);
            chai_1.expect(serverMap_1.findEntities(map, function (e) { return e.id === 3; })).eql([entity]);
        });
        it('returns all entities matching given predicate (2)', function () {
            var entity3 = mocks_1.serverEntity(3);
            var entity2 = mocks_1.serverEntity(3);
            addEntities(worldMap_1.getRegion(map, 3, 4), mocks_1.serverEntity(1), entity2, entity3);
            chai_1.expect(serverMap_1.findEntities(map, function (e) { return e.id > 1; })).eql([entity2, entity3]);
        });
        it('returns empty array if not found', function () {
            chai_1.expect(serverMap_1.findEntities(map, function (e) { return e.id === 3; })).eql([]);
        });
    });
    describe('findClosestEntity()', function () {
        it('returns undefined for empty map', function () {
            var map = serverMap_1.createServerMap('', 0, 1, 1);
            var result = serverMap_1.findClosestEntity(map, 0, 0, function () { return true; });
            chai_1.expect(result).undefined;
        });
        it('returns first matching entity (first)', function () {
            var map = serverMap_1.createServerMap('', 0, 1, 1);
            var entity = mocks_1.serverEntity(1);
            map.regions[0].entities.push(entity);
            var result = serverMap_1.findClosestEntity(map, 0, 0, function () { return true; });
            chai_1.expect(result).equal(entity);
        });
        it('returns first matching entity (second)', function () {
            var map = serverMap_1.createServerMap('', 0, 1, 1);
            var entity1 = mocks_1.serverEntity(1);
            var entity2 = mocks_1.serverEntity(2);
            map.regions[0].entities.push(entity1, entity2);
            var result = serverMap_1.findClosestEntity(map, 0, 0, function (e) { return e.id === 2; });
            chai_1.expect(result).equal(entity2);
        });
        it('returns first matching entity (in 2nd region)', function () {
            var map = serverMap_1.createServerMap('', 0, 2, 2);
            var entity1 = mocks_1.serverEntity(1);
            var entity2 = mocks_1.serverEntity(2);
            map.regions[0].entities.push(entity1);
            map.regions[1].entities.push(entity2);
            var result = serverMap_1.findClosestEntity(map, 0, 0, function (e) { return e.id === 2; });
            chai_1.expect(result).equal(entity2);
        });
        it('returns closest matching entity (2nd is closest)', function () {
            var map = serverMap_1.createServerMap('', 0, 1, 1);
            var entity1 = mocks_1.serverEntity(1, 0, 0);
            var entity2 = mocks_1.serverEntity(2, 1, 1);
            map.regions[0].entities.push(entity1, entity2);
            var result = serverMap_1.findClosestEntity(map, 1, 1, function () { return true; });
            chai_1.expect(result).equal(entity2);
        });
        it('stops searching if found in first region', function () {
            var map = serverMap_1.createServerMap('', 0, 2, 2);
            var entity1 = mocks_1.serverEntity(1, 0, 0);
            var entity2 = mocks_1.serverEntity(2, 11, 11);
            map.regions[0].entities.push(entity1);
            map.regions[1].entities.push(entity2);
            var checks = 0;
            var result = serverMap_1.findClosestEntity(map, 1, 1, function () { return (checks++, true); });
            chai_1.expect(checks).equal(1);
            chai_1.expect(result).equal(entity1);
        });
        it('searches for entity in ring pattern', function () {
            var map = serverMap_1.createServerMap('', 0, 5, 5);
            for (var y = 0; y < 5; y++) {
                for (var x = 0; x < 5; x++) {
                    worldMap_1.getRegion(map, x, y).entities.push(mocks_1.serverEntity(0, x * 8 + 1, y * 8 + 1, 1, { name: x + "," + y }));
                }
            }
            var checks = [];
            var result = serverMap_1.findClosestEntity(map, map.width / 2, map.height / 2, function (e) { return (checks.push(e.name), false); });
            chai_1.expect(checks).eql([
                '2,2',
                '1,1', '2,1', '3,1',
                '1,2', /*  */ '3,2',
                '1,3', '2,3', '3,3',
                '0,0', '1,0', '2,0', '3,0', '4,0',
                '0,1', /*                */ '4,1',
                '0,2', /*                */ '4,2',
                '0,3', /*                */ '4,3',
                '0,4', '1,4', '2,4', '3,4', '4,4',
            ]);
            chai_1.expect(result).undefined;
        });
    });
});
//# sourceMappingURL=mapUtils.spec.js.map