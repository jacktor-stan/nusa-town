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
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var account_1 = require("../../../server/api/account");
var mocks_1 = require("../../mocks");
var db = require("../../../server/db");
describe('api account', function () {
    describe('getAccountData()', function () {
        var findCharacters;
        var findAuths;
        var getAccountData;
        var findFriends;
        beforeEach(function () {
            findCharacters = sinon_1.stub();
            findAuths = sinon_1.stub();
            findFriends = sinon_1.stub(db, 'findFriends').resolves([]);
            getAccountData = account_1.createGetAccountData(findCharacters, findAuths);
        });
        afterEach(function () {
            findFriends.restore();
        });
        it('returns account data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _id, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findCharacters.resolves([]);
                        findAuths.resolves([]);
                        _id = mocks_1.genObjectId();
                        return [4 /*yield*/, getAccountData(mocks_1.account({ _id: _id, name: 'foo', birthdate: new Date(123), characterCount: 5 }))];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql({
                            id: _id.toString(),
                            name: 'foo',
                            birthdate: '1970-01-01',
                            birthyear: undefined,
                            characterCount: 5,
                            ponies: [],
                            settings: {},
                            sites: [],
                            alert: undefined,
                            supporter: undefined,
                            flags: 0,
                            roles: undefined,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('adds mod check if account is mod', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findCharacters.resolves([]);
                        findAuths.resolves([]);
                        return [4 /*yield*/, getAccountData(mocks_1.account({ _id: mocks_1.genObjectId(), roles: ['mod'] }))];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result.check).eql(account_1.modCheck);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getAccountCharacters()', function () {
        var findCharacters;
        var getAccountCharacters;
        beforeEach(function () {
            findCharacters = sinon_1.stub();
            getAccountCharacters = account_1.createGetAccountCharacters(findCharacters);
        });
        it('returns empty array', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findCharacters.resolves([]);
                        return [4 /*yield*/, getAccountCharacters(mocks_1.account({}))];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql([]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns chracters array', function () { return __awaiter(void 0, void 0, void 0, function () {
            var accountId, characterId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accountId = mocks_1.genObjectId();
                        characterId = mocks_1.genObjectId();
                        findCharacters.withArgs(accountId).resolves([
                            {
                                _id: characterId,
                                name: 'foo',
                                info: 'info',
                                lastUsed: new Date(123),
                            },
                        ]);
                        return [4 /*yield*/, getAccountCharacters(mocks_1.account({ _id: accountId }))];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql([
                            {
                                id: characterId.toString(),
                                name: 'foo',
                                desc: '',
                                info: 'info',
                                lastUsed: '1970-01-01T00:00:00.123Z',
                                site: undefined,
                                tag: undefined,
                                hideSupport: undefined,
                                respawnAtSpawn: undefined,
                            },
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateAccount()', function () {
        var findAccount;
        var updateAccount;
        var updateOne;
        var log;
        beforeEach(function () {
            findAccount = sinon_1.stub();
            log = sinon_1.stub();
            updateOne = sinon_1.stub(db.Account, 'updateOne').returns({ exec: sinon_1.stub().resolves() });
            updateAccount = account_1.createUpdateAccount(findAccount, log);
        });
        afterEach(function () {
            updateOne.restore();
        });
        it('resolves to account data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var account, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = {
                            _id: mocks_1.genObjectId(),
                            name: 'name',
                            birthdate: new Date(123),
                            birthyear: 123,
                            roles: ['role'],
                            settings: { foo: 'bar' },
                            characterCount: 5,
                            save: sinon_1.stub(),
                        };
                        findAccount.withArgs(account._id).resolves(account);
                        return [4 /*yield*/, updateAccount(account, {})];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql({
                            id: account._id.toString(),
                            name: 'name',
                            birthdate: '1970-01-01',
                            birthyear: 123,
                            roles: ['role'],
                            settings: { foo: 'bar' },
                            supporter: undefined,
                            characterCount: 5,
                            flags: 0,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('saves account', function () { return __awaiter(void 0, void 0, void 0, function () {
            var acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acc = mocks_1.account({ _id: mocks_1.genObjectId() });
                        findAccount.resolves(acc);
                        return [4 /*yield*/, updateAccount(acc, {})];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(updateOne, { _id: acc._id }, {});
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates account name', function () { return __awaiter(void 0, void 0, void 0, function () {
            var acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acc = mocks_1.account({ _id: mocks_1.genObjectId() });
                        findAccount.resolves(acc);
                        return [4 /*yield*/, updateAccount(acc, { name: 'foo', birthdate: '' })];
                    case 1:
                        _a.sent();
                        chai_1.expect(acc.name).equal('foo');
                        return [2 /*return*/];
                }
            });
        }); });
        it('logs account rename', function () { return __awaiter(void 0, void 0, void 0, function () {
            var acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acc = mocks_1.account({ _id: mocks_1.genObjectId(), name: 'bar' });
                        findAccount.resolves(acc);
                        return [4 /*yield*/, updateAccount(acc, { name: 'foo', birthdate: '' })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(log, acc._id, 'Renamed "bar" => "foo"');
                        return [2 /*return*/];
                }
            });
        }); });
        it('cleans account name before updating', function () { return __awaiter(void 0, void 0, void 0, function () {
            var acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acc = mocks_1.account({ _id: mocks_1.genObjectId() });
                        findAccount.resolves(acc);
                        return [4 /*yield*/, updateAccount(acc, { name: 'f\t\r\noo', birthdate: '' })];
                    case 1:
                        _a.sent();
                        chai_1.expect(acc.name).equal('foo');
                        return [2 /*return*/];
                }
            });
        }); });
        var invalidNameValues = [
            '',
            // 'a',
            'string_that_is_exceeding_character_limit_for_account_names_aaaaaaaaaaaaaaaaaaaaaaaaa',
            { foo: 'bar' },
            123,
            null,
        ];
        invalidNameValues.forEach(function (name) { return it("does not update account name if it is invalid (" + name + ")", function () { return __awaiter(void 0, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = { _id: mocks_1.genObjectId(), name: 'name', save: sinon_1.stub() };
                        findAccount.resolves(account);
                        return [4 /*yield*/, updateAccount(account, { name: name, birthdate: '' })];
                    case 1:
                        _a.sent();
                        chai_1.expect(account.name).equal('name');
                        return [2 /*return*/];
                }
            });
        }); }); });
        it('updates account birthdate', function () { return __awaiter(void 0, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = { _id: mocks_1.genObjectId(), save: sinon_1.stub() };
                        findAccount.resolves(account);
                        return [4 /*yield*/, updateAccount(account, { name: 'foo', birthdate: '2000-02-03' })];
                    case 1:
                        _a.sent();
                        chai_1.expect(account.birthdate.getTime()).equal(new Date('2000-02-03').getTime());
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not update birthday if it has invalid value', function () { return __awaiter(void 0, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = { _id: mocks_1.genObjectId(), save: sinon_1.stub(), birthdate: new Date(321) };
                        findAccount.resolves(account);
                        return [4 /*yield*/, updateAccount(account, { name: 'foo', birthdate: '0123-00-01' })];
                    case 1:
                        _a.sent();
                        chai_1.expect(account.birthdate.getTime()).equal(new Date(321).getTime());
                        return [2 /*return*/];
                }
            });
        }); });
        it('logs birthday change', function () { return __awaiter(void 0, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = { _id: mocks_1.genObjectId(), name: 'bar', save: sinon_1.stub(), birthdate: new Date(12345) };
                        findAccount.resolves(account);
                        return [4 /*yield*/, updateAccount(account, { name: 'bar', birthdate: '2000-02-03' })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(log, account._id, 'Changed birthdate 1970-01-01 (49yo) => 2000-02-03 (19yo)');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateSettings()', function () {
        var findAccount;
        var updateOne;
        var updateSettings;
        beforeEach(function () {
            findAccount = sinon_1.stub();
            updateOne = sinon_1.stub(db.Account, 'updateOne').returns({ exec: sinon_1.stub().resolves() });
            updateSettings = account_1.createUpdateSettings(findAccount);
        });
        afterEach(function () {
            updateOne.restore();
        });
        it('returns account data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _id, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _id = mocks_1.genObjectId();
                        findAccount.resolves({
                            _id: _id,
                            name: 'foo',
                            birthdate: new Date(123),
                            birthyear: 123,
                            roles: ['mod'],
                            settings: { foo: 'bar' },
                            characterCount: 4,
                            flags: 1,
                            supporter: 1,
                            save: function () { },
                        });
                        return [4 /*yield*/, updateSettings(mocks_1.account({}), {})];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql({
                            id: _id.toString(),
                            name: 'foo',
                            birthdate: '1970-01-01',
                            birthyear: 123,
                            roles: ['mod'],
                            settings: { foo: 'bar' },
                            characterCount: 4,
                            flags: 0,
                            supporter: 1,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates account settings', function () { return __awaiter(void 0, void 0, void 0, function () {
            var save, acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        save = sinon_1.stub();
                        acc = { _id: mocks_1.genObjectId(), save: save, settings: undefined };
                        findAccount.resolves(acc);
                        return [4 /*yield*/, updateSettings(mocks_1.account({ _id: acc._id }), {
                                filterSwearWords: true,
                                filterCyrillic: true,
                                ignorePartyInvites: true,
                            })];
                    case 1:
                        _a.sent();
                        chai_1.expect(acc.settings).eql({
                            filterSwearWords: true,
                            filterCyrillic: true,
                            ignorePartyInvites: true,
                        });
                        sinon_1.assert.calledWith(updateOne, { _id: acc._id }, {
                            settings: {
                                filterSwearWords: true,
                                filterCyrillic: true,
                                ignorePartyInvites: true,
                            }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('merges account settings', function () { return __awaiter(void 0, void 0, void 0, function () {
            var save, acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        save = sinon_1.stub();
                        acc = {
                            _id: mocks_1.genObjectId(),
                            save: save,
                            settings: {
                                filterSwearWords: true,
                                filterCyrillic: true,
                                ignorePartyInvites: true,
                            },
                        };
                        findAccount.resolves(acc);
                        return [4 /*yield*/, updateSettings(mocks_1.account({ _id: acc._id }), {
                                filterSwearWords: false,
                                filterCyrillic: true,
                                ignorePartyInvites: true,
                            })];
                    case 1:
                        _a.sent();
                        chai_1.expect(acc.settings).eql({
                            filterSwearWords: false,
                            filterCyrillic: true,
                            ignorePartyInvites: true,
                        });
                        sinon_1.assert.calledWith(updateOne, { _id: acc._id }, {
                            settings: {
                                filterSwearWords: false,
                                filterCyrillic: true,
                                ignorePartyInvites: true,
                            }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('ignores missing fields', function () { return __awaiter(void 0, void 0, void 0, function () {
            var acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acc = { _id: mocks_1.genObjectId(), settings: undefined };
                        findAccount.resolves(acc);
                        return [4 /*yield*/, updateSettings(mocks_1.account({ _id: acc._id }), {})];
                    case 1:
                        _a.sent();
                        chai_1.expect(acc.settings).eql({});
                        sinon_1.assert.calledWith(updateOne, { _id: acc._id }, { settings: {} });
                        return [2 /*return*/];
                }
            });
        }); });
        it('ignores missing settings', function () { return __awaiter(void 0, void 0, void 0, function () {
            var acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acc = { _id: mocks_1.genObjectId(), settings: undefined };
                        findAccount.resolves(acc);
                        return [4 /*yield*/, updateSettings(mocks_1.account({ _id: acc._id }), undefined)];
                    case 1:
                        _a.sent();
                        chai_1.expect(acc.settings).eql({});
                        sinon_1.assert.calledWith(updateOne, { _id: acc._id }, { settings: {} });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('removeSite()', function () {
        var findAuth;
        var countAuths;
        var log;
        var removeSite;
        var updateOne;
        beforeEach(function () {
            findAuth = sinon_1.stub();
            countAuths = sinon_1.stub();
            log = sinon_1.stub();
            updateOne = sinon_1.stub(db.Auth, 'updateOne').returns({ exec: function () { return sinon_1.stub().resolves(); } });
            removeSite = account_1.createRemoveSite(findAuth, countAuths, log);
        });
        afterEach(function () {
            updateOne.restore();
        });
        it('returns empty object', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findAuth.resolves({});
                        countAuths.resolves(2);
                        return [4 /*yield*/, removeSite(mocks_1.account({}), 'SITE_ID')];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql({});
                        return [2 /*return*/];
                }
            });
        }); });
        it('disables auth', function () { return __awaiter(void 0, void 0, void 0, function () {
            var authId, accountId, auth, acc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authId = mocks_1.genObjectId();
                        accountId = mocks_1.genObjectId();
                        auth = { _id: authId, disabled: false };
                        acc = mocks_1.account({ _id: accountId });
                        findAuth.withArgs('SITE_ID', accountId).resolves(auth);
                        countAuths.withArgs(accountId).resolves(2);
                        return [4 /*yield*/, removeSite(acc, 'SITE_ID')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(updateOne, { _id: authId }, { disabled: true });
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws if siteId is not string', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findAuth.resolves(mocks_1.account({}));
                        countAuths.resolves(2);
                        return [4 /*yield*/, chai_1.expect(removeSite(mocks_1.account({}), {}))
                                .rejectedWith('Social account not found')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws if auth does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findAuth.resolves(undefined);
                        countAuths.resolves(2);
                        return [4 /*yield*/, chai_1.expect(removeSite(mocks_1.account({}), 'SITE_ID'))
                                .rejectedWith('Social account not found')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws if auth is disabled', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findAuth.resolves({ disabled: true });
                        countAuths.resolves(2);
                        return [4 /*yield*/, chai_1.expect(removeSite(mocks_1.account({}), 'SITE_ID'))
                                .rejectedWith('Social account not found')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws if user has only one auth', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findAuth.resolves({});
                        countAuths.resolves(1);
                        return [4 /*yield*/, chai_1.expect(removeSite(mocks_1.account({}), 'SITE_ID'))
                                .rejectedWith('Cannot remove your only one social account')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('logs auth removal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var accountId, authId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accountId = mocks_1.genObjectId();
                        authId = mocks_1.genObjectId();
                        findAuth.resolves({ _id: authId, name: 'foo' });
                        countAuths.resolves(2);
                        return [4 /*yield*/, removeSite(mocks_1.account({ _id: accountId }), 'SITE_ID')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(log, accountId, "removed auth: foo [" + authId + "]");
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=account.spec.js.map