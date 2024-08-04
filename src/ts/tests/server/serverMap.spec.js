"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var chai_1 = require("chai");
var serverMap_1 = require("../../server/serverMap");
var worldMap_1 = require("../../common/worldMap");
describe('serverMap', function () {
    var map;
    beforeEach(function () {
        map = serverMap_1.createServerMap('', 0, 10, 10);
    });
    it('throws when provided zero size for any of the parameters', function () {
        chai_1.expect(function () { return serverMap_1.createServerMap('', 0, 0, 1); }).throw('Invalid map parameters');
        chai_1.expect(function () { return serverMap_1.createServerMap('', 0, 1, 0); }).throw('Invalid map parameters');
    });
    it('gets total width of map', function () {
        chai_1.expect(map.width).equal(80);
    });
    it('gets total height of map', function () {
        chai_1.expect(map.height).equal(80);
    });
    describe('getRegion()', function () {
        it('returns region', function () {
            chai_1.expect(worldMap_1.getRegion(map, 0, 0)).equal(map.regions[0]);
        });
        it('throws if out of range', function () {
            chai_1.expect(function () { return worldMap_1.getRegion(map, -1, 0); }).throw('Invalid region coords (-1, 0)');
            chai_1.expect(function () { return worldMap_1.getRegion(map, 0, -1); }).throw('Invalid region coords (0, -1)');
            chai_1.expect(function () { return worldMap_1.getRegion(map, 99, 0); }).throw('Invalid region coords (99, 0)');
            chai_1.expect(function () { return worldMap_1.getRegion(map, 0, 99); }).throw('Invalid region coords (0, 99)');
        });
    });
    describe('getRegionGlobal()', function () {
        it('returns region at given position', function () {
            chai_1.expect(worldMap_1.getRegionGlobal(map, 0.5, 8.5)).equal(worldMap_1.getRegion(map, 0, 1));
        });
        it('clamps position outside of the map (1)', function () {
            chai_1.expect(worldMap_1.getRegionGlobal(map, -0.5, -10)).equal(worldMap_1.getRegion(map, 0, 0));
        });
        it('clamps position outside of the map (2)', function () {
            chai_1.expect(worldMap_1.getRegionGlobal(map, 1000, 2000)).equal(worldMap_1.getRegion(map, 9, 9));
        });
    });
});
//# sourceMappingURL=serverMap.spec.js.map