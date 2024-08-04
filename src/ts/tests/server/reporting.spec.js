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
var sinon_1 = require("sinon");
var counter_1 = require("../../server/services/counter");
var mocks_1 = require("../mocks");
var reporting_1 = require("../../server/reporting");
describe('reporting', function () {
    describe('reportSwears()', function () {
        var client;
        var counter;
        var settings;
        var reportSwearingAccount;
        var timeoutAccount;
        var reportSwears;
        beforeEach(function () {
            client = mocks_1.mockClient();
            counter = mocks_1.mock(counter_1.CounterService);
            settings = { filterSwears: true };
            reportSwearingAccount = sinon_1.stub().resolves();
            timeoutAccount = sinon_1.stub();
            reportSwears = lib_1.createFunctionWithPromiseHandler(reporting_1.createReportSwears, counter, reportSwearingAccount, timeoutAccount);
        });
        it('increments counter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var add;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        add = sinon_1.stub(counter, 'add').returns({ count: 0, items: [], date: 0 });
                        return [4 /*yield*/, reportSwears(client, 'test', settings)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(add, client.accountId, 'test');
                        return [2 /*return*/];
                }
            });
        }); });
        describe('after excceded limit', function () {
            beforeEach(function () {
                sinon_1.stub(counter, 'add').returns({ count: 6, items: ['test'], date: 0 });
            });
            it('reports swearing', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, reportSwears(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(reportSwearingAccount, client.accountId);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('timeouts account for 10 hours', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            settings.autoBanSwearing = true;
                            return [4 /*yield*/, reportSwears(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(timeoutAccount, client.accountId); // , fromNow(10 * HOUR)
                            return [2 /*return*/];
                    }
                });
            }); });
            it('doesnt timeout account if autoBanSwearing is false', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, reportSwears(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.notCalled(timeoutAccount);
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
                            settings.autoBanSwearing = true;
                            settings.reportSwears = true;
                            return [4 /*yield*/, reportSwears(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(system, 'Timed out for swearing', 'test', true);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not report timing out if turned off in settings', function () { return __awaiter(void 0, void 0, void 0, function () {
                var system;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            system = sinon_1.stub(client.reporter, 'system');
                            settings.autoBanSwearing = true;
                            settings.reportSwears = false;
                            return [4 /*yield*/, reportSwears(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(system, 'Timed out for swearing', 'test', false);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('reports swearing if not timed out', function () { return __awaiter(void 0, void 0, void 0, function () {
                var warn;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            warn = sinon_1.stub(client.reporter, 'warn');
                            return [4 /*yield*/, reportSwears(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(warn, 'Swearing', 'test');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not timeout if already muted', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            client.account.mute = -1;
                            settings.autoBanSwearing = true;
                            return [4 /*yield*/, reportSwears(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.notCalled(timeoutAccount);
                            return [2 /*return*/];
                    }
                });
            }); });
            // reports unhandled rejection
            it.skip('handles error', function () { return __awaiter(void 0, void 0, void 0, function () {
                var err, error;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            err = new Error('test1');
                            timeoutAccount.rejects(err);
                            error = sinon_1.stub(client.reporter, 'error');
                            settings.autoBanSwearing = true;
                            return [4 /*yield*/, reportSwears(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(error, err);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('reportForbidden()', function () {
        var client;
        var counter;
        var settings;
        var onTimeoutAccount;
        var reportForbidden;
        beforeEach(function () {
            client = mocks_1.mockClient();
            counter = mocks_1.mock(counter_1.CounterService);
            settings = {};
            onTimeoutAccount = sinon_1.stub().resolves();
            reportForbidden = lib_1.createFunctionWithPromiseHandler(reporting_1.createReportForbidden, counter, onTimeoutAccount);
        });
        it('increments counter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var add;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        add = sinon_1.stub(counter, 'add').returns({ count: 0, items: [], date: 0 });
                        return [4 /*yield*/, reportForbidden(client, 'test', settings)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(add, client.accountId, 'test');
                        return [2 /*return*/];
                }
            });
        }); });
        describe('after excceded limit', function () {
            beforeEach(function () {
                sinon_1.stub(counter, 'add').returns({ count: 12, items: ['test'], date: 0 });
            });
            it('timeouts if account is new', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            client.account.createdAt = new Date();
                            return [4 /*yield*/, reportForbidden(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(onTimeoutAccount, client.accountId);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('timeouts if autoBanSwearing is true', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            settings.autoBanSwearing = true;
                            return [4 /*yield*/, reportForbidden(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(onTimeoutAccount, client.accountId);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not timeout account if autoBanSwearing is false and account is old', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            client.account.createdAt = new Date(0);
                            return [4 /*yield*/, reportForbidden(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.notCalled(onTimeoutAccount);
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
                            settings.autoBanSwearing = true;
                            return [4 /*yield*/, reportForbidden(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(system, 'Timed out for forbidden messages', 'test');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('reports forbidden if not timed out', function () { return __awaiter(void 0, void 0, void 0, function () {
                var warn;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            warn = sinon_1.stub(client.reporter, 'warn');
                            settings.autoBanSwearing = false;
                            client.account.createdAt = new Date(0);
                            return [4 /*yield*/, reportForbidden(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(warn, 'Forbidden messages', 'test');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not timeout if already muted', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            client.account.mute = -1;
                            settings.autoBanSwearing = true;
                            return [4 /*yield*/, reportForbidden(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.notCalled(onTimeoutAccount);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('handles error', function () { return __awaiter(void 0, void 0, void 0, function () {
                var err, error;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            err = new Error('test2');
                            onTimeoutAccount.rejects(err);
                            error = sinon_1.stub(client.reporter, 'error');
                            settings.autoBanSwearing = true;
                            return [4 /*yield*/, reportForbidden(client, 'test', settings)];
                        case 1:
                            _a.sent();
                            sinon_1.assert.calledWith(error, err);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('reportInviteLimit()', function () {
        var client;
        var reportInviteLimitAccount;
        var report;
        beforeEach(function () {
            client = mocks_1.mockClient();
            reportInviteLimitAccount = sinon_1.stub().resolves();
            report = lib_1.createFunctionWithPromiseHandler(reporting_1.reportInviteLimit, reportInviteLimitAccount, 'Invite limit reached');
        });
        it('reports spamming account', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, report(client)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(reportInviteLimitAccount, client.accountId);
                        return [2 /*return*/];
                }
            });
        }); });
        it('reports error during invite limit reporting', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error, reporterError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = new Error('test3');
                        reportInviteLimitAccount.rejects(error);
                        reporterError = sinon_1.stub(client.reporter, 'error');
                        return [4 /*yield*/, report(client)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(reporterError, error);
                        return [2 /*return*/];
                }
            });
        }); });
        it('logs invite limit reached', function () { return __awaiter(void 0, void 0, void 0, function () {
            var systemLog;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reportInviteLimitAccount.resolves(5);
                        systemLog = sinon_1.stub(client.reporter, 'systemLog');
                        return [4 /*yield*/, report(client)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(systemLog, 'Invite limit reached');
                        return [2 /*return*/];
                }
            });
        }); });
        it('reports warning every tenth invite limit report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reporterWarn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reportInviteLimitAccount.resolves(10);
                        reporterWarn = sinon_1.stub(client.reporter, 'warn');
                        return [4 /*yield*/, report(client)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(reporterWarn, 'Invite limit reached (10)');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=reporting.spec.js.map