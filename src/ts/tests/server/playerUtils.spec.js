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
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var playerUtils_1 = require("../../server/playerUtils");
var mocks_1 = require("../mocks");
var lib_1 = require("../lib");
var expressionUtils_1 = require("../../common/expressionUtils");
var expressionEncoder_1 = require("../../common/encoders/expressionEncoder");
var constants_1 = require("../../common/constants");
var serverRegion_1 = require("../../server/serverRegion");
var rect_1 = require("../../common/rect");
var counter_1 = require("../../server/services/counter");
var camera_1 = require("../../common/camera");
var worldMap_1 = require("../../common/worldMap");
var serverMap_1 = require("../../server/serverMap");
var ag_sockets_1 = require("ag-sockets");
var entityUtils_1 = require("../../server/entityUtils");
var collision_spec_1 = require("../common/collision.spec");
describe('playerUtils', function () {
    var def = { x: 0, y: 0, vx: 0, vy: 0, action: 0, playerState: 0, options: undefined };
    var client;
    beforeEach(function () {
        client = mocks_1.mockClient();
    });
    describe('isIgnored()', function () {
        it('returns true if target account id is on ignored list', function () {
            chai_1.expect(playerUtils_1.isIgnored({ accountId: 'foo' }, { ignores: new Set(['foo']) })).true;
        });
        it('returns false if target account id is not on ignored list', function () {
            chai_1.expect(playerUtils_1.isIgnored({ accountId: 'foo' }, { ignores: new Set(['bar']) })).false;
        });
        it('returns false if account ignore list is empty', function () {
            chai_1.expect(playerUtils_1.isIgnored({ accountId: 'foo' }, { ignores: new Set() })).false;
        });
        it('returns false if account does not have ignore list', function () {
            chai_1.expect(playerUtils_1.isIgnored({ accountId: 'foo' }, { ignores: new Set() })).false;
        });
    });
    describe('createClientAndPony()', function () {
        it('sets up client and pony', function () {
            var account = { _id: mocks_1.genObjectId() };
            var character = { _id: mocks_1.genObjectId(), name: 'Foo' };
            var client = {
                tokenData: { account: account, character: character },
            };
            var map = { spawnArea: rect_1.rect(0, 0, 0, 0) };
            var world = {
                getMainMap: function () { return map; },
                getMap: function () { return map; },
                isColliding: sinon_1.stub(),
            };
            playerUtils_1.createClientAndPony(client, [], [], { name: 'test' }, world, new counter_1.CounterService(1));
            // ...
        });
    });
    describe('createClient()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
            clock.setSystemTime(123);
        });
        afterEach(function () {
            clock.restore();
        });
        it('initializes client fields', function () {
            var originalRequest = { headers: { 'user-agent': 'test' } };
            var client = { originalRequest: originalRequest };
            var account = { _id: mocks_1.genObjectId(), _account: 1, name: 'Foo' };
            var character = { _id: mocks_1.genObjectId(), _character: 1, name: 'Im :apple:' };
            var pony = { _pony: 1, x: 10, y: 20 };
            var reporter = { _reporter: 1 };
            var origin = { ip: '', country: 'XY' };
            var map = {};
            var result = playerUtils_1.createClient(client, account, [], [], character, pony, map, reporter, origin);
            chai_1.expect(result).equal(client);
            chai_1.expect(result).eql({
                accountId: account._id.toString(),
                accountName: 'Foo',
                characterId: character._id.toString(),
                characterName: 'Im 🍎',
                ignores: new Set(),
                hides: new Set(),
                permaHides: new Set(),
                friends: new Set(),
                friendsCRC: undefined,
                accountSettings: {},
                originalRequest: originalRequest,
                supporterLevel: 0,
                isMod: false,
                userAgent: 'test',
                reporter: reporter,
                account: account,
                character: character,
                ip: '',
                isMobile: false,
                map: map,
                isSwitchingMap: false,
                pony: pony,
                notifications: [],
                updateQueue: ag_sockets_1.createBinaryWriter(128),
                regionUpdates: [],
                saysQueue: [],
                unsubscribes: [],
                subscribes: [],
                regions: [],
                camera: Object.assign(camera_1.createCamera(), { w: 800, h: 600 }),
                lastSays: [],
                lastSwap: 0,
                shadowed: false,
                country: 'XY',
                safeX: 10,
                safeY: 20,
                lastPacket: 123,
                lastBoopOrKissAction: 0,
                lastExpressionAction: 0,
                lastX: 10,
                lastY: 20,
                lastTime: 0,
                lastVX: 0,
                lastVY: 0,
                lastCameraX: 0,
                lastCameraY: 0,
                lastCameraW: 0,
                lastCameraH: 0,
                lastMapSwitch: 0,
                sitCount: 0,
                lastSitX: 0,
                lastSitY: 0,
                lastSitTime: 0,
                lastMapLoadOrSave: 0,
                positions: [],
            });
        });
        it('sets shadowed field if is shadowed', function () {
            var originalRequest = { headers: { 'user-agent': 'test' } };
            var client = { originalRequest: originalRequest };
            var account = { _id: mocks_1.genObjectId(), shadow: -1 };
            var character = { _id: mocks_1.genObjectId() };
            var pony = {};
            var reporter = {};
            var map = {};
            var result = playerUtils_1.createClient(client, account, [], [], character, pony, map, reporter, undefined);
            chai_1.expect(result.shadowed).true;
            chai_1.expect(result.country).equal('??');
        });
    });
    describe('resetClientUpdates()', function () {
        it('resets all queues', function () {
            var client = mocks_1.mockClient();
            client.updateQueue.offset = 100;
            client.regionUpdates.push({});
            client.saysQueue.push({});
            client.unsubscribes.push({});
            client.subscribes.push({});
            playerUtils_1.resetClientUpdates(client);
            chai_1.expect(client.updateQueue.offset).equal(0);
            chai_1.expect(client.regionUpdates).eql([]);
            chai_1.expect(client.saysQueue).eql([]);
            chai_1.expect(client.unsubscribes).eql([]);
            chai_1.expect(client.subscribes).eql([]);
        });
    });
    describe('ignorePlayer()', function () {
        var ignorePlayer;
        var updateAccount;
        beforeEach(function () {
            updateAccount = sinon_1.stub().resolves();
            ignorePlayer = lib_1.createFunctionWithPromiseHandler(playerUtils_1.createIgnorePlayer, updateAccount);
        });
        it('adds client to targets ignores list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        target = mocks_1.mockClient();
                        return [4 /*yield*/, ignorePlayer(client, target, true)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(updateAccount, target.accountId, { $push: { ignores: client.accountId } });
                        return [2 /*return*/];
                }
            });
        }); });
        it('removes client from targets ignores list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        target = mocks_1.mockClient();
                        playerUtils_1.addIgnore(target, client.accountId);
                        return [4 /*yield*/, ignorePlayer(client, target, false)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(updateAccount, target.accountId, { $pull: { ignores: client.accountId } });
                        return [2 /*return*/];
                }
            });
        }); });
        it('does nothing if already ignored', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        target = mocks_1.mockClient();
                        playerUtils_1.addIgnore(target, client.accountId);
                        return [4 /*yield*/, ignorePlayer(client, target, true)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(updateAccount);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does nothing if already unignored', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        target = mocks_1.mockClient();
                        return [4 /*yield*/, ignorePlayer(client, target, false)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(updateAccount);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does nothing if called for self', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        return [4 /*yield*/, ignorePlayer(client, client, true)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(updateAccount);
                        return [2 /*return*/];
                }
            });
        }); });
        it('adds client to targets account instance ignores list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        target = mocks_1.mockClient();
                        target.account.ignores = undefined;
                        return [4 /*yield*/, ignorePlayer(client, target, true)];
                    case 1:
                        _a.sent();
                        chai_1.expect(target.account.ignores).eql([client.accountId]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('removes client from targets account instance ignores list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        target = mocks_1.mockClient();
                        playerUtils_1.addIgnore(target, client.accountId);
                        return [4 /*yield*/, ignorePlayer(client, target, false)];
                    case 1:
                        _a.sent();
                        chai_1.expect(target.account.ignores).eql([]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('sends target player state update to client', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        target = mocks_1.mockClient();
                        target.pony.id = 123;
                        return [4 /*yield*/, ignorePlayer(client, target, true)];
                    case 1:
                        _a.sent();
                        chai_1.expect(Array.from(ag_sockets_1.getWriterBuffer(client.updateQueue)))
                            .eql([2, 4, 0, 0, 0, 0, 123, 1]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('findClientByEntityId()', function () {
        it('returns client from selected pony', function () {
            var self = mocks_1.mockClient();
            var client = mocks_1.mockClient();
            self.selected = client.pony;
            chai_1.expect(playerUtils_1.findClientByEntityId(self, client.pony.id)).equal(client);
        });
        it('returns client from party clients', function () {
            var self = mocks_1.mockClient();
            var client = mocks_1.mockClient();
            self.party = {
                id: '',
                clients: [client],
                leader: client,
                pending: [],
            };
            chai_1.expect(playerUtils_1.findClientByEntityId(self, client.pony.id)).equal(client);
        });
        it('returns client from party pending', function () {
            var self = mocks_1.mockClient();
            var client = mocks_1.mockClient();
            self.party = {
                id: '',
                clients: [],
                leader: client,
                pending: [{ client: client, notificationId: 0 }],
            };
            chai_1.expect(playerUtils_1.findClientByEntityId(self, client.pony.id)).equal(client);
        });
        it('returns undefined if not found in party', function () {
            var self = mocks_1.mockClient();
            var client = mocks_1.mockClient();
            self.party = {
                id: '',
                clients: [],
                leader: mocks_1.mockClient(),
                pending: [],
            };
            chai_1.expect(playerUtils_1.findClientByEntityId(self, client.pony.id)).undefined;
        });
        it('returns client from notifications', function () {
            var self = mocks_1.mockClient();
            var client = mocks_1.mockClient();
            self.notifications = [
                { id: 0, name: 'name', message: '', entityId: client.pony.id, sender: client },
            ];
            chai_1.expect(playerUtils_1.findClientByEntityId(self, client.pony.id)).equal(client);
        });
        it('returns undefined if not found', function () {
            var self = mocks_1.mockClient();
            chai_1.expect(playerUtils_1.findClientByEntityId(self, 1)).undefined;
        });
    });
    describe('cancelEntityExpression()', function () {
        it('cancels expression', function () {
            var entity = mocks_1.serverEntity(0);
            entity.options = { expr: 1234 };
            entity.exprCancellable = true;
            entity.exprPermanent = expressionEncoder_1.decodeExpression(1111);
            playerUtils_1.cancelEntityExpression(entity);
            chai_1.expect(entity.options).eql({ expr: 1111 });
            chai_1.expect(entity.exprCancellable).false;
        });
        it('does nothing if entity does not have cancellable expression', function () {
            var entity = mocks_1.serverEntity(0);
            entity.options = { expr: 1234 };
            playerUtils_1.cancelEntityExpression(entity);
            chai_1.expect(entity.options).eql({ expr: 1234 });
        });
    });
    describe('setEntityExpression()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () {
            clock.restore();
        });
        it('sets expression on pony options', function () {
            var pony = mocks_1.clientPony();
            var expression = expressionUtils_1.parseExpression(':)');
            playerUtils_1.setEntityExpression(pony, expression);
            chai_1.expect(pony.options.expr).equal(expressionEncoder_1.encodeExpression(expression));
        });
        it('sets empty expression by default', function () {
            var pony = mocks_1.clientPony();
            playerUtils_1.setEntityExpression(pony, undefined);
            chai_1.expect(pony.options.expr).equal(expressionEncoder_1.encodeExpression(undefined));
        });
        it('uses permanent expression if no expression provided', function () {
            var pony = mocks_1.clientPony();
            var expression = expressionUtils_1.parseExpression(':)');
            pony.exprPermanent = expression;
            playerUtils_1.setEntityExpression(pony, undefined);
            chai_1.expect(pony.options.expr).equal(expressionEncoder_1.encodeExpression(expression));
        });
        it('sets default expression timeout', function () {
            var pony = mocks_1.clientPony();
            clock.setSystemTime(1234);
            playerUtils_1.setEntityExpression(pony, expressionUtils_1.parseExpression(':)'));
            chai_1.expect(pony.exprTimeout).equal(1234 + constants_1.EXPRESSION_TIMEOUT);
        });
        it('sets custom expression timeout if provided', function () {
            var pony = mocks_1.clientPony();
            clock.setSystemTime(1234);
            playerUtils_1.setEntityExpression(pony, expressionUtils_1.parseExpression(':)'), 123);
            chai_1.expect(pony.exprTimeout).equal(1234 + 123);
        });
        it('unsets expression timeout if given 0 for timeout', function () {
            var pony = mocks_1.clientPony();
            pony.exprTimeout = 1234;
            playerUtils_1.setEntityExpression(pony, expressionUtils_1.parseExpression(':)'), 0);
            chai_1.expect(pony.exprTimeout).undefined;
        });
        it('sets expression cancellable flag', function () {
            var pony = mocks_1.clientPony();
            playerUtils_1.setEntityExpression(pony, expressionUtils_1.parseExpression(':)'), 123, true);
            chai_1.expect(pony.exprCancellable).true;
        });
        it('sets expression cancellable flag', function () {
            var pony = mocks_1.clientPony();
            playerUtils_1.setEntityExpression(pony, expressionUtils_1.parseExpression(':)'), 123, false);
            chai_1.expect(pony.exprCancellable).false;
        });
        it('adds expression to region updates', function () {
            var entity = mocks_1.clientPony();
            var region = serverRegion_1.createServerRegion(0, 0);
            entity.region = region;
            playerUtils_1.setEntityExpression(entity, expressionUtils_1.parseExpression(':)'), 123, false);
            chai_1.expect(region.entityUpdates).eql([
                { entity: entity, flags: 8 /* Expression */, x: 0, y: 0, vx: 0, vy: 0, action: 0, playerState: 0, options: undefined },
            ]);
        });
        it('sends expression update to user instead of region updates for shadowed client', function () {
            var pony = mocks_1.clientPony();
            pony.region = serverRegion_1.createServerRegion(0, 0);
            pony.client.shadowed = true;
            pony.id = 123;
            playerUtils_1.setEntityExpression(pony, expressionUtils_1.parseExpression(':)'), 123, false);
            chai_1.expect(Array.from(ag_sockets_1.getWriterBuffer(pony.client.updateQueue)))
                .eql([2, 0, 8, 0, 0, 0, 123, 0, 0, 4, 32]);
        });
    });
    describe('interactWith()', function () {
        it('calls interact method on target', function () {
            var client = mocks_1.mockClient();
            var interact = sinon_1.stub();
            var target = mocks_1.serverEntity(1, 0, 0, 1, { interact: interact });
            playerUtils_1.interactWith(client, target);
            sinon_1.assert.calledWith(interact, target, client);
        });
        it('calls interact method on target if within range', function () {
            var client = mocks_1.mockClient();
            var interact = sinon_1.stub();
            var target = mocks_1.serverEntity(1, 10, 10, 1, { interact: interact, interactRange: 5 });
            client.pony.x = 9;
            client.pony.y = 11;
            playerUtils_1.interactWith(client, target);
            sinon_1.assert.calledWith(interact, target, client);
        });
        it('does not call interact if out of range', function () {
            var client = mocks_1.mockClient();
            var interact = sinon_1.stub();
            var target = mocks_1.serverEntity(1, 10, 10, 1, { interact: interact, interactRange: 5 });
            client.pony.x = 2;
            client.pony.y = 1;
            playerUtils_1.interactWith(client, target);
            sinon_1.assert.notCalled(interact);
        });
        it('does nothing for undefined entity', function () {
            playerUtils_1.interactWith(mocks_1.mockClient(), undefined);
        });
        it('does nothing for entity without interact', function () {
            playerUtils_1.interactWith(mocks_1.mockClient(), mocks_1.serverEntity(1));
        });
    });
    describe('canPerformAction()', function () {
        it('returns true if last action date is below current time', function () {
            chai_1.expect(playerUtils_1.canPerformAction(mocks_1.mockClient({ lastBoopOrKissAction: 1234 }))).true;
        });
        it('returns false if last action date is ahead or current time', function () {
            chai_1.expect(playerUtils_1.canPerformAction(mocks_1.mockClient({ lastExpressionAction: Date.now() + 1000 }))).false;
        });
    });
    describe('sendAction()', function () {
        it('adds action to region', function () {
            var entity = mocks_1.serverEntity(1);
            var region = serverRegion_1.createServerRegion(0, 0);
            entity.region = region;
            entityUtils_1.sendAction(entity, 1 /* Boop */);
            chai_1.expect(region.entityUpdates).eql([
                {
                    entity: entity,
                    flags: 128 /* Action */, x: 0, y: 0, vx: 0, vy: 0, action: 1 /* Boop */,
                    playerState: 0, options: undefined,
                },
            ]);
        });
        it('sends only to entity client if shadowed', function () {
            var client = mocks_1.mockClient();
            client.shadowed = true;
            var entity = client.pony;
            var region = serverRegion_1.createServerRegion(0, 0);
            entity.region = region;
            entity.region.clients.push(mocks_1.mockClient(), client);
            client.pony.id = 123;
            entityUtils_1.sendAction(entity, 1 /* Boop */);
            chai_1.expect(Array.from(ag_sockets_1.getWriterBuffer(client.updateQueue))).eql([2, 0, 128, 0, 0, 0, 123, 1]);
            chai_1.expect(region.entityUpdates).eql([]);
        });
    });
    describe('boop()', function () {
        var client;
        beforeEach(function () {
            client = mocks_1.mockClient();
            client.map = serverMap_1.createServerMap('foo', 0, 1, 1);
            client.pony.region = client.map.regions[0];
            client.lastExpressionAction = 0;
            client.lastBoopOrKissAction = 0;
        });
        it('sends boop action', function () {
            playerUtils_1.boop(client, 1000);
            chai_1.expect(client.pony.region.entityUpdates).eql([
                {
                    entity: client.pony, flags: 128 /* Action */, x: 0, y: 0, vx: 0, vy: 0, action: 1 /* Boop */,
                    playerState: 0, options: undefined,
                },
            ]);
        });
        it('cancels expression', function () {
            client.pony.exprCancellable = true;
            client.pony.options.expr = 123;
            playerUtils_1.boop(client, 1000);
            chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.EMPTY_EXPRESSION);
        });
        it('updates last boop/kiss action', function () {
            client.lastBoopOrKissAction = 0;
            playerUtils_1.boop(client, 100);
            chai_1.expect(client.lastBoopOrKissAction).equal(100 + 850);
        });
        it('executes boop on found entity', function () {
            var boop = sinon_1.stub();
            client.pony.x = 5;
            client.pony.y = 5;
            worldMap_1.getRegion(client.map, 0, 0).entities.push(mocks_1.serverEntity(0, 4.2, 5, 0, { boop: boop }));
            boop(client);
            sinon_1.assert.calledWith(boop, client);
        });
        it('does not execute boop on found entity if shadowed', function () {
            var stubBoop = sinon_1.stub();
            client.pony.x = 5;
            client.pony.y = 5;
            client.shadowed = true;
            worldMap_1.getRegion(client.map, 0, 0).entities.push(mocks_1.serverEntity(0, 4.2, 5, 0, { boop: stubBoop }));
            playerUtils_1.boop(client, 0);
            sinon_1.assert.notCalled(stubBoop);
            chai_1.expect(client.pony.region.entityUpdates.length).eql(0);
        });
        it('does nothing if cannot perform action', function () {
            client.lastBoopOrKissAction = 1000;
            playerUtils_1.boop(client, 0);
            chai_1.expect(client.pony.region.entityUpdates.length).eql(0);
        });
        it('does nothing if moving', function () {
            client.pony.vx = 1;
            playerUtils_1.boop(client, 0);
            chai_1.expect(client.pony.region.entityUpdates.length).eql(0);
        });
    });
    describe('turnHead()', function () {
        it('updates HeadTurned flag', function () {
            var client = mocks_1.mockClient();
            client.pony.state = 0;
            playerUtils_1.turnHead(client);
            chai_1.expect(client.pony.state).equal(4 /* HeadTurned */);
        });
        it('does not update flags if cannot perform action', function () {
            var client = mocks_1.mockClient();
            client.lastBoopOrKissAction = Date.now() + 1000;
            client.pony.state = 0;
            playerUtils_1.turnHead(client);
            chai_1.expect(client.pony.state).equal(0);
        });
    });
    describe('stand()', function () {
        beforeEach(function () {
            client.pony.exprCancellable = true;
            client.pony.options.expr = 123;
        });
        it('updates entity flag to standing', function () {
            client.pony.state = 48 /* PonySitting */;
            client.lastBoopOrKissAction = 0;
            client.lastExpressionAction = 0;
            playerUtils_1.stand(client);
            chai_1.expect(client.pony.state).equal(0 /* PonyStanding */);
        });
        it('does not change other entity flags', function () {
            client.pony.state = 48 /* PonySitting */ | 2 /* FacingRight */;
            playerUtils_1.stand(client);
            chai_1.expect(client.pony.state).equal(0 /* PonyStanding */ | 2 /* FacingRight */);
        });
        it('cancels expression', function () {
            client.pony.state = 48 /* PonySitting */;
            playerUtils_1.stand(client);
            chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.EMPTY_EXPRESSION);
        });
        it('does not cancel expression if transitioning from flying', function () {
            client.pony.state = 80 /* PonyFlying */;
            playerUtils_1.stand(client);
            chai_1.expect(client.pony.options.expr).equal(123);
        });
        it('does nothing if already standing', function () {
            client.pony.state = 0 /* PonyStanding */;
            playerUtils_1.stand(client);
            chai_1.expect(client.pony.state).equal(0 /* PonyStanding */);
            chai_1.expect(client.pony.options.expr).equal(123);
        });
        it('does nothing if cannot perform action', function () {
            client.lastBoopOrKissAction = Date.now() + 1000;
            client.pony.state = 0;
            playerUtils_1.stand(client);
            chai_1.expect(client.pony.state).equal(0);
            chai_1.expect(client.pony.options.expr).equal(123);
        });
        it('does nothing if cannot land', function () {
            client.pony.state = 80 /* PonyFlying */;
            client.pony.x = 0.5;
            client.pony.y = 0.5;
            mocks_1.setupCollider(client.map, 0.5, 0.5);
            collision_spec_1.updateColliders(client.map);
            playerUtils_1.stand(client);
            chai_1.expect(client.pony.state).equal(80 /* PonyFlying */);
            chai_1.expect(client.pony.options.expr).equal(123);
        });
    });
    describe('sit()', function () {
        it('updates entity flag to sitting', function () {
            client.pony.state = 0 /* PonyStanding */;
            playerUtils_1.sit(client, {});
            chai_1.expect(client.pony.state).equal(48 /* PonySitting */);
        });
        it('does not change other entity flags', function () {
            client.pony.state = 0 /* PonyStanding */ | 2 /* FacingRight */;
            playerUtils_1.sit(client, {});
            chai_1.expect(client.pony.state).equal(48 /* PonySitting */ | 2 /* FacingRight */);
        });
        it('does nothing if already sitting', function () {
            client.pony.state = 48 /* PonySitting */;
            playerUtils_1.sit(client, {});
            chai_1.expect(client.pony.state).equal(48 /* PonySitting */);
        });
        it('does nothing if cannot perform action', function () {
            client.lastBoopOrKissAction = Date.now() + 1000;
            client.pony.state = 0;
            playerUtils_1.sit(client, {});
            chai_1.expect(client.pony.state).equal(0);
        });
        it('does nothing if moving', function () {
            client.pony.vx = 1;
            client.pony.state = 0;
            playerUtils_1.sit(client, {});
            chai_1.expect(client.pony.state).equal(0);
        });
    });
    describe('lie()', function () {
        it('updates entity flag to lying', function () {
            client.pony.state = 0 /* PonyStanding */;
            playerUtils_1.lie(client);
            chai_1.expect(client.pony.state).equal(64 /* PonyLying */);
        });
        it('does not change other entity flags', function () {
            client.pony.state = 0 /* PonyStanding */ | 2 /* FacingRight */;
            playerUtils_1.lie(client);
            chai_1.expect(client.pony.state).equal(64 /* PonyLying */ | 2 /* FacingRight */);
        });
        it('does nothing if already lying', function () {
            client.pony.state = 64 /* PonyLying */;
            playerUtils_1.lie(client);
            chai_1.expect(client.pony.state).equal(64 /* PonyLying */);
        });
        it('does nothing if cannot perform action', function () {
            client.lastBoopOrKissAction = Date.now() + 1000;
            client.pony.state = 0;
            playerUtils_1.lie(client);
            chai_1.expect(client.pony.state).equal(0);
        });
        it('does nothing if moving', function () {
            client.pony.vx = 1;
            client.pony.state = 0;
            playerUtils_1.lie(client);
            chai_1.expect(client.pony.state).equal(0);
        });
    });
    describe('fly()', function () {
        beforeEach(function () {
            client.pony.canFly = true;
            client.pony.exprCancellable = true;
            client.pony.options.expr = 123;
        });
        it('updates entity flag to flying', function () {
            client.pony.state = 0 /* PonyStanding */;
            playerUtils_1.fly(client);
            chai_1.expect(client.pony.state).equal(80 /* PonyFlying */ | 1 /* Flying */);
        });
        it('does not change other entity flags', function () {
            client.pony.state = 0 /* PonyStanding */ | 2 /* FacingRight */;
            playerUtils_1.fly(client);
            chai_1.expect(client.pony.state).equal(80 /* PonyFlying */ | 2 /* FacingRight */ | 1 /* Flying */);
        });
        it('cancels expression', function () {
            playerUtils_1.fly(client);
            chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.EMPTY_EXPRESSION);
        });
        it('does nothing if already flying', function () {
            client.lastBoopOrKissAction = Date.now() + 1000;
            client.pony.state = 80 /* PonyFlying */;
            playerUtils_1.fly(client);
            chai_1.expect(client.pony.state).equal(80 /* PonyFlying */);
            chai_1.expect(client.pony.options.expr).equal(123);
        });
        it('does nothing if cannot perform action', function () {
            client.lastBoopOrKissAction = Date.now() + 1000;
            client.pony.state = 0;
            playerUtils_1.fly(client);
            chai_1.expect(client.pony.state).equal(0);
            chai_1.expect(client.pony.options.expr).equal(123);
        });
        it('does nothing if cannot fly', function () {
            client.pony.canFly = false;
            client.pony.state = 0;
            playerUtils_1.fly(client);
            chai_1.expect(client.pony.state).equal(0);
            chai_1.expect(client.pony.options.expr).equal(123);
        });
    });
    describe('expressionAction()', function () {
        beforeEach(function () {
            client.pony.region = serverRegion_1.createServerRegion(1, 1);
            client.pony.exprCancellable = true;
            client.pony.options.expr = 123;
        });
        it('sends given action', function () {
            client.lastExpressionAction = 0;
            client.lastBoopOrKissAction = 0;
            playerUtils_1.expressionAction(client, 3 /* Yawn */);
            chai_1.expect(client.pony.region.entityUpdates).eql([
                __assign(__assign({}, def), { entity: client.pony, flags: 8 /* Expression */ | 128 /* Action */, action: 3 /* Yawn */ }),
            ]);
        });
        it('cancels expression', function () {
            playerUtils_1.expressionAction(client, 3 /* Yawn */);
            chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.EMPTY_EXPRESSION);
        });
        it('does nothing if cannot perform action', function () {
            client.lastExpressionAction = Date.now() + 2500;
            playerUtils_1.expressionAction(client, 3 /* Yawn */);
            chai_1.expect(client.pony.region.entityUpdates).eql([]);
        });
        it('does nothing if not expression action', function () {
            client.pony.canFly = false;
            playerUtils_1.expressionAction(client, 1 /* Boop */);
            chai_1.expect(client.pony.region.entityUpdates).eql([]);
        });
        it('updates last expression action', function () {
            client.lastExpressionAction = 0;
            client.lastBoopOrKissAction = 0;
            playerUtils_1.expressionAction(client, 3 /* Yawn */);
            chai_1.expect(client.lastExpressionAction).greaterThan(Date.now());
        });
    });
    describe('holdItem()', function () {
        it('updates entity options', function () {
            var entity = mocks_1.serverEntity(123);
            playerUtils_1.holdItem(entity, 456);
            chai_1.expect(entity.options).eql({ hold: 456 });
        });
        it('sends entity update', function () {
            var entity = mocks_1.serverEntity(123);
            var region = serverRegion_1.createServerRegion(1, 1);
            entity.region = region;
            playerUtils_1.holdItem(entity, 456);
            chai_1.expect(region.entityUpdates).eql([
                __assign(__assign({}, def), { entity: entity, flags: 32 /* Options */, options: { hold: 456 } }),
            ]);
        });
        it('does not send entity update if hold is already set', function () {
            var entity = mocks_1.serverEntity(123);
            var region = serverRegion_1.createServerRegion(1, 1);
            entity.region = region;
            entity.options = { hold: 456 };
            playerUtils_1.holdItem(entity, 456);
            chai_1.expect(region.entityUpdates).eql([]);
        });
    });
    describe('unholdItem()', function () {
        it('updates entity options', function () {
            var entity = mocks_1.serverEntity(123);
            entity.options = { hold: 456 };
            playerUtils_1.unholdItem(entity);
            chai_1.expect(entity.options).eql({});
        });
        it('sends entity update', function () {
            var entity = mocks_1.serverEntity(123);
            var region = serverRegion_1.createServerRegion(1, 1);
            entity.region = region;
            entity.options = { hold: 456 };
            playerUtils_1.unholdItem(entity);
            chai_1.expect(region.entityUpdates).eql([
                __assign(__assign({}, def), { entity: entity, flags: 32 /* Options */, options: { hold: 0 } }),
            ]);
        });
        it('does not send entity update if hold is not set', function () {
            var entity = mocks_1.serverEntity(123);
            var region = serverRegion_1.createServerRegion(1, 1);
            entity.region = region;
            playerUtils_1.unholdItem(entity);
            chai_1.expect(region.entityUpdates).eql([]);
        });
    });
    describe('holdToy()', function () {
        it('updates entity options', function () {
            var entity = mocks_1.serverEntity(123);
            playerUtils_1.holdToy(entity, 456);
            chai_1.expect(entity.options).eql({ toy: 456 });
        });
        it('sends entity update', function () {
            var entity = mocks_1.serverEntity(123);
            var region = serverRegion_1.createServerRegion(1, 1);
            entity.region = region;
            playerUtils_1.holdToy(entity, 456);
            chai_1.expect(region.entityUpdates).eql([
                __assign(__assign({}, def), { entity: entity, flags: 32 /* Options */, options: { toy: 456 } }),
            ]);
        });
        it('does not send entity update if hold is already set', function () {
            var entity = mocks_1.serverEntity(123);
            var region = serverRegion_1.createServerRegion(1, 1);
            entity.region = region;
            entity.options = { toy: 456 };
            playerUtils_1.holdToy(entity, 456);
            chai_1.expect(region.entityUpdates).eql([]);
        });
    });
    describe('unholdToy()', function () {
        it('updates entity options', function () {
            var entity = mocks_1.serverEntity(123);
            entity.options = { toy: 456 };
            playerUtils_1.unholdToy(entity);
            chai_1.expect(entity.options).eql({});
        });
        it('sends entity update', function () {
            var entity = mocks_1.serverEntity(123);
            var region = serverRegion_1.createServerRegion(1, 1);
            entity.region = region;
            entity.options = { toy: 456 };
            playerUtils_1.unholdToy(entity);
            chai_1.expect(region.entityUpdates).eql([
                __assign(__assign({}, def), { entity: entity, flags: 32 /* Options */, options: { toy: 0 } }),
            ]);
        });
        it('does not send entity update if toy is not set', function () {
            var entity = mocks_1.serverEntity(123);
            var region = serverRegion_1.createServerRegion(1, 1);
            entity.region = region;
            playerUtils_1.unholdToy(entity);
            chai_1.expect(region.entityUpdates).eql([]);
        });
    });
});
//# sourceMappingURL=playerUtils.spec.js.map