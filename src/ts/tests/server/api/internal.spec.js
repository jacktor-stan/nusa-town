"use strict";
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
var lib_1 = require("../../lib");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var internal_1 = require("../../../server/api/internal");
var world_1 = require("../../../server/world");
var mocks_1 = require("../../mocks");
var mongoose_1 = require("mongoose");
var hiding_1 = require("../../../server/services/hiding");
var stats_1 = require("../../../server/stats");
describe('api internal', function () {
    describe('accountChanged()', function () {
        var func;
        var world;
        var findAccount;
        var clearTokensForAccount;
        beforeEach(function () {
            world = new world_1.World({}, { partyChanged: { subscribe: function () { } } }, {}, {}, {}, function () { return ({}); }, {}, {});
            clearTokensForAccount = sinon_1.stub();
            findAccount = sinon_1.stub();
            func = internal_1.createAccountChanged(world, { clearTokensForAccount: clearTokensForAccount }, findAccount);
        });
        it('notifies world of account update', function () { return __awaiter(void 0, void 0, void 0, function () {
            var account, accountUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = { _id: mocks_1.genObjectId() };
                        findAccount.withArgs('foobar').resolves(account);
                        accountUpdated = sinon_1.stub(world, 'accountUpdated');
                        return [4 /*yield*/, func('foobar')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(accountUpdated, account);
                        return [2 /*return*/];
                }
            });
        }); });
        it('clears tokens for account if account is banned', function () { return __awaiter(void 0, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = { _id: mocks_1.genObjectId(), ban: -1 };
                        findAccount.withArgs('foobar').resolves(account);
                        return [4 /*yield*/, func('foobar')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(clearTokensForAccount, 'foobar');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('accountMerged()', function () {
        var hiding = lib_1.stubClass(hiding_1.HidingService);
        var func;
        beforeEach(function () {
            lib_1.resetStubMethods(hiding, 'merged');
            func = internal_1.createAccountMerged(hiding);
        });
        it('notifies hiding service of merge', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, func('foo', 'bar')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(hiding.merged, 'foo', 'bar');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('accountStatus()', function () {
        var func;
        var world;
        var server;
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
            world = { clientsByAccount: new Map() };
            server = { id: 'foo' };
            func = internal_1.createAccountStatus(world, server);
        });
        afterEach(function () {
            clock.restore();
        });
        it('returns client account status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        client.characterName = 'derpy';
                        client.pony.name = '?????';
                        client.pony.x = 5.2;
                        client.pony.y = 6.1;
                        client.userAgent = 'useragent';
                        client.connectedTime = 0;
                        clock.setSystemTime(12 * 1000);
                        world.clientsByAccount.set('bar', client);
                        return [4 /*yield*/, chai_1.expect(func('bar')).eventually.eql({
                                online: true,
                                incognito: undefined,
                                character: 'derpy',
                                duration: '12s',
                                server: 'foo',
                                map: '-',
                                x: 5,
                                y: 6,
                                userAgent: 'useragent',
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns offline status for missing client', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(func('bar')).eventually.eql({ online: false })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('accountAround()', function () {
        var func;
        beforeEach(function () {
            func = internal_1.createAccountAround({ clientsByAccount: new Map() });
        });
        it('returns client arount given account', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(func('bar')).eventually.eql([])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('hiddenStats()', function () {
        var hiddenStats;
        var hiding;
        beforeEach(function () {
            hiding = sinon_1.createStubInstance(hiding_1.HidingService);
            hiddenStats = internal_1.createHiddenStats(hiding);
        });
        it('returns hiding stats for given account', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = {};
                        hiding.getStatsFor.withArgs('bar').returns(result);
                        return [4 /*yield*/, chai_1.expect(hiddenStats('bar')).eventually.equal(result)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('join()', function () {
        var func;
        var world;
        var server;
        var settings;
        var clearTokensForAccount;
        var createToken;
        var findAccount;
        var findCharacter;
        var findAuth;
        var hasInvite;
        var account;
        var character;
        var clock;
        var liveSettings;
        beforeEach(function () {
            account = { save: function () { }, _id: new mongoose_1.Types.ObjectId('5983e1f7519f95530becdf7d') };
            character = { save: function () { }, _id: new mongoose_1.Types.ObjectId('5983e1f7519f95530becdf7a') };
            world = mocks_1.mock(world_1.World);
            server = { id: 'foo' };
            settings = {};
            liveSettings = {};
            clearTokensForAccount = sinon_1.stub();
            createToken = sinon_1.stub();
            findAccount = sinon_1.stub().withArgs('foo').resolves(account);
            findCharacter = sinon_1.stub().withArgs('bar', 'foo').resolves(character);
            findAuth = sinon_1.stub();
            hasInvite = sinon_1.stub();
            func = internal_1.createJoin(world, function () { return settings; }, server, { clearTokensForAccount: clearTokensForAccount, createToken: createToken }, findAccount, findCharacter, findAuth, liveSettings, hasInvite);
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () { return clock.restore(); });
        it('returns new token id', function () {
            createToken.returns('lalala');
            return chai_1.expect(func('foo', 'bar')).eventually.equal('lalala');
        });
        it('creates token using fetched account and character', function () {
            return func('foo', 'bar')
                .then(function () {
                chai_1.expect(createToken.args[0][0].account).equal(account);
                chai_1.expect(createToken.args[0][0].character).equal(character);
            });
        });
        it('kicks all other clients with the same account', function () {
            var kickByAccount = sinon_1.stub(world, 'kickByAccount');
            return func('foo', 'bar')
                .then(function () {
                sinon_1.assert.calledWith(kickByAccount, 'foo');
                sinon_1.assert.calledWith(clearTokensForAccount, 'foo');
            });
        });
        it('updates account default server', function () {
            var save = sinon_1.stub(account, 'save');
            server.id = 'someidhere';
            return func('foo', 'bar')
                .then(function () {
                chai_1.expect(account.settings).eql({ defaultServer: 'someidhere' });
                sinon_1.assert.calledOnce(save);
            });
        });
        it('updates account default server (with existing settings)', function () {
            var save = sinon_1.stub(account, 'save');
            server.id = 'someidhere';
            account.settings = { ignorePartyInvites: true };
            return func('foo', 'bar')
                .then(function () {
                chai_1.expect(account.settings).eql({ ignorePartyInvites: true, defaultServer: 'someidhere' });
                sinon_1.assert.calledOnce(save);
            });
        });
        it('updates account last visit', function () {
            var save = sinon_1.stub(account, 'save');
            clock.setSystemTime(123);
            return func('foo', 'bar')
                .then(function () {
                chai_1.expect(account.lastVisit.toISOString()).equal(new Date(123).toISOString());
                sinon_1.assert.calledOnce(save);
            });
        });
        it('updates character last used', function () {
            var save = sinon_1.stub(character, 'save');
            clock.setSystemTime(123);
            return func('foo', 'bar')
                .then(function () {
                chai_1.expect(character.lastUsed.toISOString()).equal(new Date(123).toISOString());
                sinon_1.assert.calledOnce(save);
            });
        });
        it('rejects if server is offline', function () {
            settings.isServerOffline = true;
            return chai_1.expect(func('foo', 'bar')).rejectedWith('Server is offline');
        });
        it('rejects if server is restricted from user', function () {
            server.require = 'mod';
            return chai_1.expect(func('foo', 'bar')).rejectedWith('Server is restricted');
        });
        it('resolves if user meets server restrictions', function () {
            server.require = 'mod';
            account.roles = ['mod'];
            return func('foo', 'bar');
        });
        it('resolves if user meets server restrictions (supporter)', function () {
            server.require = 'sup1';
            account.patreon = 2 /* Supporter2 */;
            return func('foo', 'bar');
        });
        it('resolves if user meets server restrictions (invited)', function () {
            server.require = 'inv';
            hasInvite.resolves(true);
            return func('foo', 'bar');
        });
        it('sets up character social site', function () { return __awaiter(void 0, void 0, void 0, function () {
            var site, siteId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        site = {};
                        siteId = new mongoose_1.Types.ObjectId('5983e1f7519f95530becdf70');
                        findAuth.withArgs(siteId, account._id).resolves(site);
                        character.site = siteId;
                        return [4 /*yield*/, func('foo', 'bar')];
                    case 1:
                        _a.sent();
                        chai_1.expect(character.auth).equal(site);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not set up character social site if its missing', function () { return __awaiter(void 0, void 0, void 0, function () {
            var siteId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        siteId = new mongoose_1.Types.ObjectId('5983e1f7519f95530becdf70');
                        findAuth.withArgs(siteId, account._id).resolves(undefined);
                        character.site = siteId;
                        return [4 /*yield*/, func('foo', 'bar')];
                    case 1:
                        _a.sent();
                        chai_1.expect(character.auth).undefined;
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not set up character social site if its disabled', function () { return __awaiter(void 0, void 0, void 0, function () {
            var site, siteId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        site = { disabled: true };
                        siteId = new mongoose_1.Types.ObjectId('5983e1f7519f95530becdf70');
                        findAuth.withArgs(siteId, account._id).resolves(site);
                        character.site = siteId;
                        return [4 /*yield*/, func('foo', 'bar')];
                    case 1:
                        _a.sent();
                        chai_1.expect(character.auth).undefined;
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not set up character social site if its banned', function () { return __awaiter(void 0, void 0, void 0, function () {
            var site, siteId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        site = { banned: true };
                        siteId = new mongoose_1.Types.ObjectId('5983e1f7519f95530becdf70');
                        findAuth.withArgs(siteId, account._id).resolves(site);
                        character.site = siteId;
                        return [4 /*yield*/, func('foo', 'bar')];
                    case 1:
                        _a.sent();
                        chai_1.expect(character.auth).undefined;
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getServerState()', function () {
        var func;
        var world;
        var server;
        var settings;
        var liveSettings;
        beforeEach(function () {
            world = mocks_1.mock(world_1.World);
            server = { flags: {} };
            settings = {};
            liveSettings = { updating: false, shutdown: false };
            func = internal_1.createGetServerState(server, function () { return settings; }, world, liveSettings);
        });
        it('returns combined server state', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Object.assign(server, { id: 'aaa', name: 'bbb', path: 'ccc', desc: 'ddd', alert: 'eee', require: 'mod' });
                        world.clients = [{}, {}];
                        world.joinQueue = [{}, {}, {}];
                        world.maps = [{}, {}];
                        settings.isServerOffline = true;
                        settings.filterSwears = true;
                        return [4 /*yield*/, func()];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql({
                            id: 'aaa',
                            name: 'bbb',
                            path: 'ccc',
                            desc: 'ddd',
                            alert: 'eee',
                            dead: false,
                            maps: 2,
                            online: 2,
                            onMain: 2,
                            queued: 3,
                            require: 'mod',
                            flags: {},
                            flag: undefined,
                            host: undefined,
                            settings: settings,
                            shutdown: false,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('uses defaults for missing values', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Object.assign(server, { id: 'aaa', name: 'bbb', path: 'ccc', desc: 'ddd' });
                        world.clients = [{}, {}];
                        world.joinQueue = [];
                        world.maps = [];
                        return [4 /*yield*/, func()];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql({
                            id: 'aaa',
                            name: 'bbb',
                            path: 'ccc',
                            desc: 'ddd',
                            alert: undefined,
                            dead: false,
                            maps: 0,
                            online: 2,
                            onMain: 2,
                            queued: 0,
                            require: undefined,
                            host: undefined,
                            flags: {},
                            flag: undefined,
                            settings: settings,
                            shutdown: false,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getServerStats()', function () {
        var stats;
        var func;
        beforeEach(function () {
            stats = sinon_1.createStubInstance(stats_1.StatsTracker);
            func = internal_1.createGetServerStats(stats);
        });
        it('returns socket stats', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = {};
                        stats.getSocketStats.returns(result);
                        return [4 /*yield*/, chai_1.expect(func()).eventually.equal(result)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('action()', function () {
        var action;
        beforeEach(function () {
            action = internal_1.createAction({});
        });
        it('throws if action is invalid', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(action('foo', 'foobar')).rejectedWith('Invalid action (foo)')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('kick()', function () {
        var func;
        var world;
        var clearTokensForAccount;
        beforeEach(function () {
            world = mocks_1.mock(world_1.World);
            clearTokensForAccount = sinon_1.stub();
            func = internal_1.createKick(world, { clearTokensForAccount: clearTokensForAccount });
        });
        it('kicks clients by account ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var kickByAccount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        kickByAccount = sinon_1.stub(world, 'kickByAccount');
                        return [4 /*yield*/, func('foo', undefined)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(kickByAccount, 'foo');
                        return [2 /*return*/];
                }
            });
        }); });
        it('clears tokens by account ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, func('foo', undefined)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(clearTokensForAccount, 'foo');
                        return [2 /*return*/];
                }
            });
        }); });
        it('kicks clients by character ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var kickByCharacter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        kickByCharacter = sinon_1.stub(world, 'kickByCharacter');
                        return [4 /*yield*/, func(undefined, 'bar')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(kickByCharacter, 'bar');
                        return [2 /*return*/];
                }
            });
        }); });
        it('does nothing if ID is not provided', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, func(undefined, undefined)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('kickAll()', function () {
        var func;
        var world;
        var clearTokensAll;
        beforeEach(function () {
            world = mocks_1.mock(world_1.World);
            clearTokensAll = sinon_1.stub();
            func = internal_1.createKickAll(world, { clearTokensAll: clearTokensAll });
        });
        it('kicks all clients', function () { return __awaiter(void 0, void 0, void 0, function () {
            var kickAll;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        kickAll = sinon_1.stub(world, 'kickAll');
                        return [4 /*yield*/, func()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(kickAll);
                        return [2 /*return*/];
                }
            });
        }); });
        it('clears all tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, func()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(clearTokensAll);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('notifyUpdate()', function () {
        var func;
        var world = lib_1.stubClass(world_1.World);
        var liveSettings;
        beforeEach(function () {
            lib_1.resetStubMethods(world, 'notifyUpdate', 'saveClientStates');
            liveSettings = {};
            func = internal_1.createNotifyUpdate(world, liveSettings);
        });
        it('notifies world of update', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, func()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(world.notifyUpdate);
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates character state', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, func()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(world.saveClientStates);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('cancelUpdate()', function () {
        var func;
        var live;
        beforeEach(function () {
            live = {};
            func = internal_1.createCancelUpdate(live);
        });
        it('sets updating to false', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        live.updating = true;
                        return [4 /*yield*/, func()];
                    case 1:
                        _a.sent();
                        chai_1.expect(live.updating).false;
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('shutdownServer()', function () {
        var shutdownServer;
        var world;
        var liveSettings;
        beforeEach(function () {
            world = mocks_1.mock(world_1.World);
            world.server = { id: 'foo' };
            liveSettings = {};
            shutdownServer = internal_1.createShutdownServer(world, liveSettings);
        });
        it('updates shutdown option in live settings to true', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shutdownServer(true)];
                    case 1:
                        _a.sent();
                        chai_1.expect(liveSettings.shutdown).true;
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates shutdown option in live settings to false', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shutdownServer(false)];
                    case 1:
                        _a.sent();
                        chai_1.expect(liveSettings.shutdown).false;
                        return [2 /*return*/];
                }
            });
        }); });
        it('kicks all players', function () { return __awaiter(void 0, void 0, void 0, function () {
            var kickAll;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        kickAll = sinon_1.stub(world, 'kickAll');
                        return [4 /*yield*/, shutdownServer(true)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(kickAll);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=internal.spec.js.map