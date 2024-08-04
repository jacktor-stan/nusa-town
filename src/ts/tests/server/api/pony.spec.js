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
var mongoose_1 = require("mongoose");
var constants_1 = require("../../../common/constants");
var stringUtils_1 = require("../../../common/stringUtils");
var pony_1 = require("../../../server/api/pony");
var accountUtils_1 = require("../../../common/accountUtils");
var mocks_1 = require("../../mocks");
var info = constants_1.OFFLINE_PONY;
describe('api pony', function () {
    describe('savePony()', function () {
        var savePony;
        var findCharacter;
        var findAuth;
        var characterCount;
        var updateCharacterCount;
        var createCharacter;
        var log;
        var isSuspiciousName;
        var isSuspiciousPony;
        var clock;
        var reporter;
        beforeEach(function () {
            findCharacter = sinon_1.stub();
            findAuth = sinon_1.stub();
            characterCount = sinon_1.stub();
            updateCharacterCount = sinon_1.stub();
            createCharacter = sinon_1.stub();
            log = sinon_1.stub();
            isSuspiciousName = sinon_1.stub();
            isSuspiciousPony = sinon_1.stub();
            clock = sinon_1.useFakeTimers();
            reporter = {
                danger: sinon_1.stub(),
                setPony: sinon_1.stub(),
                warn: sinon_1.stub(),
            };
            savePony = pony_1.createSavePony(findCharacter, findAuth, characterCount, updateCharacterCount, createCharacter, log, isSuspiciousName, isSuspiciousPony);
        });
        afterEach(function () {
            clock.restore();
        });
        describe('for existing character', function () {
            var characterId = mocks_1.genId();
            var characterObjectId = mongoose_1.Types.ObjectId(characterId);
            var character;
            var account = { _id: 'accid' };
            beforeEach(function () {
                character = {
                    name: 'oldname',
                    _id: characterObjectId,
                    createdAt: new Date(10),
                    save: function () { return this; }
                };
                findCharacter.withArgs(characterId, 'accid').resolves(character);
            });
            it('returns pony object', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            clock.setSystemTime(123);
                            return [4 /*yield*/, chai_1.expect(savePony(account, { id: characterId, name: 'foo', info: info }, reporter)).eventually.eql({
                                    id: characterId,
                                    info: info,
                                    lastUsed: '1970-01-01T00:00:00.123Z',
                                    name: 'foo',
                                    desc: '',
                                    site: undefined,
                                    tag: undefined,
                                    hideSupport: undefined,
                                    respawnAtSpawn: undefined,
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('saves character', function () { return __awaiter(void 0, void 0, void 0, function () {
                var save;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            save = sinon_1.stub(character, 'save').resolves(character);
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledOnce(save);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('updates character fields', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            clock.setSystemTime(123);
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', tag: 'tag', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            chai_1.expect(character.name).equal('foo');
                            chai_1.expect(character.tag).equal('tag');
                            chai_1.expect(character.info).equal(info);
                            chai_1.expect(character.lastUsed.toISOString()).equal((new Date()).toISOString());
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not reject if character limit is reached', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            characterCount.resolves(accountUtils_1.getCharacterLimit({ supporter: 0 }) * 2);
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('logs name change', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(log, account._id, 'renamed pony "oldname" => "foo"');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not log if nothing changed', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, savePony(account, { id: characterId, name: 'oldname', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.notCalled(log);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('reports suspicious name', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isSuspiciousName.withArgs('moderator').returns(true);
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'moderator', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(reporter.setPony, characterId);
                            sinon_1.assert.calledWith(reporter.warn, 'Suspicious pony created', '"moderator" (name)');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not report suspicious name if not changed', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            character.name = 'moderator';
                            isSuspiciousName.withArgs('moderator').returns(true);
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'moderator', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('reports suspicious look', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isSuspiciousPony.returns(true);
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'moderator', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(reporter.setPony, characterId);
                            sinon_1.assert.calledWith(reporter.warn, 'Suspicious pony created', '"moderator" (look)');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not report suspicious look if not changed', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            character.info = info;
                            isSuspiciousPony.returns(true);
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'moderator', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('reports suspicious name & look', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isSuspiciousName.withArgs('moderator').returns(true);
                            isSuspiciousPony.returns(true);
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'moderator', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(reporter.setPony, characterId);
                            sinon_1.assert.calledWith(reporter.warn, 'Suspicious pony created', '"moderator" (name, look)');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('rejects on decoding error', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, chai_1.expect(savePony(account, { id: characterId, name: 'foo', info: 'xxyf@hs' }, reporter))
                                .rejectedWith('Error saving character')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('sets bad CM flag', function () { return __awaiter(void 0, void 0, void 0, function () {
                var info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            info = 'CASZlZXapSD/1wBAPTk2QAJkI0AT8ADAAxADhAYQHMMkhhMkkJhkkMA=';
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            chai_1.expect(character.flags).equal(1 /* BadCM */);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('sets hide support pony flag', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', info: info, hideSupport: true }, reporter)];
                        case 1:
                            _a.sent();
                            chai_1.expect(character.flags).equal(4 /* HideSupport */);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('sets respawn at spawn pony flag', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', info: info, respawnAtSpawn: true }, reporter)];
                        case 1:
                            _a.sent();
                            chai_1.expect(character.flags).equal(8 /* RespawnAtSpawn */);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('sets auth', function () { return __awaiter(void 0, void 0, void 0, function () {
                var authid;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            authid = {};
                            findAuth.withArgs('authid', 'accid').resolves({ _id: authid });
                            return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', site: 'authid', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            chai_1.expect(character.site).equal(authid);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not set auth if not found', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, savePony(account, { id: characterId, name: 'foo', site: 'authid', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            chai_1.expect(character.site).null;
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('for new character', function () {
            var characterId = mocks_1.genId();
            var acc = mocks_1.account({ _id: mocks_1.genObjectId() });
            var character;
            beforeEach(function () {
                character = {
                    _id: mongoose_1.Types.ObjectId(characterId),
                    save: function () { return this; }
                };
                createCharacter.withArgs(acc).returns(character);
            });
            it('returns pony object', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            clock.setSystemTime(123);
                            return [4 /*yield*/, chai_1.expect(savePony(acc, { name: 'foo', info: info }, reporter)).eventually.eql({
                                    id: characterId,
                                    info: info,
                                    lastUsed: '1970-01-01T00:00:00.123Z',
                                    name: 'foo',
                                    desc: '',
                                    site: undefined,
                                    tag: undefined,
                                    hideSupport: undefined,
                                    respawnAtSpawn: undefined,
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('saves character', function () { return __awaiter(void 0, void 0, void 0, function () {
                var save;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            save = sinon_1.stub(character, 'save').resolves(character);
                            return [4 /*yield*/, savePony(acc, { name: 'foo', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledOnce(save);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('sets character fields', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            clock.setSystemTime(123);
                            return [4 /*yield*/, savePony(acc, { id: characterId, name: 'foo', tag: 'tag', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            chai_1.expect(character.name).equal('foo');
                            chai_1.expect(character.tag).equal('tag');
                            chai_1.expect(character.info).equal(info);
                            chai_1.expect(character.lastUsed.toISOString()).equal((new Date()).toISOString());
                            return [2 /*return*/];
                    }
                });
            }); });
            it('rejects if character limit is reached', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            characterCount.resolves(accountUtils_1.getCharacterLimit({ supporter: 0 }));
                            return [4 /*yield*/, chai_1.expect(savePony(acc, { name: 'foo', info: info }, reporter))
                                    .rejectedWith('Character limit reached')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('logs character creation', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            sinon_1.stub(character, 'save').resolves({ name: 'foo', createdAt: new Date() });
                            return [4 /*yield*/, savePony(acc, { name: 'foo', info: info }, reporter)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(log, acc._id, 'created pony "foo"');
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('for supporters', function () {
                beforeEach(function () {
                    acc.patreon = 1 /* Supporter1 */;
                });
                it('has larger limit', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var save;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                characterCount.resolves(accountUtils_1.getCharacterLimit({ supporter: 0 }));
                                save = sinon_1.stub(character, 'save').resolves(character);
                                return [4 /*yield*/, savePony(acc, { name: 'foo', info: info }, reporter)];
                            case 1:
                                _a.sent();
                                sinon_1.assert.calledOnce(save);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('rejects if character limit is reached', function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                characterCount.resolves(accountUtils_1.getCharacterLimit({ supporter: 1 }));
                                return [4 /*yield*/, chai_1.expect(savePony(acc, { name: 'foo', info: info }, reporter)).rejectedWith('Character limit reached')];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
        it('rejects on missing pony', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(savePony({}, undefined, reporter)).rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on missing pony name', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(savePony({}, { info: info }, reporter)).rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on non-string pony name', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(savePony({}, { name: {}, info: info }, reporter)).rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on missing pony info', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(savePony({}, { name: 'foo' }, reporter)).rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on too long pony name', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(savePony({}, { name: stringUtils_1.randomString(constants_1.PLAYER_NAME_MAX_LENGTH + 1), info: info }, reporter))
                            .rejectedWith('Invalid name')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects on database error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findCharacter.rejects(new Error('test'));
                        return [4 /*yield*/, chai_1.expect(savePony({}, { id: 'charid', name: 'foo', info: info }, reporter)).rejectedWith('Invalid data')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('removePony()', function () {
        var removePony;
        var kickFromAllServersByCharacter;
        var removeCharacter;
        var updateCharacterCount;
        var removedCharacter;
        var logRemovedCharacter;
        beforeEach(function () {
            kickFromAllServersByCharacter = sinon_1.stub();
            removeCharacter = sinon_1.stub();
            updateCharacterCount = sinon_1.stub();
            removedCharacter = sinon_1.stub();
            logRemovedCharacter = sinon_1.stub();
            removePony = pony_1.createRemovePony(kickFromAllServersByCharacter, removeCharacter, updateCharacterCount, removedCharacter, logRemovedCharacter);
        });
        it('kicks user from all servers', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, removePony('ponid', 'accid')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(kickFromAllServersByCharacter, 'ponid');
                        return [2 /*return*/];
                }
            });
        }); });
        it('removes character', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, removePony('ponid', 'accid')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(removeCharacter, 'ponid', 'accid');
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates character count', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, removePony('ponid', 'accid')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(updateCharacterCount, 'accid');
                        return [2 /*return*/];
                }
            });
        }); });
        it('logs character removed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var character;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        character = { name: 'test', info: 'INFO' };
                        removeCharacter.resolves(character);
                        return [4 /*yield*/, removePony('ponid', 'accid')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(logRemovedCharacter, character);
                        return [2 /*return*/];
                }
            });
        }); });
        it('notifies of character removal', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        removeCharacter.resolves({ name: 'test' });
                        return [4 /*yield*/, removePony('ponid', 'accid')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(removedCharacter, 'ponid');
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not log character removal if character is not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        removeCharacter.resolves(undefined);
                        return [4 /*yield*/, removePony('ponid', 'accid')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(logRemovedCharacter);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not notify of character removal if character is not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        removeCharacter.resolves(undefined);
                        return [4 /*yield*/, removePony('ponid', 'accid')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(removedCharacter);
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if pony ID is not a string', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(removePony({}, 'accid')).rejectedWith('Invalid ponyId ([object Object])')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects if pony ID is empty', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, chai_1.expect(removePony('', 'accid')).rejectedWith('Invalid ponyId ()')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=pony.spec.js.map