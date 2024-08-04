"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var ag_sockets_1 = require("ag-sockets");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var entityUtils_1 = require("../../server/entityUtils");
var mocks_1 = require("../mocks");
var serverRegion_1 = require("../../server/serverRegion");
var serverMap_1 = require("../../server/serverMap");
describe('entityUtils [server]', function () {
    describe('findClosest()', function () {
        it('returns undefined for empty list', function () {
            chai_1.expect(entityUtils_1.findClosest(0, 0, []));
        });
        it('returns closest entity', function () {
            var entities = [
                { x: 1, y: 0 },
                { x: 0, y: 0 },
                { x: 0, y: 1 },
            ];
            chai_1.expect(entityUtils_1.findClosest(0, 0, entities)).equal(entities[1]);
        });
    });
    describe('updateEntityOptions()', function () {
        it('updates entity options field', function () {
            var entity = mocks_1.serverEntity(2, 0, 0, 0, { options: { tag: 'bar' } });
            entityUtils_1.updateEntityOptions(entity, { expr: 5 });
            chai_1.expect(entity.options).eql({ tag: 'bar', expr: 5 });
        });
        it('handles undefined options field', function () {
            var entity = mocks_1.serverEntity(2);
            entity.options = undefined;
            entityUtils_1.updateEntityOptions(entity, { expr: 5 });
            chai_1.expect(entity.options).eql({ expr: 5 });
        });
        it('adds update to region', function () {
            var entity = mocks_1.serverEntity(2, 0, 0, 0, { options: { tag: 'bar' } });
            entity.region = serverRegion_1.createServerRegion(0, 0);
            entity.region.clients.push(mocks_1.mockClient(), mocks_1.mockClient());
            entityUtils_1.updateEntityOptions(entity, { expr: 5 });
            chai_1.expect(entity.region.entityUpdates).eql([
                { entity: entity, flags: 32 /* Options */, x: 0, y: 0, vx: 0, vy: 0, action: 0, playerState: 0, options: { expr: 5 } },
            ]);
        });
    });
    describe('updateEntityState()', function () {
        it('sets flags on entity', function () {
            var entity = mocks_1.serverEntity(0);
            entityUtils_1.updateEntityState(entity, 123);
            chai_1.expect(entity.state).equal(123);
        });
        it('adds flag update to region updates', function () {
            var entity = mocks_1.serverEntity(0);
            var region = serverRegion_1.createServerRegion(0, 0);
            entity.client = mocks_1.mockClient({});
            entity.region = region;
            entityUtils_1.updateEntityState(entity, 123);
            chai_1.expect(region.entityUpdates).eql([
                { entity: entity, flags: 4 /* State */, x: 0, y: 0, vx: 0, vy: 0, action: 0, playerState: 0, options: undefined },
            ]);
        });
        it('sends flag update to client if shadowed', function () {
            var entity = mocks_1.serverEntity(12);
            entity.region = serverRegion_1.createServerRegion(0, 0);
            entity.client = mocks_1.mockClient({ shadowed: true });
            entityUtils_1.updateEntityState(entity, 123);
            chai_1.expect(ag_sockets_1.getWriterBuffer(entity.client.updateQueue)).eql(new Uint8Array([2, 0, 4, 0, 0, 0, 12, 123]));
        });
    });
    describe('fixPosition()', function () {
        var client;
        beforeEach(function () {
            client = mocks_1.mockClient();
            client.map = serverMap_1.createServerMap('', 0, 1, 1);
        });
        it('updates entity position to given position', function () {
            var entity = mocks_1.serverEntity(1);
            entity.x = 10;
            entity.y = 5;
            entityUtils_1.fixPosition(entity, client.map, 1, 2, false);
            chai_1.expect(entity.x).equal(1);
            chai_1.expect(entity.y).equal(2);
        });
        it('submits entity update to region', function () {
            var region = serverRegion_1.createServerRegion(0, 0);
            var entity = mocks_1.serverEntity(1);
            entity.region = region;
            entityUtils_1.fixPosition(entity, client.map, 1, 2, false);
            chai_1.expect(region.entityUpdates).eql([
                {
                    entity: entity,
                    flags: 1 /* Position */ | 4 /* State */, x: 1, y: 2, vx: 0, vy: 0,
                    action: 0, playerState: 0, options: undefined
                },
            ]);
        });
        it('sends fix position message to client', function () {
            var fixPositionStub = sinon_1.stub(client, 'fixPosition');
            entityUtils_1.fixPosition(client.pony, client.map, 1, 2, false);
            sinon_1.assert.calledWith(fixPositionStub, 1, 2, false);
        });
        it('sets fixing flag on client', function () {
            entityUtils_1.fixPosition(client.pony, client.map, 1, 2, false);
            chai_1.expect(client.fixingPosition).true;
        });
    });
});
//# sourceMappingURL=entityUtils.spec.js.map