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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startClearVeryOldOrigns = exports.startClearTo10Origns = exports.startUpdatePastSupporters = exports.startAccountAlertsCleanup = exports.startPotentialDuplicatesCleanup = exports.startSupporterInvitesCleanup = exports.startCollectingUsersVisitedCount = exports.startClearOldIgnores = exports.startStrayAuthsCleanup = exports.startMergesCleanup = exports.startBansCleanup = exports.pollCertificateExpirationDate = exports.pollMemoryUsage = exports.pollDiskSpace = exports.pollServers = exports.pollImmediate = exports.poll = exports.updatePastSupporters = void 0;
var fs = require("fs");
var Bluebird = require("bluebird");
var utils_1 = require("../common/utils");
var logger_1 = require("./logger");
var db_1 = require("./db");
var serverUtils_1 = require("./serverUtils");
var constants_1 = require("../common/constants");
var internal_1 = require("./internal");
var paths = require("./paths");
var supporterInvites_1 = require("./services/supporterInvites");
var origins_1 = require("./api/origins");
function clearOldIgnores() {
    return __awaiter(this, void 0, void 0, function () {
        var start;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    return [4 /*yield*/, db_1.updateAccounts({
                            ignores: { $exists: true, $not: { $size: 0 } },
                            lastVisit: { $lt: utils_1.fromNow(-constants_1.YEAR) },
                        }, { ignores: [] })];
                case 1:
                    _a.sent();
                    logger_1.logPerformance("[async] clearOldIgnores (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    });
}
function cleanupBanField(field) {
    return __awaiter(this, void 0, void 0, function () {
        var start;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    start = Date.now();
                    return [4 /*yield*/, db_1.updateAccounts((_a = {}, _a[field] = { $exists: true, $gt: 0, $lt: Date.now() }, _a), { $unset: (_b = {}, _b[field] = 1, _b) })];
                case 1:
                    _c.sent();
                    logger_1.logPerformance("[async] cleanupBanField (" + field + ") (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    });
}
function cleanupBans() {
    return __awaiter(this, void 0, void 0, function () {
        var start;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    return [4 /*yield*/, cleanupBanField('ban')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, cleanupBanField('shadow')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, cleanupBanField('mute')];
                case 3:
                    _a.sent();
                    logger_1.logPerformance("[async] cleanupBans (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    });
}
function cleanupMerges() {
    return __awaiter(this, void 0, void 0, function () {
        var start, date;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    date = utils_1.fromNow(-30 * constants_1.DAY);
                    return [4 /*yield*/, db_1.updateAccounts({ merges: { $exists: true, $not: { $size: 0 } } }, { $pull: { merges: { date: { $lt: date } } } })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.updateAccounts({ merges: { $exists: true, $size: 0 } }, { $unset: { merges: 1 } })];
                case 2:
                    _a.sent();
                    logger_1.logPerformance("[async] cleanupMerges (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    });
}
function cleanupAccountAlerts() {
    return __awaiter(this, void 0, void 0, function () {
        var start;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    return [4 /*yield*/, db_1.updateAccounts({ alert: { $exists: true }, 'alert.expires': { $lt: new Date() } }, { $unset: { alert: 1 } })];
                case 1:
                    _a.sent();
                    logger_1.logPerformance("[async] cleanupAccountAlerts (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    });
}
function updatePastSupporters() {
    return __awaiter(this, void 0, void 0, function () {
        var start, auths, accounts, shouldBeFlagged, areFlagged, _i, auths_1, auth, _a, accounts_1, account, _b, auths_2, auth, _c, accounts_2, account;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    start = Date.now();
                    return [4 /*yield*/, db_1.Auth.find({
                            pledged: { $exists: true, $gt: 0 },
                            disabled: { $ne: true },
                            banned: { $ne: true }
                        }, 'account').exec()];
                case 1:
                    auths = _d.sent();
                    return [4 /*yield*/, db_1.Account.find({
                            supporter: { $exists: true, $bitsAllSet: 256 /* PastSupporter */ }
                        }, '_id').exec()];
                case 2:
                    accounts = _d.sent();
                    shouldBeFlagged = new Set();
                    areFlagged = new Set();
                    for (_i = 0, auths_1 = auths; _i < auths_1.length; _i++) {
                        auth = auths_1[_i];
                        if (auth.account) {
                            shouldBeFlagged.add(auth.account.toString());
                        }
                    }
                    for (_a = 0, accounts_1 = accounts; _a < accounts_1.length; _a++) {
                        account = accounts_1[_a];
                        areFlagged.add(account._id.toString());
                    }
                    _b = 0, auths_2 = auths;
                    _d.label = 3;
                case 3:
                    if (!(_b < auths_2.length)) return [3 /*break*/, 6];
                    auth = auths_2[_b];
                    if (!auth.account) return [3 /*break*/, 5];
                    if (!!areFlagged.has(auth.account.toString())) return [3 /*break*/, 5];
                    return [4 /*yield*/, db_1.Account.updateOne({ _id: auth.account }, { $bit: { supporter: { or: 256 /* PastSupporter */ } } }).exec()];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6:
                    _c = 0, accounts_2 = accounts;
                    _d.label = 7;
                case 7:
                    if (!(_c < accounts_2.length)) return [3 /*break*/, 10];
                    account = accounts_2[_c];
                    if (!!shouldBeFlagged.has(account._id.toString())) return [3 /*break*/, 9];
                    return [4 /*yield*/, db_1.Account.updateOne({ _id: account._id }, { $bit: { supporter: { and: ~256 /* PastSupporter */ } } }).exec()];
                case 8:
                    _d.sent();
                    _d.label = 9;
                case 9:
                    _c++;
                    return [3 /*break*/, 7];
                case 10:
                    logger_1.logPerformance("[async] cleanupAccountAlerts (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    });
}
exports.updatePastSupporters = updatePastSupporters;
var cleanupStrayAuths = function (removedDocument) {
    return function () { return __awaiter(void 0, void 0, void 0, function () {
        var start, date, query, items;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    date = utils_1.fromNow(-1 * constants_1.DAY);
                    query = { account: { $exists: false }, updatedAt: { $lt: date }, createdAt: { $lt: date } };
                    return [4 /*yield*/, db_1.queryAuths(query, '_id')];
                case 1:
                    items = _a.sent();
                    return [4 /*yield*/, db_1.Auth.deleteMany(query).exec()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, Bluebird.map(items, function (item) { return removedDocument('auths', item._id.toString()); }, { concurrency: 4 })];
                case 3:
                    _a.sent();
                    logger_1.logPerformance("[async] cleanupAccountAlerts (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    }); };
};
function updateServerState(server) {
    return __awaiter(this, void 0, void 0, function () {
        var state, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, server.api.state()];
                case 1:
                    state = _b.sent();
                    Object.assign(server.state, state);
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    server.state.dead = true;
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var lastVisitedTodayCheck = (new Date()).getDate();
function countUsersVisitedToday() {
    return __awaiter(this, void 0, void 0, function () {
        var start, day, statsFile, count, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    day = (new Date()).getDate();
                    if (!(lastVisitedTodayCheck !== day)) return [3 /*break*/, 3];
                    lastVisitedTodayCheck = day;
                    statsFile = paths.pathTo('settings', "user-counts.log");
                    return [4 /*yield*/, db_1.Account.countDocuments({ lastVisit: { $gt: utils_1.fromNow(-1 * constants_1.DAY) } }).exec()];
                case 1:
                    count = _a.sent();
                    json = JSON.stringify({ count: count, date: (new Date()).toISOString() });
                    return [4 /*yield*/, fs.appendFileAsync(statsFile, json + "\n", 'utf8')];
                case 2:
                    _a.sent();
                    logger_1.logPerformance("[async] countUsersVisitedToday (" + (Date.now() - start) + "ms)");
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function mergePotentialDuplicates(service) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!internal_1.loginServers[0].state.autoMergeDuplicates) return [3 /*break*/, 2];
                    return [4 /*yield*/, service.mergePotentialDuplicates()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function poll(action, delayTime) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    return [4 /*yield*/, utils_1.delay(delayTime)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, action()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 5];
                case 4:
                    poll(action, delayTime);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.poll = poll;
function pollImmediate(action, delayTime) {
    return __awaiter(this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 5]);
                    return [4 /*yield*/, action()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 2:
                    e_2 = _a.sent();
                    console.error(e_2);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, utils_1.delay(delayTime)];
                case 4:
                    _a.sent();
                    poll(action, delayTime);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.pollImmediate = pollImmediate;
function pollServers() {
    return poll(function () { return Promise.all(__spreadArray(__spreadArray([], internal_1.loginServers), internal_1.servers).map(updateServerState)); }, 1 * constants_1.SECOND);
}
exports.pollServers = pollServers;
var pollDiskSpace = function () { return pollImmediate(function () {
    return serverUtils_1.getDiskSpace().then(function (value) { return internal_1.serverStatus.diskSpace = value; });
}, constants_1.HOUR); };
exports.pollDiskSpace = pollDiskSpace;
var pollMemoryUsage = function () { return pollImmediate(function () {
    return serverUtils_1.getMemoryUsage().then(function (value) { return internal_1.serverStatus.memoryUsage = value; });
}, 10 * constants_1.MINUTE); };
exports.pollMemoryUsage = pollMemoryUsage;
var pollCertificateExpirationDate = function () { return pollImmediate(function () {
    return serverUtils_1.getCertificateExpirationDate().then(function (value) { return internal_1.serverStatus.certificateExpiration = value; });
}, constants_1.HOUR); };
exports.pollCertificateExpirationDate = pollCertificateExpirationDate;
var startBansCleanup = function () { return poll(cleanupBans, constants_1.DAY + 10 * constants_1.MINUTE); };
exports.startBansCleanup = startBansCleanup;
var startMergesCleanup = function () { return poll(cleanupMerges, constants_1.DAY + 15 * constants_1.MINUTE); };
exports.startMergesCleanup = startMergesCleanup;
var startStrayAuthsCleanup = function (removedDocument) {
    return poll(cleanupStrayAuths(removedDocument), constants_1.DAY + 35 * constants_1.MINUTE);
};
exports.startStrayAuthsCleanup = startStrayAuthsCleanup;
var startClearOldIgnores = function () { return poll(clearOldIgnores, constants_1.DAY + 20 * constants_1.MINUTE); };
exports.startClearOldIgnores = startClearOldIgnores;
var startCollectingUsersVisitedCount = function () { return poll(countUsersVisitedToday, 10 * constants_1.MINUTE); };
exports.startCollectingUsersVisitedCount = startCollectingUsersVisitedCount;
var startSupporterInvitesCleanup = function () { return poll(function () { return supporterInvites_1.updateSupporterInvites(db_1.SupporterInvite); }, constants_1.HOUR); };
exports.startSupporterInvitesCleanup = startSupporterInvitesCleanup;
var startPotentialDuplicatesCleanup = function (service) {
    return poll(function () { return mergePotentialDuplicates(service); }, 10 * constants_1.MINUTE);
};
exports.startPotentialDuplicatesCleanup = startPotentialDuplicatesCleanup;
var startAccountAlertsCleanup = function () { return poll(cleanupAccountAlerts, constants_1.DAY + 25 * constants_1.MINUTE); };
exports.startAccountAlertsCleanup = startAccountAlertsCleanup;
var startUpdatePastSupporters = function () { return poll(updatePastSupporters, constants_1.DAY + 30 * constants_1.MINUTE); };
exports.startUpdatePastSupporters = startUpdatePastSupporters;
function startClearTo10Origns(adminService) {
    var _this = this;
    return poll(function () { return __awaiter(_this, void 0, void 0, function () {
        var start;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!adminService.loaded) return [3 /*break*/, 2];
                    start = Date.now();
                    return [4 /*yield*/, origins_1.clearOrigins(adminService, 10, true, { old: false, singles: true, trim: true })];
                case 1:
                    _a.sent();
                    logger_1.logPerformance("[async] startClearTo10Origns (" + (Date.now() - start) + "ms)");
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, constants_1.DAY + 35 * constants_1.MINUTE);
}
exports.startClearTo10Origns = startClearTo10Origns;
function startClearVeryOldOrigns(adminService) {
    var _this = this;
    return poll(function () { return __awaiter(_this, void 0, void 0, function () {
        var start;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!adminService.loaded) return [3 /*break*/, 2];
                    start = Date.now();
                    return [4 /*yield*/, origins_1.clearOrigins(adminService, 1, true, { old: true, singles: false, trim: false })];
                case 1:
                    _a.sent();
                    logger_1.logPerformance("[async] startClearVeryOldOrigns (" + (Date.now() - start) + "ms)");
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, constants_1.DAY + 50 * constants_1.MINUTE);
}
exports.startClearVeryOldOrigns = startClearVeryOldOrigns;
//# sourceMappingURL=polling.js.map