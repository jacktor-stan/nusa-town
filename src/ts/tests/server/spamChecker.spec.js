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
var lib_1 = require("../lib");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var counter_1 = require("../../server/services/counter");
var utils_1 = require("../../common/utils");
var stringUtils_1 = require("../../common/stringUtils");
var constants_1 = require("../../common/constants");
var spamChecker_1 = require("../../server/spamChecker");
var mocks_1 = require("../mocks");
var reporting_1 = require("../../server/reporting");
function times(count, action) {
    return Promise.all(utils_1.times(count, action));
}
describe('SpamChecker', function () {
    describe('check()', function () {
        var client;
        var settings;
        var spamCounter;
        var rapidCounter;
        var countSpamming;
        var timeoutAccount;
        var spamChecker;
        beforeEach(function () {
            client = mocks_1.mockClient();
            client.account.createdAt = utils_1.fromNow(-2 * constants_1.DAY);
            settings = {
                reportSpam: true,
                autoBanSpamming: true,
            };
            spamCounter = new counter_1.CounterService(1000);
            rapidCounter = new counter_1.CounterService(1000);
            countSpamming = sinon_1.stub().resolves();
            timeoutAccount = sinon_1.stub().resolves();
            spamChecker = lib_1.createFunctionWithPromiseHandler(spamChecker_1.createSpamChecker, spamCounter, rapidCounter, countSpamming, timeoutAccount);
        });
        it('does not count spam for mods', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client.isMod = true;
                        return [4 /*yield*/, times(10, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [2 /*return*/];
                }
            });
        }); });
        it('counts spam if reporting is turned off', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settings.reportSpam = false;
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(countSpamming);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not report if reporting is turned off', function () { return __awaiter(void 0, void 0, void 0, function () {
            var warn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settings.reportSpam = false;
                        warn = sinon_1.stub(client.reporter, 'warn');
                        return [4 /*yield*/, times(10, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(warn);
                        return [2 /*return*/];
                }
            });
        }); });
        it('reports spam', function () { return __awaiter(void 0, void 0, void 0, function () {
            var warn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        warn = sinon_1.stub(client.reporter, 'warn');
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(warn, 'Spam', 'long_spam_text');
                        return [2 /*return*/];
                }
            });
        }); });
        it("counts spam after " + spamChecker_1.REPORT_AFTER_LIMIT + " messages", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT - 1, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [4 /*yield*/, times(1, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("counts spam after " + spamChecker_1.REPORT_AFTER_LIMIT + " commands", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT - 1, function () { return spamChecker(client, '/random 1000', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [4 /*yield*/, times(1, function () { return spamChecker(client, '/random 1000', settings); })];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("counts spam after " + spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.SHORT_MESSAGE_MUL + " messages for short messages", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.SHORT_MESSAGE_MUL - 1, function () { return spamChecker(client, 'short', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [4 /*yield*/, times(1, function () { return spamChecker(client, 'short', settings); })];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("counts spam after " + spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.TINY_MESSAGE_MUL + " messages for tiny messages", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.TINY_MESSAGE_MUL - 1, function () { return spamChecker(client, 'abc', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [4 /*yield*/, times(1, function () { return spamChecker(client, 'abc', settings); })];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("counts spam after " + spamChecker_1.REPORT_AFTER_LIMIT + " messages mixed with other messages", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT - 1, function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, spamChecker(client, '1long_spam_text1', settings)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, spamChecker(client, '2long_spam_text2', settings)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [4 /*yield*/, times(1, function () { return spamChecker(client, '1long_spam_text1', settings); })];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("counts spam after " + spamChecker_1.REPORT_AFTER_LIMIT + " message mixed with " + spamChecker_1.REPORT_AFTER_LIMIT + " other messages", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT, function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, spamChecker(client, '1long_spam_text1', settings)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, spamChecker(client, '2long_spam_text2', settings)];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, spamChecker(client, '3long_spam_text3', settings)];
                                    case 3:
                                        _a.sent();
                                        return [4 /*yield*/, spamChecker(client, '4long_spam_text4', settings)];
                                    case 4:
                                        _a.sent();
                                        return [4 /*yield*/, spamChecker(client, '5long_spam_text5', settings)];
                                    case 5:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("forgets message after " + spamChecker_1.REPORT_AFTER_LIMIT + " other messages", function () { return __awaiter(void 0, void 0, void 0, function () {
            var i, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, spamChecker(client, 'long_spam_text1', settings)];
                    case 1:
                        _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < spamChecker_1.REPORT_AFTER_LIMIT)) return [3 /*break*/, 10];
                        return [4 /*yield*/, spamChecker(client, i + '2long_spam_text2', settings)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, spamChecker(client, i + '3long_spam_text3', settings)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, spamChecker(client, i + '4long_spam_text4', settings)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, spamChecker(client, i + '5long_spam_text5', settings)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, spamChecker(client, i + '6long_spam_text6', settings)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, spamChecker(client, i + '7long_spam_text7', settings)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 2];
                    case 10:
                        i = 2;
                        _a.label = 11;
                    case 11:
                        if (!(i < spamChecker_1.REPORT_AFTER_LIMIT)) return [3 /*break*/, 14];
                        return [4 /*yield*/, spamChecker(client, 'long_spam_text1', settings)];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 11];
                    case 14:
                        sinon_1.assert.notCalled(countSpamming);
                        return [2 /*return*/];
                }
            });
        }); });
        it("counts spam with timeout if autoBanSpamming option is on and counter is " + spamChecker_1.MUTE_AFTER_LIMIT, function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settings.autoBanSpamming = true;
                        sinon_1.stub(spamCounter, 'add').returns({ count: spamChecker_1.MUTE_AFTER_LIMIT, items: ['long_spam_text'], date: 0 });
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it('adds entry to spam counter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var add;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        add = sinon_1.stub(spamCounter, 'add').returns({ count: 0, items: [], date: 0 });
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(add, client.accountId, 'long_spam_text', 1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('adds entry to spam counter with increment of 2 for max length message', function () { return __awaiter(void 0, void 0, void 0, function () {
            var add, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        add = sinon_1.stub(spamCounter, 'add').returns({ count: 0, items: [], date: 0 });
                        message = stringUtils_1.randomString(constants_1.SAY_MAX_LENGTH);
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT, function () { return spamChecker(client, message, {}); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(add, client.accountId, message, 2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('adds entry to spam counter with increment of 2 for long messages', function () { return __awaiter(void 0, void 0, void 0, function () {
            var add, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        add = sinon_1.stub(spamCounter, 'add').returns({ count: 0, items: [], date: 0 });
                        message = 'AAAAALGIRNGLRINGLISAHGLEISRHGLISRHGLISRHGLISRHGISRXY';
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT, function () { return spamChecker(client, message, {}); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(add, client.accountId, message, 2);
                        return [2 /*return*/];
                }
            });
        }); });
        var longLimit = Math.ceil(spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.LONG_MESSAGE_MUL);
        it("counts spam after " + longLimit + " LONG messages", function () { return __awaiter(void 0, void 0, void 0, function () {
            var longestMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        longestMessage = 'kgfdjhskgdfhgkdlufhgkdfghdfgudhrkughrdkughkdruhgkdurhgkdurhgkudh';
                        return [4 /*yield*/, times(longLimit - 1, function () { return spamChecker(client, longestMessage, {}); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [4 /*yield*/, times(1, function () { return spamChecker(client, longestMessage, {}); })];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("matches spam", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT - 1, function () { return spamChecker(client, "some message", {}); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [4 /*yield*/, times(1, function () { return spamChecker(client, "some message", {}); })];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it("matches partial spam ", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT - 1, function (i) { return spamChecker(client, "common message part " + i + " aaa", {}); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(countSpamming);
                        return [4 /*yield*/, times(1, function () { return spamChecker(client, "common message part x aaa", {}); })];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it('timeouts for spamming', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.MUTE_AFTER_LIMIT, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(timeoutAccount, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it('uses double timeout length is doubleTimeouts setting is set', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settings.doubleTimeouts = true;
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.MUTE_AFTER_LIMIT, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(timeoutAccount, client.accountId);
                        chai_1.expect(timeoutAccount.args[0][1].getTime()).greaterThan(utils_1.fromNow(reporting_1.SPAM_TIMEOUT * 1.9).getTime());
                        return [2 /*return*/];
                }
            });
        }); });
        it('reports timing out', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        system = sinon_1.stub(client.reporter, 'system');
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.MUTE_AFTER_LIMIT, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(system, 'Timed out for spamming');
                        return [2 /*return*/];
                }
            });
        }); });
        it('logs timing out if reporting is turned off', function () { return __awaiter(void 0, void 0, void 0, function () {
            var system, systemLog;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settings.reportSpam = false;
                        system = sinon_1.stub(client.reporter, 'system');
                        systemLog = sinon_1.stub(client.reporter, 'systemLog');
                        return [4 /*yield*/, times(spamChecker_1.REPORT_AFTER_LIMIT * spamChecker_1.MUTE_AFTER_LIMIT, function () { return spamChecker(client, 'long_spam_text', settings); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(systemLog, 'Timed out for spamming');
                        sinon_1.assert.notCalled(system);
                        return [2 /*return*/];
                }
            });
        }); });
        it('counts a lot of rapid messages as spam', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, times(spamChecker_1.RAPID_MESSAGE_COUNT + 1, function (i) { return spamChecker(client, i + '-' + i, {}); })];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(countSpamming, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=spamChecker.spec.js.map