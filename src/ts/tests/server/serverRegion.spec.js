"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var chai_1 = require("chai");
var serverRegion_1 = require("../../server/serverRegion");
var mocks_1 = require("../mocks");
var region_1 = require("../../common/region");
describe('serverRegion', function () {
    var region;
    beforeEach(function () {
        region = serverRegion_1.createServerRegion(1, 2);
    });
    it('has correct bounds', function () {
        chai_1.expect(region.bounds).eql({ x: 8, y: 16, w: 8, h: 8 });
    });
    it('has correct boundsWithBorder', function () {
        chai_1.expect(region.boundsWithBorder).eql({ x: 7, y: 15, w: 10, h: 10 });
    });
    it('sets and gets tile at given position', function () {
        serverRegion_1.setRegionTile({}, region, 1, 2, 2 /* Grass */);
        chai_1.expect(region_1.getRegionTile(region, 1, 2)).equal(2 /* Grass */);
    });
    describe('addUpdate()', function () {
        it('adds entity update to update list', function () {
            var entity = mocks_1.serverEntity(1, 5, 4);
            serverRegion_1.pushUpdateEntityToRegion(region, { entity: entity, flags: 1 /* Position */, x: 5, y: 4, vx: 0, vy: 0 });
            chai_1.expect(region.entityUpdates).eql([
                {
                    entity: entity,
                    flags: 1 /* Position */,
                    x: 5,
                    y: 4,
                    vx: 0,
                    vy: 0,
                    action: 0,
                    playerState: 0,
                    options: undefined,
                },
            ]);
        });
        it('updates existing entity update', function () {
            var entity = mocks_1.serverEntity(1, 5, 4);
            serverRegion_1.pushUpdateEntityToRegion(region, { entity: entity, flags: 0 /* None */ });
            serverRegion_1.pushUpdateEntityToRegion(region, { entity: entity, flags: 1 /* Position */ | 8 /* Expression */, x: 10, y: 11, vx: 5, vy: 3 });
            chai_1.expect(region.entityUpdates).eql([
                {
                    entity: entity,
                    flags: 1 /* Position */ | 8 /* Expression */,
                    x: 10,
                    y: 11,
                    vx: 5,
                    vy: 3,
                    action: 0,
                    playerState: 0,
                    options: undefined,
                },
            ]);
        });
        it('does not update position of existing entry if position flag is false', function () {
            var entity = mocks_1.serverEntity(1, 5, 4);
            serverRegion_1.pushUpdateEntityToRegion(region, { entity: entity, flags: 1 /* Position */, x: 5, y: 4, vx: 0, vy: 0 });
            entity.x = 10;
            entity.y = 11;
            entity.vx = 5;
            entity.vy = 3;
            serverRegion_1.pushUpdateEntityToRegion(region, { entity: entity, flags: 8 /* Expression */ });
            chai_1.expect(region.entityUpdates).eql([
                {
                    entity: entity,
                    flags: 1 /* Position */ | 8 /* Expression */,
                    x: 5,
                    y: 4,
                    vx: 0,
                    vy: 0,
                    action: 0,
                    playerState: 0,
                    options: undefined,
                },
            ]);
        });
    });
    describe('addRemove()', function () {
        it('adds entity remove to remove list', function () {
            serverRegion_1.pushRemoveEntityToRegion(region, mocks_1.serverEntity(123));
            chai_1.expect(region.entityRemoves).eql([123]);
        });
    });
    describe('resetRegionUpdates()', function () {
        it('resets all update lists to empty lists', function () {
            region.entityUpdates = [{}, {}];
            region.entityRemoves = [{}, {}];
            region.tileUpdates = [{}, {}];
            serverRegion_1.resetRegionUpdates(region);
            chai_1.expect(region.entityUpdates).eql([]);
            chai_1.expect(region.entityRemoves).eql([]);
            chai_1.expect(region.tileUpdates).eql([]);
        });
    });
});
//# sourceMappingURL=serverRegion.spec.js.map