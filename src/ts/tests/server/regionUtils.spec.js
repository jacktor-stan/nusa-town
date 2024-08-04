"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var regionUtils_1 = require("../../server/regionUtils");
var serverRegion_1 = require("../../server/serverRegion");
var serverMap_1 = require("../../server/serverMap");
var mocks_1 = require("../mocks");
var worldMap_1 = require("../../common/worldMap");
describe('regionUtils', function () {
    var client;
    var region;
    beforeEach(function () {
        client = mocks_1.mockClient();
        region = serverRegion_1.createServerRegion(2, 3);
    });
    describe('getExpectedRegion()', function () {
        it('returns only available region on the map', function () {
            var map = serverMap_1.createServerMap('', 0, 1, 1);
            var entity = mocks_1.serverEntity(1);
            chai_1.expect(regionUtils_1.getExpectedRegion(entity, map)).equal(map.regions[0]);
        });
        it('returns region at location if entity region is undefined', function () {
            var map = serverMap_1.createServerMap('', 0, 10, 10);
            var entity = mocks_1.serverEntity(1, 8 * 5, 8 * 5);
            chai_1.expect(regionUtils_1.getExpectedRegion(entity, map)).equal(worldMap_1.getRegion(map, 5, 5));
        });
        it('returns current region if entity is inside current region', function () {
            var map = serverMap_1.createServerMap('', 0, 10, 10);
            var entity = mocks_1.serverEntity(1, 8 * 5, 8 * 5);
            entity.region = worldMap_1.getRegion(map, 5, 5);
            chai_1.expect(regionUtils_1.getExpectedRegion(entity, map)).equal(worldMap_1.getRegion(map, 5, 5));
        });
        it('returns edge region if entity is outside the map', function () {
            var map = serverMap_1.createServerMap('', 0, 10, 10);
            var entity = mocks_1.serverEntity(1, 10000, 8 * 5);
            chai_1.expect(regionUtils_1.getExpectedRegion(entity, map)).equal(worldMap_1.getRegion(map, 9, 5));
        });
        it('returns the same region if entity is outside region but inside region border', function () {
            var map = serverMap_1.createServerMap('', 0, 10, 10);
            var entity = mocks_1.serverEntity(1, 8 * 5 + 0.1, 8 * 5, 1, { flags: 1 /* Movable */ });
            entity.region = worldMap_1.getRegion(map, 5, 5);
            chai_1.expect(regionUtils_1.getExpectedRegion(entity, map)).equal(worldMap_1.getRegion(map, 5, 5));
        });
    });
    describe('subscribeToRegions()', function () {
        it('subscribes to regions that are in camera view', function () {
            var map = serverMap_1.createServerMap('', 0, 2, 1);
            Object.assign(client.camera, { x: -10, y: 0, w: 5, h: 5 });
            client.map = map;
            regionUtils_1.subscribeToRegionsInRange(client);
            chai_1.expect(client.subscribes).eql([
                new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0]),
            ]);
        });
    });
    describe('unsubscribeFromRegions()', function () {
        it('adds unsubscribes to client for regions that are not in camera view', function () {
            var region1 = serverRegion_1.createServerRegion(1, 1);
            var region2 = serverRegion_1.createServerRegion(1, 2);
            client.regions = [region1, region2];
            Object.assign(client.camera, { x: -10, y: 0, w: 5, h: 5 });
            regionUtils_1.unsubscribeFromOutOfRangeRegions(client);
            chai_1.expect(client.unsubscribes).eql([1, 2]);
        });
    });
    describe('updateRegions()', function () {
        it('does nothing for empty map', function () {
            var map = serverMap_1.createServerMap('', 0, 1, 1);
            regionUtils_1.updateRegions([map]);
        });
        it('does nothing if no regions are changed', function () {
            var map = serverMap_1.createServerMap('', 0, 3, 3);
            var entity = mocks_1.serverEntity(1, 5, 5);
            serverRegion_1.addEntityToRegion(worldMap_1.getRegion(map, 0, 0), entity, map);
            var region = worldMap_1.getRegion(map, 0, 0);
            entity.region = region;
            regionUtils_1.updateRegions([map]);
            chai_1.expect(entity.region).equal(region);
        });
        it('transfers entity to another region', function () {
            var map = serverMap_1.createServerMap('', 0, 3, 3);
            var entity = mocks_1.serverEntity(1, 15, 15);
            entity.flags |= 1 /* Movable */;
            serverRegion_1.addEntityToRegion(worldMap_1.getRegion(map, 0, 0), entity, map);
            entity.region = worldMap_1.getRegion(map, 0, 0);
            regionUtils_1.updateRegions([map]);
            chai_1.expect(entity.region).equal(worldMap_1.getRegion(map, 1, 1));
        });
    });
    describe('commitRegionUpdates()', function () {
        it('creates update packets', function () {
            var client1 = mocks_1.mockClient();
            var client2 = mocks_1.mockClient();
            region.clients.push(client1, client2);
            var entityUpdates = [];
            var entityRemoves = [{}];
            var tileUpdates = [[]];
            region.x = 5;
            region.y = 6;
            region.entityUpdates = entityUpdates;
            region.entityRemoves = entityRemoves;
            region.tileUpdates = tileUpdates;
            regionUtils_1.commitRegionUpdates([region]);
            chai_1.expect(client1.regionUpdates.length).equal(1);
            chai_1.expect(client2.regionUpdates.length).equal(1);
        });
        it('does not send any updates if all lists are empty', function () {
            region.clients.push(mocks_1.mockClient(), mocks_1.mockClient());
            var updateEntities1 = sinon_1.stub(region.clients[0], 'update');
            var updateEntities2 = sinon_1.stub(region.clients[1], 'update');
            regionUtils_1.commitRegionUpdates([region]);
            sinon_1.assert.notCalled(updateEntities1);
            sinon_1.assert.notCalled(updateEntities2);
        });
        it('resets region updates', function () {
            region.tileUpdates.push({ x: 1, y: 2, type: 3 });
            region.entityUpdates = [{}, {}];
            regionUtils_1.commitRegionUpdates([region]);
            chai_1.expect(region.entityUpdates).eql([]);
        });
    });
    describe('transferToRegion()', function () {
        var map = serverMap_1.createServerMap('', 0, 1, 1);
        it('removes entity from current region', function () {
            var entity = mocks_1.serverEntity(1);
            var oldRegion = entity.region = serverRegion_1.createServerRegion(0, 0);
            serverRegion_1.addEntityToRegion(entity.region, entity, map);
            regionUtils_1.transferToRegion(entity, region, map);
            chai_1.expect(oldRegion.entities).not.contain(entity);
        });
        it('adds entity to new region', function () {
            var entity = mocks_1.serverEntity(1);
            regionUtils_1.transferToRegion(entity, region, map);
            chai_1.expect(region.entities).contain(entity);
        });
        it('updates entity region', function () {
            var entity = mocks_1.serverEntity(1);
            regionUtils_1.transferToRegion(entity, region, map);
            chai_1.expect(entity.region).equal(region);
        });
        it('adds entity update to current region', function () {
            var entity = mocks_1.serverEntity(1);
            entity.region = serverRegion_1.createServerRegion(0, 0);
            regionUtils_1.transferToRegion(entity, region, map);
            chai_1.expect(region.entityUpdates).eql([
            // ...
            ]);
        });
        // it('sends addEntity message to clients subscribed to destination region', () => {
        // 	const entity = serverEntity(1);
        // 	const otherClient = mockClient();
        // 	const addEntity = stub(otherClient, 'addEntity');
        // 	region.clients.push(otherClient);
        // 	otherClient.regions.push(region);
        // 	transferToRegion(entity, region, {}, {} as any);
        // 	assert.calledWith(addEntity as any, entity.id);
        // });
        // it('does not sent addEntity message to clients subscribed to destination region if entity is shadowed', () => {
        // 	const entity = serverEntity(1);
        // 	entity.client = mockClient({ shadowed: true });
        // 	const otherClient = mockClient();
        // 	const addEntity = stub(otherClient, 'addEntity');
        // 	region.clients.push(otherClient);
        // 	otherClient.regions.push(region);
        // 	transferToRegion(entity, region, {}, {} as any);
        // 	assert.notCalled(addEntity);
        // });
        // it('does not send addEntity message to clients subscribed to destination and source regions', () => {
        // 	const entity = serverEntity(1);
        // 	entity.region = createServerRegion(0, 0, 0);
        // 	const otherClient = mockClient();
        // 	const addEntity = stub(otherClient, 'addEntity');
        // 	region.clients.push(otherClient);
        // 	entity.region.clients.push(otherClient);
        // 	otherClient.regions.push(entity.region, region);
        // 	transferToRegion(entity, region, {}, {} as any);
        // 	assert.notCalled(addEntity);
        // });
    });
    describe('addToRegion()', function () {
        var map = serverMap_1.createServerMap('', 0, 1, 1);
        it('adds entity to region', function () {
            var entity = mocks_1.serverEntity(1);
            regionUtils_1.addToRegion(entity, region, map);
            chai_1.expect(region.entities).contain(entity);
        });
        it('sets entity region', function () {
            var entity = mocks_1.serverEntity(1);
            regionUtils_1.addToRegion(entity, region, map);
            chai_1.expect(entity.region).equal(region);
        });
        // it('sends addEntity message to all clients', () => {
        // 	region.clients.push(mockClient(), mockClient());
        // 	const addEntity1 = stub(region.clients[0], 'addEntity');
        // 	const addEntity2 = stub(region.clients[1], 'addEntity');
        // 	addToRegion(serverEntity(1), region, {}, hiding);
        // 	assert.calledOnce(addEntity1);
        // 	assert.calledOnce(addEntity2);
        // });
        // it('only sents addEntity message to entity client if shadowed', () => {
        // 	region.clients.push(mockClient());
        // 	const addEntity1 = stub(region.clients[0], 'addEntity');
        // 	const entity = serverEntity(1);
        // 	entity.client = mockClient({ shadowed: true });
        // 	const addEntity2 = stub(entity.client, 'addEntity');
        // 	addToRegion(entity, region, {}, hiding);
        // 	assert.notCalled(addEntity1);
        // 	assert.calledOnce(addEntity2);
        // });
        it('adds entity to region even if shadowed', function () {
            var entity = mocks_1.serverEntity(1);
            entity.client = mocks_1.mockClient({ shadowed: true });
            regionUtils_1.addToRegion(entity, region, map);
            chai_1.expect(region.entities).contain(entity);
        });
        it('sets entity region even if shadowed', function () {
            var entity = mocks_1.serverEntity(1);
            entity.client = mocks_1.mockClient({ shadowed: true });
            regionUtils_1.addToRegion(entity, region, map);
            chai_1.expect(entity.region).equal(region);
        });
    });
    describe('removeFromRegion()', function () {
        var map = serverMap_1.createServerMap('', 0, 1, 1);
        it('removes entity from region', function () {
            var entity = mocks_1.serverEntity(1);
            serverRegion_1.addEntityToRegion(region, entity, map);
            regionUtils_1.removeFromRegion(entity, region, map);
            chai_1.expect(region.entities).not.contain(entity);
        });
        it('unsets entity region', function () {
            var entity = mocks_1.serverEntity(1);
            serverRegion_1.addEntityToRegion(region, entity, map);
            regionUtils_1.removeFromRegion(entity, region, map);
            chai_1.expect(entity.region).undefined;
        });
        it('adds entity to removed entities list', function () {
            var entity = mocks_1.serverEntity(123);
            regionUtils_1.removeFromRegion(entity, region, map);
            chai_1.expect(region.entityRemoves).eql([123]);
        });
    });
    describe('isSubscribedToRegion()', function () {
        it('returns true if subscribed to region', function () {
            client.regions.push(region);
            region.clients.push(client);
            chai_1.expect(regionUtils_1.isSubscribedToRegion(client, region)).true;
        });
        it('returns false if not subscribed to region', function () {
            chai_1.expect(regionUtils_1.isSubscribedToRegion(client, region)).false;
        });
    });
    describe('unsubscribeFromAllRegions()', function () {
        it('removes client from region', function () {
            region.clients.push(client);
            client.regions.push(region);
            regionUtils_1.unsubscribeFromAllRegions(client, false);
            chai_1.expect(region.clients).not.contain(client);
        });
        it('removes region from client', function () {
            client.regions.push(region);
            regionUtils_1.unsubscribeFromAllRegions(client, false);
            chai_1.expect(client.regions).not.contain(region);
        });
        it('adds unsubscribes to client with region coordinates', function () {
            client.regions.push(serverRegion_1.createServerRegion(2, 3));
            regionUtils_1.unsubscribeFromAllRegions(client, false);
            chai_1.expect(client.unsubscribes).eql([2, 3]);
        });
        it('adds unsubscribes to client with all regions coordinates', function () {
            client.regions.push(serverRegion_1.createServerRegion(2, 3), serverRegion_1.createServerRegion(5, 6));
            regionUtils_1.unsubscribeFromAllRegions(client, false);
            chai_1.expect(client.unsubscribes).eql([2, 3, 5, 6]);
        });
        it('does not add unsibscribes to client if silent flag is set', function () {
            regionUtils_1.unsubscribeFromAllRegions(client, true);
            chai_1.expect(client.unsubscribes).eql([]);
        });
    });
});
//# sourceMappingURL=regionUtils.spec.js.map