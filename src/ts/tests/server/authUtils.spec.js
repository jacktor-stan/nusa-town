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
require("../lib");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var mongoose_1 = require("mongoose");
var authUtils_1 = require("../../server/authUtils");
var mocks_1 = require("../mocks");
function profile(options) {
    return options;
}
describe('authUtils', function () {
    describe('updateAuthInfo()', function () {
        it('updates url and name fields', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateAuth, a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateAuth = sinon_1.stub();
                        a = mocks_1.auth({ _id: 'bar' });
                        return [4 /*yield*/, authUtils_1.updateAuthInfo(updateAuth, a, profile({ username: 'foo', url: 'bar' }), undefined)];
                    case 1:
                        _a.sent();
                        chai_1.expect(a.name).eql('foo');
                        chai_1.expect(a.url).eql('bar');
                        sinon_1.assert.calledWith(updateAuth, 'bar', { name: 'foo', url: 'bar' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates email field', function () { return __awaiter(void 0, void 0, void 0, function () {
            var a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        a = mocks_1.auth({ emails: ['a'] });
                        return [4 /*yield*/, authUtils_1.updateAuthInfo(sinon_1.stub(), a, profile({ emails: ['b', 'c'] }), undefined)];
                    case 1:
                        _a.sent();
                        chai_1.expect(a.emails).eql(['a', 'b', 'c']);
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates email field (from empty)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateAuth, a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateAuth = sinon_1.stub();
                        a = mocks_1.auth({ _id: 'bar' });
                        return [4 /*yield*/, authUtils_1.updateAuthInfo(updateAuth, a, profile({ emails: ['b', 'c'] }), undefined)];
                    case 1:
                        _a.sent();
                        chai_1.expect(a.emails).eql(['b', 'c']);
                        sinon_1.assert.calledWith(updateAuth, 'bar', { emails: ['b', 'c'] });
                        return [2 /*return*/];
                }
            });
        }); });
        it('saves updated auth', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateAuth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateAuth = sinon_1.stub();
                        return [4 /*yield*/, authUtils_1.updateAuthInfo(updateAuth, mocks_1.auth({ _id: 'bar' }), profile({ username: 'foo' }), undefined)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(updateAuth, 'bar', { name: 'foo' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates account if passed account ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var a, accountId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        a = mocks_1.auth({});
                        accountId = mocks_1.genId();
                        return [4 /*yield*/, authUtils_1.updateAuthInfo(sinon_1.stub(), a, profile({ username: 'foo', url: 'bar' }), accountId)];
                    case 1:
                        _a.sent();
                        chai_1.expect(a.account).eql(mongoose_1.Types.ObjectId(accountId));
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not save auth if nothing changed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateAuth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateAuth = sinon_1.stub();
                        return [4 /*yield*/, authUtils_1.updateAuthInfo(updateAuth, mocks_1.auth({ _id: 'bar', name: 'foo' }), profile({ username: 'foo' }), undefined)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(updateAuth);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does nothing if email list is the same', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateAuth, a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateAuth = sinon_1.stub();
                        a = mocks_1.auth({ _id: 'bar', emails: ['a', 'b'] });
                        return [4 /*yield*/, authUtils_1.updateAuthInfo(updateAuth, a, profile({ emails: ['b', 'a'] }), undefined)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(updateAuth);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does nothing if auth is undefined', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateAuth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateAuth = sinon_1.stub();
                        return [4 /*yield*/, authUtils_1.updateAuthInfo(updateAuth, undefined, profile({}), undefined)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(updateAuth);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=authUtils.spec.js.map