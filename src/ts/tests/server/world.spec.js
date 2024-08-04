"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var rxjs_1 = require("rxjs");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var world_1 = require("../../server/world");
var mocks_1 = require("../mocks");
var party_1 = require("../../server/services/party");
var notification_1 = require("../../server/services/notification");
var serverRegion_1 = require("../../server/serverRegion");
var serverMap_1 = require("../../server/serverMap");
var friends_1 = require("../../server/services/friends");
var hiding_1 = require("../../server/services/hiding");
describe('World', function () {
    var partyService = lib_1.stubClass(party_1.PartyService);
    var friendsService = lib_1.stubClass(friends_1.FriendsService);
    var hidingService = lib_1.stubClass(hiding_1.HidingService);
    partyService.partyChanged = new rxjs_1.Subject();
    var notifications = lib_1.stubClass(notification_1.NotificationService);
    var liveSettings;
    var getSettings;
    var world;
    var map;
    var client;
    beforeEach(function () {
        lib_1.resetStubMethods(partyService, 'leave');
        lib_1.resetStubMethods(notifications, 'rejectAll');
        liveSettings = {};
        getSettings = sinon_1.stub().returns({});
        client = mocks_1.mockClient();
        world = new world_1.World({ flags: {} }, partyService, friendsService, hidingService, notifications, getSettings, liveSettings, { stats: function () { return {}; } });
        world.maps.push(map = serverMap_1.createServerMap('', 0, 1, 1));
        client.map = world.getMainMap();
    });
    describe('joinClientToWorld()', function () {
        var client;
        beforeEach(function () {
            client = mocks_1.mockClient();
            client.accountId = 'foobar';
            client.map = world.getMainMap();
            client.characterState = {};
        });
        it('sends world state', function () {
            var worldState = sinon_1.stub(client, 'worldState');
            var state = {};
            sinon_1.stub(world, 'getState').returns(state);
            world.joinClientToWorld(client);
            sinon_1.assert.calledWith(worldState, state, true);
        });
        it('sends map info', function () {
            var mapState = sinon_1.stub(client, 'mapState');
            var state = {};
            map.state = state;
            world.joinClientToWorld(client);
            sinon_1.assert.calledWith(mapState, { type: 0, editableArea: undefined, flags: 0, defaultTile: 0, regionsX: 1, regionsY: 1 }, state);
        });
        it('adds client to clients list', function () {
            world.joinClientToWorld(client);
            chai_1.expect(world.clients).contain(client);
        });
        it('initializes client pony ID', function () {
            sinon_1.stub(world, 'getNewEntityId').returns(1234);
            world.joinClientToWorld(client);
            chai_1.expect(client.pony.id).equal(1234);
        });
        it('sends client pony ID', function () {
            sinon_1.stub(world, 'getNewEntityId').returns(1234);
            var myEntity = sinon_1.stub(client, 'myEntity');
            client.characterName = 'charname';
            client.character.info = client.pony.info = 'INFO';
            client.pony.crc = 456;
            world.joinClientToWorld(client);
            sinon_1.assert.calledWith(myEntity, 1234, 'charname', 'INFO', client.characterId, 456);
        });
        it('adds client pony to the world', function () {
            var addEntity = sinon_1.stub(world, 'addEntity');
            world.joinClientToWorld(client);
            sinon_1.assert.calledWith(addEntity, client.pony, client.map);
        });
        it('updates selection for other clients', function () {
            var otherClient = mocks_1.mockClient();
            otherClient.selected = { id: 123, client: { accountId: 'foobar' } };
            var otherClient2 = mocks_1.mockClient();
            var updateSelection = sinon_1.stub(otherClient, 'updateSelection');
            var updateSelection2 = sinon_1.stub(otherClient2, 'updateSelection');
            sinon_1.stub(world, 'getNewEntityId').returns(321);
            world.clients.push(otherClient);
            world.clients.push(otherClient2);
            world.joinClientToWorld(client);
            sinon_1.assert.calledWith(updateSelection, 123, 321);
            sinon_1.assert.notCalled(updateSelection2);
        });
        it('adds update notification to client if updating', function () {
            liveSettings.updating = true;
            world.joinClientToWorld(client);
            sinon_1.assert.calledWith(notifications.addNotification, client, {
                id: 0, name: '', message: 'Server will restart shortly for updates and maintenance', flags: 1 /* Ok */
            });
        });
    });
    describe('initialize()', function () {
        it('initializes all controllers', function () {
            var initialize = sinon_1.stub();
            world.controllers.push({ initialize: initialize, update: function () { } });
            world.initialize(123);
            sinon_1.assert.calledWith(initialize, 0.123);
        });
    });
    describe('update()', function () {
        it('updates entities positions', function () {
            var e = mocks_1.serverEntity(1, 1, 1, 0);
            e.flags |= 1 /* Movable */;
            e.vx = 1;
            e.vy = 1;
            e.timestamp = 1;
            serverRegion_1.addEntityToRegion(map.regions[0], e, map);
            world.update(1000, 2000);
            chai_1.expect(e.x).equal(2);
            chai_1.expect(e.y).equal(2);
        });
        it('does not update entity position if timestamp is in the future', function () {
            var e = mocks_1.serverEntity(1, 1, 1, 0);
            e.vx = 1;
            e.vy = 1;
            serverRegion_1.addEntityToRegion(map.regions[0], e, map);
            world.update(1000, 2000);
            chai_1.expect(e.x).equal(1);
            chai_1.expect(e.y).equal(1);
        });
        // it('updates regions', () => {
        // 	world.update(123, 123);
        // 	...
        // });
        it('updates all controllers', function () {
            var update = sinon_1.stub();
            world.controllers.push({ update: update, initialize: function () { } });
            world.update(123, 123000);
            sinon_1.assert.calledWith(update, 0.123);
        });
        // timeouts expressions
        it('commits region updates', function () {
            var region = serverRegion_1.createServerRegion(0, 0);
            var entity = mocks_1.serverEntity(1);
            var client = mocks_1.mockClient();
            serverRegion_1.pushUpdateEntityToRegion(region, { entity: entity, flags: 1 /* Position */ });
            region.clients.push(client);
            client.regions.push(region);
            map.regions = [region];
            var update = sinon_1.stub(client, 'update');
            world.update(123, 123000);
            chai_1.expect(update);
        });
        it('joins queued clients', function () {
            var client = mocks_1.mockClient();
            world.joinClientToQueue(client);
            var joinClientToWorld = sinon_1.stub(world, 'joinClientToWorld');
            world.update(123, 123000);
            sinon_1.assert.calledWith(joinClientToWorld, client);
        });
    });
    describe('kick()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () {
            clock.tick(99999);
            clock.restore();
        });
        it('does nothing for undefined', function () {
            chai_1.expect(world.kick(undefined)).false;
        });
        it('returns true if kicked', function () {
            var client = mocks_1.mockClient();
            chai_1.expect(world.kick(client)).true;
        });
        it('rejects all notifications', function () {
            var client = mocks_1.mockClient();
            world.kick(client);
            sinon_1.assert.calledWith(notifications.rejectAll, client);
        });
        it('notifies client of leaving', function () {
            var client = mocks_1.mockClient();
            var left = sinon_1.stub(client, 'left');
            world.kick(client);
            sinon_1.assert.calledOnce(left);
        });
        it('sets client leave reason', function () {
            var client = mocks_1.mockClient();
            world.kick(client);
            chai_1.expect(client.leaveReason).equal('kicked');
        });
        it('disconnects client after timeout', function () {
            var client = mocks_1.mockClient({ isConnected: true });
            var disconnect = sinon_1.stub(client, 'disconnect');
            world.kick(client);
            clock.tick(201);
            sinon_1.assert.calledOnce(disconnect);
        });
        it('skips disconnecting if client already disconnected', function () {
            var client = mocks_1.mockClient({ isConnected: false });
            var disconnect = sinon_1.stub(client, 'disconnect');
            world.kick(client);
            clock.tick(201);
            sinon_1.assert.notCalled(disconnect);
        });
    });
    describe('kickAll()', function () {
        it('does nothing for no clients', function () {
            world.kickAll();
        });
        it('kicks all clients', function () {
            var a = mocks_1.mockClient();
            var b = mocks_1.mockClient();
            world.clients.push(a);
            world.clients.push(b);
            var kick = sinon_1.stub(world, 'kick');
            world.kickAll();
            sinon_1.assert.calledWith(kick, a);
            sinon_1.assert.calledWith(kick, b);
        });
        it('works while removing clients', function () {
            var a = mocks_1.mockClient();
            var b = mocks_1.mockClient();
            world.clients.push(a);
            world.clients.push(b);
            var aLeft = sinon_1.stub(a, 'left');
            var bLeft = sinon_1.stub(b, 'left');
            world.kickAll();
            sinon_1.assert.calledOnce(aLeft);
            sinon_1.assert.calledOnce(bLeft);
        });
    });
    describe('kickByAccount()', function () {
        it('does nothing if not found', function () {
            world.kickByAccount('foo');
        });
        it('kick client by account', function () {
            var client = mocks_1.mockClient();
            world.clients.push(client);
            world.clientsByAccount.set(client.accountId, client);
            var kick = sinon_1.stub(world, 'kick');
            world.kickByAccount(client.accountId);
            sinon_1.assert.calledWith(kick, client);
        });
    });
    describe('kickByCharacter()', function () {
        it('does nothing if not found', function () {
            world.kickByCharacter('foo');
        });
        it('kick client by account', function () {
            var client = mocks_1.mockClient();
            world.clients.push(client);
            var kick = sinon_1.stub(world, 'kick');
            world.kickByCharacter(client.characterId);
            sinon_1.assert.calledWith(kick, client);
        });
    });
});
//# sourceMappingURL=world.spec.js.map