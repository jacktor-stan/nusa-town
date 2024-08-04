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
require("../../lib");
var sinon_1 = require("sinon");
var chai_1 = require("chai");
var game_1 = require("../../../server/api/game");
var errors_1 = require("../../../common/errors");
var utils_1 = require("../../../common/utils");
var mocks_1 = require("../../mocks");
describe('api game', function () {
    describe('joinGame()', function () {
        var joinGame;
        var findCharacter;
        var join;
        var addOrigin;
        var hasInvites;
        var server;
        beforeEach(function () {
            findCharacter = sinon_1.stub();
            join = sinon_1.stub();
            addOrigin = sinon_1.stub();
            hasInvites = sinon_1.stub();
            server = { state: { settings: {} } };
            var findServer = sinon_1.stub();
            findServer.withArgs('serverid').returns(server);
            joinGame = game_1.createJoinGame(findServer, { version: '1', host: 'http://foo.bar/', debug: false, local: false }, findCharacter, join, addOrigin, hasInvites);
        });
        it('returns join token', function () { return __awaiter(void 0, void 0, void 0, function () {
            var a, character;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        a = mocks_1.account({ _id: mocks_1.genObjectId() });
                        character = {};
                        findCharacter.withArgs('charid').returns(character);
                        join.withArgs(server, a, character).returns('tokenid');
                        return [4 /*yield*/, chai_1.expect(joinGame(a, 'charid', 'serverid', '1', 'http://foo.bar/', false, {}))
                                .eventually.eql({ token: 'tokenid' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('resolves if meets server requirement', function () { return __awaiter(void 0, void 0, void 0, function () {
            var a, character;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server.state.require = 'sup2';
                        a = mocks_1.account({ _id: mocks_1.genObjectId(), patreon: 2 /* Supporter2 */ });
                        character = {};
                        findCharacter.withArgs('charid').returns(character);
                        join.withArgs(server, a, character).returns('tokenid');
                        return [4 /*yield*/, joinGame(a, 'charid', 'serverid', '1', 'http://foo.bar/', false, {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('resolves if meets server requirement (invited)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var a, character;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server.state.require = 'inv';
                        a = mocks_1.account({ _id: mocks_1.genObjectId() });
                        character = {};
                        findCharacter.withArgs('charid').returns(character);
                        hasInvites.resolves(true);
                        join.withArgs(server, a, character).returns('tokenid');
                        return [4 /*yield*/, joinGame(a, 'charid', 'serverid', '1', 'http://foo.bar/', false, {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('adds origin to account', function () { return __awaiter(void 0, void 0, void 0, function () {
            var a, origin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        a = mocks_1.account({ _id: mocks_1.genObjectId() });
                        origin = {};
                        findCharacter.withArgs('charid').returns({});
                        return [4 /*yield*/, joinGame(a, 'charid', 'serverid', '1', 'http://foo.bar/', false, origin)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(addOrigin, a, origin);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns alert if has account alert', function () { return __awaiter(void 0, void 0, void 0, function () {
            var a, origin, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        a = mocks_1.account({ _id: mocks_1.genObjectId(), alert: { message: 'test alert', expires: utils_1.fromNow(9999) } });
                        origin = {};
                        findCharacter.withArgs('charid').returns({});
                        return [4 /*yield*/, joinGame(a, 'charid', 'serverid', '1', 'http://foo.bar/', false, origin)];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql({ alert: 'test alert' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not returl alert if alredy has alert', function () { return __awaiter(void 0, void 0, void 0, function () {
            var a, origin, character, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        a = mocks_1.account({ _id: mocks_1.genObjectId(), alert: { message: 'test alert', expires: utils_1.fromNow(9999) } });
                        origin = {};
                        character = {};
                        findCharacter.withArgs('charid').returns(character);
                        join.withArgs(server, a, character).returns('tokenid');
                        return [4 /*yield*/, joinGame(a, 'charid', 'serverid', '1', 'http://foo.bar/', true, origin)];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql({ token: 'tokenid' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if passed version is different than server version', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid', 'serverid', '2', 'http://foo.bar/', false, {}))
                            .rejectedWith(errors_1.VERSION_ERROR)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if passed url is different than server url', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid', 'serverid', '1', 'http://im.invalid/', false, {}))
                            .rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if server is not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid', 'doesnotexist', '1', 'http://foo.bar/', false, {}))
                            .rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if server is offline', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server.state.settings.isServerOffline = true;
                        return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid', 'serverid', '1', 'http://foo.bar/', false, {}))
                                .rejectedWith('Server is offline')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if server is restricted', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server.state.require = 'mod';
                        return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid', 'serverid', '1', 'http://foo.bar/', false, {}))
                                .rejectedWith('Server is restricted')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if character ID is missing', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), undefined, 'serverid', '1', 'http://foo.bar/', false, {}))
                            .rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if character ID is not string', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), { foo: 'bar' }, 'serverid', '1', 'http://foo.bar/', false, {}))
                            .rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if character does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid', 'serverid', '1', 'http://foo.bar/', false, {}))
                            .rejectedWith('Character does not exist')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if already joining', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findCharacter.withArgs('charid').returns({});
                        join.returns(new Promise(function () { }));
                        _id = mocks_1.genObjectId();
                        joinGame(mocks_1.account({ _id: _id }), 'charid', 'serverid', '1', 'http://foo.bar/', false, {});
                        return [4 /*yield*/, utils_1.delay(1)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: _id }), 'charid', 'serverid', '1', 'http://foo.bar/', false, {}))
                                .rejectedWith('Already waiting for join request')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not reject if other client is already joining', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findCharacter.withArgs('charid').returns({});
                        findCharacter.withArgs('charid2').returns({});
                        join.returns(new Promise(function () { }));
                        join.returns('tokenid');
                        joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid2', 'serverid', '1', 'http://foo.bar/', false, {});
                        return [4 /*yield*/, utils_1.delay(1)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid', 'serverid', '1', 'http://foo.bar/', false, {}))
                                .eventually.eql({ token: 'tokenid' })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if joining is blocked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server.state.settings.blockJoining = true;
                        findCharacter.withArgs('charid').returns({});
                        return [4 /*yield*/, chai_1.expect(joinGame(mocks_1.account({ _id: mocks_1.genObjectId() }), 'charid', 'serverid', '1', 'http://foo.bar/', false, {}))
                                .rejectedWith('Cannot join to the server')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=game.spec.js.map