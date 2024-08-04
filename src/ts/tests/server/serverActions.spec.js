"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var lodash_1 = require("lodash");
var ag_sockets_1 = require("ag-sockets");
var utf8_1 = require("ag-sockets/dist/utf8");
var serverActions_1 = require("../../server/serverActions");
var world_1 = require("../../server/world");
var serverMap_1 = require("../../server/serverMap");
var party_1 = require("../../server/services/party");
var notification_1 = require("../../server/services/notification");
var hiding_1 = require("../../server/services/hiding");
var mocks_1 = require("../mocks");
var playerUtils_1 = require("../../server/playerUtils");
var counter_1 = require("../../server/services/counter");
var clientUtils_1 = require("../../client/clientUtils");
var expressionEncoder_1 = require("../../common/encoders/expressionEncoder");
var supporterInvites_1 = require("../../server/services/supporterInvites");
var camera_1 = require("../../common/camera");
var friends_1 = require("../../server/services/friends");
var playerUtils = require("../../server/playerUtils");
describe('ServerActions', function () {
    var accountService = lib_1.stubFromInstance({
        update: function () { },
        updateAccount: function () { },
        updateSettings: function () { },
        updateCharacterState: function () { }
    });
    var notifications = lib_1.stubClass(notification_1.NotificationService);
    var partyService = lib_1.stubClass(party_1.PartyService);
    var hiding = lib_1.stubClass(hiding_1.HidingService);
    var friends = lib_1.stubClass(friends_1.FriendsService);
    var states = lib_1.stubClass(counter_1.CounterService);
    var teleports = lib_1.stubClass(counter_1.CounterService);
    var supporterInvites = lib_1.stubClass(supporterInvites_1.SupporterInvitesService);
    var client;
    var world;
    var serverActions;
    var settings;
    var server;
    var ignorePlayer;
    var findClientByEntityId;
    var say;
    var move;
    var execAction;
    beforeEach(function () {
        lib_1.resetStubMethods(accountService, 'update', 'updateSettings');
        lib_1.resetStubMethods(notifications, 'acceptNotification', 'rejectNotification');
        lib_1.resetStubMethods(partyService, 'invite', 'remove', 'promoteLeader');
        lib_1.resetStubMethods(hiding, 'requestUnhideAll', 'requestHide');
        lib_1.resetStubMethods(friends, 'add', 'remove', 'removeByAccountId');
        lib_1.resetStubMethods(teleports);
        execAction = sinon_1.stub(playerUtils, 'execAction');
        client = mocks_1.mockClient();
        world = new world_1.World({ flags: { friends: true } }, { partyChanged: { subscribe: function () { } } }, {}, {}, {}, function () { return ({}); }, {}, {});
        var map = serverMap_1.createServerMap('', 0, 1, 1);
        client.map = map;
        world.maps.push(map);
        settings = {};
        server = { flags: {} };
        ignorePlayer = sinon_1.spy();
        findClientByEntityId = sinon_1.stub();
        say = sinon_1.spy();
        move = sinon_1.spy();
        serverActions = new serverActions_1.ServerActions(client, world, notifications, partyService, supporterInvites, function () { return settings; }, server, say, move, hiding, states, accountService, ignorePlayer, findClientByEntityId, friends);
    });
    afterEach(function () {
        execAction.restore();
    });
    describe('connected()', function () {
        // TODO: ...
    });
    describe('disconnected()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () {
            clock.restore();
        });
        it('sets client offline flag to true', function () {
            serverActions.disconnected();
            chai_1.expect(client.offline).true;
        });
        it('leaves client from world', function () {
            var leaveClient = sinon_1.stub(world, 'leaveClient');
            serverActions.disconnected();
            sinon_1.assert.calledWith(leaveClient, client);
        });
        it('notifies party service', function () {
            serverActions.disconnected();
            sinon_1.assert.calledWith(partyService.clientDisconnected, client);
        });
        it('updates last visit', function () {
            clock.setSystemTime(1234);
            serverActions.disconnected();
            sinon_1.assert.calledWith(accountService.updateAccount, client.accountId, { lastVisit: new Date(1234), state: undefined });
        });
        it('updates character state', function () {
            client.pony.x = 123;
            client.pony.y = 321;
            serverActions.disconnected();
            sinon_1.assert.calledWith(accountService.updateCharacterState, client.characterId, playerUtils_1.createCharacterState(client.pony, client.map));
        });
        it('adds state to counter service', function () {
            client.pony.x = 123;
            client.pony.y = 321;
            serverActions.disconnected();
            sinon_1.assert.calledWithMatch(states.add, client.characterId, { x: 123, y: 321 });
        });
        it('logs client leaving', function () {
            var systemLog = sinon_1.stub(client.reporter, 'systemLog');
            server.id = 'server_id';
            clock.setSystemTime(12 * 1000);
            client.connectedTime = 0;
            serverActions.disconnected();
            sinon_1.assert.calledWith(systemLog, 'left [server_id] (disconnected) (12s)');
        });
    });
    describe('say()', function () {
        it('calls chatSay', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                serverActions.say(0, 'hello', 0 /* Say */);
                sinon_1.assert.calledWith(say, client, 'hello', 0 /* Say */, undefined, settings);
                return [2 /*return*/];
            });
        }); });
        it('throws if message is not a string', function () {
            chai_1.expect(function () { return serverActions.say(0, {}, 0 /* Say */); }).throw('Not a string (text)');
            chai_1.expect(function () { return serverActions.say(0, 123, 0 /* Say */); }).throw('Not a string (text)');
            chai_1.expect(function () { return serverActions.say(0, null, 0 /* Say */); }).throw('Not a string (text)');
        });
        it('throws if type is not a number', function () {
            chai_1.expect(function () { return serverActions.say(0, 'test', {}); }).throw('Not a number (chatType)');
            chai_1.expect(function () { return serverActions.say(0, 'test', '1'); }).throw('Not a number (chatType)');
            chai_1.expect(function () { return serverActions.say(0, 'test', null); }).throw('Not a number (chatType)');
        });
    });
    describe('select()', function () {
        it('sets selected entity', function () {
            var entity = mocks_1.serverEntity(1);
            sinon_1.stub(world, 'getEntityById').withArgs(123).returns(entity);
            serverActions.select(123, 1 /* FetchEx */);
            chai_1.expect(client.selected).equal(entity);
        });
        it('sets selected entity from other sources', function () {
            var entity = { id: 123 };
            findClientByEntityId.withArgs(client, 123).returns({ pony: entity });
            sinon_1.stub(world, 'getEntityById').returns(undefined);
            serverActions.select(123, 1 /* FetchEx */);
            chai_1.expect(client.selected).equal(entity);
        });
        it('sends extra data for selected entity', function () {
            var entity = mocks_1.serverEntity(1, 0, 0, 0, { client: {}, extraOptions: { foo: 5 } });
            sinon_1.stub(world, 'getEntityById').withArgs(123).returns(entity);
            serverActions.select(123, 1 /* FetchEx */);
            chai_1.expect(Array.from(ag_sockets_1.getWriterBuffer(client.updateQueue)))
                .eql([2, 0, 32, 0, 0, 0, 1, 129, 3, 102, 111, 111, 165]);
        });
        it('does not send extra data for selected entity if fetch flag is false', function () {
            var entity = mocks_1.serverEntity(1, 0, 0, 0, { client: {}, extraOptions: { foo: 5 } });
            sinon_1.stub(world, 'getEntityById').withArgs(123).returns(entity);
            serverActions.select(123, 0 /* None */);
            chai_1.expect(Array.from(ag_sockets_1.getWriterBuffer(client.updateQueue))).eql([]);
        });
        it('sends extra mod data for selected entity', function () {
            var entity = mocks_1.serverEntity(1, 0, 0, 0, {
                client: {
                    accountId: '12345678901234567890aa',
                    account: {
                        name: 'foobar',
                        shadow: 0,
                        mute: -1,
                        note: 'bar'
                    }
                }
            });
            sinon_1.stub(world, 'getEntityById').withArgs(123).returns(entity);
            client.isMod = true;
            serverActions.select(123, 1 /* FetchEx */);
            chai_1.expect(Array.from(ag_sockets_1.getWriterBuffer(client.updateQueue))).eql([
                2, 0, 32, 0, 0, 0, 1, 129, 7, 109, 111, 100, 73, 110, 102, 111, 134, 6, 115, 104, 97, 100, 111,
                119, 0, 4, 109, 117, 116, 101, 69, 112, 101, 114, 109, 97, 4, 110, 111, 116, 101, 67, 98, 97,
                114, 8, 99, 111, 117, 110, 116, 101, 114, 115, 128, 7, 99, 111, 117, 110, 116, 114, 121, 0, 7,
                97, 99, 99, 111, 117, 110, 116, 76, 102, 111, 111, 98, 97, 114, 32, 91, 48, 97, 97, 93
            ]);
        });
    });
    describe('interact()', function () {
        it('calls interaction with client and entity', function () {
            var entity = mocks_1.serverEntity(1);
            var interact = sinon_1.stub();
            entity.interact = interact;
            sinon_1.stub(world, 'getEntityById').withArgs(123).returns(entity);
            serverActions.interact(123);
            sinon_1.assert.calledOnce(interact);
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            serverActions.interact(123);
            chai_1.expect(client.lastPacket).not.equal(0);
        });
        it('throws on not a number', function () {
            chai_1.expect(function () { return serverActions.interact('foo'); }).throw('Not a number (entityId)');
        });
    });
    describe('use()', function () {
        // TODO: ...
    });
    describe('action()', function () {
        it('calls unhideAll on hiding service', function () {
            serverActions.action(9 /* UnhideAllHiddenPlayers */);
            sinon_1.assert.calledWith(hiding.requestUnhideAll, client);
        });
        it('does nothing for KeepAlive action', function () {
            serverActions.action(21 /* KeepAlive */);
            sinon_1.assert.notCalled(execAction);
        });
        it('executes player action', function () {
            serverActions.action(2 /* TurnHead */);
            sinon_1.assert.calledWith(execAction, client, 2 /* TurnHead */);
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            serverActions.action(1 /* Boop */);
            chai_1.expect(client.lastPacket).not.equal(0);
        });
        it('throws on not a number', function () {
            chai_1.expect(function () { return serverActions.action('foo'); }).throw('Not a number (action)');
        });
    });
    describe('actionParam()', function () {
        it('on RemoveFriend: calls friends.remove()', function () {
            var friend = mocks_1.mockClient();
            world.clientsByAccount.set('some_account_id', friend);
            serverActions.actionParam(22 /* RemoveFriend */, 'some_account_id');
            sinon_1.assert.calledWith(friends.remove, client, friend);
        });
        it('on RemoveFriend: calls friends.removeByAccountId() if cannot find client', function () {
            serverActions.actionParam(22 /* RemoveFriend */, 'some_account_id');
            sinon_1.assert.calledWith(friends.removeByAccountId, client, 'some_account_id');
        });
    });
    describe('actionParam2()', function () {
        it('on Info: update client flags', function () {
            serverActions.actionParam2(20 /* Info */, 2 /* SupportsWASM */ | 4 /* SupportsLetAndConst */);
            chai_1.expect(client.supportsWasm).true;
            chai_1.expect(client.supportsLetAndConst).true;
        });
        it('throws on invalid action', function () {
            chai_1.expect(function () { return serverActions.actionParam2(99, undefined); }).throws('Invalid Action (99)');
        });
    });
    describe('expression()', function () {
        it('sets expression for player character', function () {
            var expression = clientUtils_1.createExpression(19 /* Angry */, 6 /* Closed */, 4 /* Blep */);
            serverActions.expression(expressionEncoder_1.encodeExpression(expression));
            chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(expression));
            chai_1.expect(client.pony.exprPermanent).eql(expression);
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            serverActions.expression(0);
            chai_1.expect(client.lastPacket).not.equal(0);
        });
        it('throws on not a number', function () {
            chai_1.expect(function () { return serverActions.expression('foo'); }).throw('Not a number (expression)');
        });
    });
    describe('playerAction()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () { return clock.restore(); });
        it('ignores player', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').withArgs(123).returns(target);
            serverActions.playerAction(123, 1 /* Ignore */, undefined);
            sinon_1.assert.calledWith(ignorePlayer, client, target, true);
        });
        it('unignores player', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').withArgs(123).returns(target);
            serverActions.playerAction(123, 2 /* Unignore */, undefined);
            sinon_1.assert.calledWith(ignorePlayer, client, target, false);
        });
        it('invites player to party', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').withArgs(123).returns(target);
            serverActions.playerAction(123, 3 /* InviteToParty */, undefined);
            sinon_1.assert.calledWith(partyService.invite, client, target);
        });
        it('removes player from party', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').withArgs(123).returns(target);
            serverActions.playerAction(123, 4 /* RemoveFromParty */, undefined);
            sinon_1.assert.calledWith(partyService.remove, client, target);
        });
        it('promotes player to party leader', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').withArgs(123).returns(target);
            serverActions.playerAction(123, 5 /* PromotePartyLeader */, undefined);
            sinon_1.assert.calledWith(partyService.promoteLeader, client, target);
        });
        it('hides player', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').withArgs(123).returns(target);
            serverActions.playerAction(123, 6 /* HidePlayer */, 12345678);
            sinon_1.assert.calledWith(hiding.requestHide, client, target, 12345678);
        });
        it('invites player to supporters', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').withArgs(123).returns(target);
            serverActions.playerAction(123, 7 /* InviteToSupporterServers */, undefined);
            sinon_1.assert.calledWith(supporterInvites.requestInvite, client, target);
        });
        it('updates last action', function () {
            sinon_1.stub(world, 'getClientByEntityId').returns({});
            client.lastPacket = 0;
            clock.setSystemTime(123);
            serverActions.playerAction(1, 3 /* InviteToParty */, undefined);
            chai_1.expect(client.lastPacket).equal(123);
        });
        it('logs warning if cannot find target player', function () {
            var warnLog = sinon_1.stub(client.reporter, 'warnLog');
            serverActions.playerAction(1, 1 /* Ignore */, undefined);
            sinon_1.assert.calledOnce(warnLog);
        });
        it('AddFriend: calls friends.add()', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').returns(target);
            serverActions.playerAction(1, 8 /* AddFriend */, undefined);
            sinon_1.assert.calledWith(friends.add, client, target);
        });
        it('RemoveFriend: calls friends.remove()', function () {
            var target = mocks_1.mockClient();
            sinon_1.stub(world, 'getClientByEntityId').returns(target);
            serverActions.playerAction(1, 9 /* RemoveFriend */, undefined);
            sinon_1.assert.calledWith(friends.remove, client, target);
        });
        it('throws on entityId not a number', function () {
            chai_1.expect(function () { return serverActions.playerAction('foo', 1 /* Ignore */, undefined); })
                .throw('Not a number (entityId)');
        });
        it('throws on action not a number', function () {
            chai_1.expect(function () { return serverActions.playerAction(1, 'foo', undefined); })
                .throw('Not a number (action)');
        });
        it('throws on invalid action', function () {
            sinon_1.stub(world, 'getClientByEntityId').returns({});
            chai_1.expect(function () { return serverActions.playerAction(1, 999, undefined); })
                .throw('Invalid player action (undefined) [999]');
        });
    });
    describe('leaveParty()', function () {
        it('removes client from party', function () {
            var leader = {};
            client.party = { id: '', clients: [leader, client], leader: leader, pending: [] };
            serverActions.leaveParty();
            sinon_1.assert.calledWith(partyService.remove, leader, client);
        });
        it('does nothing if not in a party', function () {
            serverActions.leaveParty();
            sinon_1.assert.notCalled(partyService.remove);
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            serverActions.leaveParty();
            chai_1.expect(client.lastPacket).not.equal(0);
        });
    });
    describe('otherAction()', function () {
        var target;
        var clock;
        var getClientByEntityId;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
            clock.setSystemTime(123456);
            target = mocks_1.mockClient();
            getClientByEntityId = sinon_1.stub(world, 'getClientByEntityId').withArgs(222).returns(target);
            client.account.roles = ['admin'];
            client.account.name = 'Acc';
            client.character.name = 'Char';
            client.isMod = true;
        });
        afterEach(function () {
            clock.restore();
        });
        it('reports target client', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        system = sinon_1.stub(target.reporter, 'system');
                        return [4 /*yield*/, serverActions.otherAction(222, 1 /* Report */, 0)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(system, 'Reported by Acc');
                        return [2 /*return*/];
                }
            });
        }); });
        it('mutes target client', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        system = sinon_1.stub(target.reporter, 'system');
                        return [4 /*yield*/, serverActions.otherAction(222, 2 /* Mute */, -1)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(system, 'Muted by Acc');
                        sinon_1.assert.calledWith(accountService.update, target.accountId, { mute: -1 });
                        return [2 /*return*/];
                }
            });
        }); });
        it('mutes target client for given amount of time', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        system = sinon_1.stub(target.reporter, 'system');
                        return [4 /*yield*/, serverActions.otherAction(222, 2 /* Mute */, 123)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(system, 'Muted for (a few seconds) by Acc');
                        sinon_1.assert.calledWith(accountService.update, target.accountId, { mute: Date.now() + 123 });
                        return [2 /*return*/];
                }
            });
        }); });
        it('unmutes target client', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        system = sinon_1.stub(target.reporter, 'system');
                        return [4 /*yield*/, serverActions.otherAction(222, 2 /* Mute */, 0)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(system, 'Unmuted by Acc');
                        sinon_1.assert.calledWith(accountService.update, target.accountId, { mute: 0 });
                        return [2 /*return*/];
                }
            });
        }); });
        it('shadows target client', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        system = sinon_1.stub(target.reporter, 'system');
                        return [4 /*yield*/, serverActions.otherAction(222, 3 /* Shadow */, -1)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(system, 'Shadowed by Acc');
                        sinon_1.assert.calledWith(accountService.update, target.accountId, { shadow: -1 });
                        return [2 /*return*/];
                }
            });
        }); });
        it('shadows target client for given amount of time', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        system = sinon_1.stub(target.reporter, 'system');
                        return [4 /*yield*/, serverActions.otherAction(222, 3 /* Shadow */, 123)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(system, 'Shadowed for (a few seconds) by Acc');
                        sinon_1.assert.calledWith(accountService.update, target.accountId, { shadow: Date.now() + 123 });
                        return [2 /*return*/];
                }
            });
        }); });
        it('unshadows target client', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        system = sinon_1.stub(target.reporter, 'system');
                        return [4 /*yield*/, serverActions.otherAction(222, 3 /* Shadow */, 0)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(system, 'Unshadowed by Acc');
                        sinon_1.assert.calledWith(accountService.update, target.accountId, { shadow: 0 });
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates last action', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client.lastPacket = 0;
                        clock.tick(1000);
                        return [4 /*yield*/, serverActions.otherAction(222, 1, 1)];
                    case 1:
                        _a.sent();
                        chai_1.expect(client.lastPacket).not.equal(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on missing client', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(serverActions.otherAction(111, 1 /* Report */, 0)).rejectedWith('Client does not exist (Report)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on non admin user', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client.account.roles = [];
                        client.isMod = false;
                        return [4 /*yield*/, chai_1.expect(serverActions.otherAction(111, 1 /* Report */, 0)).rejectedWith('Action not allowed (Report)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('disconnectes on non admin user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var disconnect, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        client.account.roles = [];
                        client.isMod = false;
                        disconnect = sinon_1.stub(client, 'disconnect');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, serverActions.otherAction(111, 1 /* Report */, 0)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        sinon_1.assert.calledWith(disconnect, true, true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on action on self', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        getClientByEntityId.withArgs(1).returns(client);
                        return [4 /*yield*/, chai_1.expect(serverActions.otherAction(1, 1 /* Report */, 0)).rejectedWith('Cannot perform action on self (Report)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on invalid action', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(serverActions.otherAction(222, 123, 0)).rejectedWith('Invalid mod action (123)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on entityId not a number', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(serverActions.otherAction('foo', 1, 1)).rejectedWith('Not a number (entityId)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on action not a number', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(serverActions.otherAction(1, 'foo', 1)).rejectedWith('Not a number (action)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on param not a number', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(serverActions.otherAction(1, 1, 'foo')).rejectedWith('Not a number (param)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('setNote()', function () {
        it('updates last action', function () { return __awaiter(void 0, void 0, void 0, function () {
            var other;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        other = mocks_1.mockClient();
                        other.accountId = 'dlfhigdh';
                        client.lastPacket = 0;
                        client.account.roles = ['mod'];
                        client.isMod = true;
                        sinon_1.stub(world, 'getClientByEntityId').withArgs(1).returns(other);
                        return [4 /*yield*/, serverActions.setNote(1, 'foo')];
                    case 1:
                        _a.sent();
                        chai_1.expect(client.lastPacket).not.equal(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates account note', function () { return __awaiter(void 0, void 0, void 0, function () {
            var other;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        other = mocks_1.mockClient();
                        other.accountId = 'gooboo';
                        client.account.roles = ['mod'];
                        client.isMod = true;
                        sinon_1.stub(world, 'getClientByEntityId').withArgs(1).returns(other);
                        return [4 /*yield*/, serverActions.setNote(1, 'foo')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(accountService.update, 'gooboo', { note: 'foo' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws if user is not a mod', function () { return __awaiter(void 0, void 0, void 0, function () {
            var other;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        other = mocks_1.mockClient();
                        other.accountId = 'gooboo';
                        sinon_1.stub(world, 'getClientByEntityId').withArgs(1).returns(other);
                        return [4 /*yield*/, chai_1.expect(serverActions.setNote(1, 'foo')).rejectedWith('Action not allowed (setNote)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws on not a number', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(serverActions.setNote('foo', 'foo')).rejectedWith('Not a number (entityId)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws on not a string', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(serverActions.setNote(1, 5)).rejectedWith('Not a string (text)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('saveSettings()', function () {
        it('updates last action', function () {
            accountService.updateSettings.resolves();
            client.lastPacket = 0;
            serverActions.saveSettings({});
            chai_1.expect(client.lastPacket).not.equal(0);
        });
        it('updates account settings', function () {
            accountService.updateSettings.resolves();
            var settings = {};
            serverActions.saveSettings(settings);
            sinon_1.assert.calledWith(accountService.updateSettings, client.account, settings);
        });
    });
    describe('acceptNotification()', function () {
        it('accepts notification', function () {
            serverActions.acceptNotification(123);
            sinon_1.assert.calledWith(notifications.acceptNotification, client, 123);
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            serverActions.acceptNotification(123);
            chai_1.expect(client.lastPacket).not.equal(0);
        });
        it('throws on not a number', function () {
            chai_1.expect(function () { return serverActions.acceptNotification('foo'); }).throw('Not a number (id)');
        });
    });
    describe('rejectNotification()', function () {
        it('rejects notification', function () {
            serverActions.rejectNotification(123);
            sinon_1.assert.calledWith(notifications.rejectNotification, client, 123);
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            serverActions.rejectNotification(123);
            chai_1.expect(client.lastPacket).not.equal(0);
        });
        it('throws on not a number', function () {
            chai_1.expect(function () { return serverActions.rejectNotification('foo'); }).throw('Not a number (id)');
        });
    });
    describe('getPonies()', function () {
        it('sends ponies to client', function () {
            var updatePonies = sinon_1.stub(client, 'updatePonies');
            var name1 = utf8_1.encodeString('foo');
            var name2 = utf8_1.encodeString('bar');
            var name3 = utf8_1.encodeString('xxx');
            var info1 = new Uint8Array([1, 2, 3]);
            var info2 = new Uint8Array([4, 5, 6]);
            var info3 = new Uint8Array([7, 8, 9]);
            client.party = {
                clients: [
                    { pony: { id: 1, options: {}, encodedName: name1, encryptedInfoSafe: info1 } },
                    { pony: { id: 2, options: {}, encodedName: name2, encryptedInfoSafe: info2 } },
                    { pony: { id: 3, options: {}, encodedName: name3, encryptedInfoSafe: info3 } },
                ],
            };
            serverActions.getPonies([1, 2]);
            sinon_1.assert.calledWithMatch(updatePonies, [
                [1, {}, name1, info1, 0, false],
                [2, {}, name2, info2, 0, false],
            ]);
        });
        it('does nothing if not in party', function () {
            var updatePonies = sinon_1.stub(client, 'updatePonies');
            serverActions.getPonies([1, 2]);
            sinon_1.assert.notCalled(updatePonies);
        });
        it('does nothing if ids is null or empty', function () {
            var updatePonies = sinon_1.stub(client, 'updatePonies');
            serverActions.getPonies(null);
            serverActions.getPonies([]);
            sinon_1.assert.notCalled(updatePonies);
        });
        it('does nothing if requesting too many ponies', function () {
            var updatePonies = sinon_1.stub(client, 'updatePonies');
            serverActions.getPonies(lodash_1.range(20));
            sinon_1.assert.notCalled(updatePonies);
        });
    });
    describe('loaded()', function () {
        it('sets ignoreUpdates flag to false', function () {
            client.loading = true;
            serverActions.loaded();
            chai_1.expect(client.loading).false;
        });
    });
    describe('fixedPosition()', function () {
        it('sets fixing position flag to false', function () {
            client.fixingPosition = true;
            serverActions.fixedPosition();
            chai_1.expect(client.fixingPosition).false;
        });
    });
    describe('updateCamera()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () {
            clock.restore();
        });
        it('sets up camera', function () {
            serverActions.updateCamera(1, 2, 3, 4);
            chai_1.expect(client.camera).eql(__assign(__assign({}, camera_1.createCamera()), { x: 1, y: 2, w: 64, h: 64 }));
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            clock.setSystemTime(123);
            serverActions.updateCamera(0, 0, 0, 0);
            chai_1.expect(client.lastPacket).equal(123);
        });
        it('throws on "a" not a number', function () {
            chai_1.expect(function () { return serverActions.updateCamera('foo', 0, 0, 0); }).throw('Not a number (x)');
        });
        it('throws on "b" not a number', function () {
            chai_1.expect(function () { return serverActions.updateCamera(0, 'foo', 0, 0); }).throw('Not a number (y)');
        });
        it('throws on "c" not a number', function () {
            chai_1.expect(function () { return serverActions.updateCamera(0, 0, 'foo', 0); }).throw('Not a number (width)');
        });
        it('throws on "d" not a number', function () {
            chai_1.expect(function () { return serverActions.updateCamera(0, 0, 0, 'foo'); }).throw('Not a number (height)');
        });
    });
    describe('update()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () {
            clock.restore();
        });
        it('calls move', function () {
            serverActions.move(1, 2, 3, 4, 5);
            sinon_1.assert.calledWith(move, client, 0, 1, 2, 3, 4, 5);
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            clock.setSystemTime(123);
            serverActions.move(0, 0, 0, 0, 0);
            chai_1.expect(client.lastPacket).equal(123);
        });
        it('throws on "a" not a number', function () {
            chai_1.expect(function () { return serverActions.move('foo', 0, 0, 0, 0); }).throw('Not a number (a)');
        });
        it('throws on "b" not a number', function () {
            chai_1.expect(function () { return serverActions.move(0, 'foo', 0, 0, 0); }).throw('Not a number (b)');
        });
        it('throws on "c" not a number', function () {
            chai_1.expect(function () { return serverActions.move(0, 0, 'foo', 0, 0); }).throw('Not a number (c)');
        });
        it('throws on "d" not a number', function () {
            chai_1.expect(function () { return serverActions.move(0, 0, 0, 'foo', 0); }).throw('Not a number (d)');
        });
        it('throws on "e" not a number', function () {
            chai_1.expect(function () { return serverActions.move(0, 0, 0, 0, 'foo'); }).throw('Not a number (e)');
        });
    });
    describe('changeTile()', function () {
        it('sets tile', function () {
            serverMap_1.setTile(client.map, 1, 2, 1 /* Dirt */);
            var setTileStub = sinon_1.stub(world, 'setTile');
            serverActions.changeTile(1, 2, 1 /* Dirt */);
            sinon_1.assert.calledWith(setTileStub, client.map, 1, 2, 1 /* Dirt */);
        });
        it.skip('sets tile for mod', function () {
            var setTile = sinon_1.stub(world, 'setTile');
            client.isMod = true;
            serverActions.changeTile(1, 2, 4 /* Wood */);
            sinon_1.assert.calledWith(setTile, client.map, 1, 2, 4 /* Wood */);
        });
        it('does not set tile if shadowed', function () {
            serverMap_1.setTile(client.map, 1, 2, 1 /* Dirt */);
            var setTileStub = sinon_1.stub(world, 'setTile');
            client.shadowed = true;
            serverActions.changeTile(1, 2, 1 /* Dirt */);
            sinon_1.assert.notCalled(setTileStub);
        });
        it('sends update to client if shadowed', function () {
            serverMap_1.setTile(client.map, 1, 2, 1 /* Dirt */);
            client.shadowed = true;
            serverActions.changeTile(1, 2, 1 /* Dirt */);
            chai_1.expect(ag_sockets_1.getWriterBuffer(client.updateQueue)).eql(new Uint8Array([4, 0, 1, 0, 2, 1]));
        });
        it('does nothing if invalid tile type', function () {
            serverMap_1.setTile(client.map, 1, 2, 1 /* Dirt */);
            var setTileStub = sinon_1.stub(world, 'setTile');
            serverActions.changeTile(1, 2, 999);
            sinon_1.assert.notCalled(setTileStub);
            chai_1.expect(ag_sockets_1.getWriterBuffer(client.updateQueue)).eql(new Uint8Array([]));
        });
        it.skip('toggles wall', function () {
            serverMap_1.setTile(client.map, 1, 2, 1 /* Dirt */);
            client.account.roles = ['mod'];
            client.isMod = true;
            var toggleWall = sinon_1.stub(world, 'toggleWall');
            serverActions.changeTile(1, 2, 100 /* WallH */);
            serverActions.changeTile(3, 4, 101 /* WallV */);
            sinon_1.assert.calledWith(toggleWall, client.map, 1, 2, 100 /* WallH */);
            sinon_1.assert.calledWith(toggleWall, client.map, 3, 4, 101 /* WallV */);
        });
        it('does not toggle wall for non moderators', function () {
            serverMap_1.setTile(client.map, 1, 2, 1 /* Dirt */);
            var toggleWall = sinon_1.stub(world, 'toggleWall');
            serverActions.changeTile(1, 2, 100 /* WallH */);
            sinon_1.assert.notCalled(toggleWall);
        });
        it('updates last action', function () {
            client.lastPacket = 0;
            serverActions.changeTile(0, 0, 1 /* Dirt */);
            chai_1.expect(client.lastPacket).not.equal(0);
        });
        it('throws on "x" not a number', function () {
            chai_1.expect(function () { return serverActions.changeTile('foo', 0, 1 /* Dirt */); }).throw('Not a number (x)');
        });
        it('throws on "y" not a number', function () {
            chai_1.expect(function () { return serverActions.changeTile(0, 'foo', 1 /* Dirt */); }).throw('Not a number (y)');
        });
        it('throws on "type" not a number', function () {
            chai_1.expect(function () { return serverActions.changeTile(0, 0, 'foo'); }).throw('Not a number (type)');
        });
    });
    describe('leave()', function () {
        it('notifies client', function () {
            var left = sinon_1.stub(client, 'left');
            serverActions.leave();
            sinon_1.assert.calledOnce(left);
        });
    });
    describe('editorAction()', function () {
        it('places', function () {
            client.isMod = true;
            server.flags.editor = true;
            serverActions.editorAction({ type: 'place', x: 0, y: 0, entity: 'foo' });
        });
        it('undos', function () {
            client.isMod = true;
            server.flags.editor = true;
            serverActions.editorAction({ type: 'undo' });
        });
        it('clears', function () {
            client.isMod = true;
            server.flags.editor = true;
            serverActions.editorAction({ type: 'clear' });
        });
        it('does nothing for non-mod client', function () {
            client.isMod = false;
            server.flags.editor = true;
            serverActions.editorAction({ type: 'undo' });
        });
    });
});
//# sourceMappingURL=serverActions.spec.js.map