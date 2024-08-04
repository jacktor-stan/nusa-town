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
exports.clearOrigins = exports.clearOriginsForAccounts = exports.clearOriginsForAccount = exports.addOrigin = exports.removeOrigins = exports.removeAllOrigins = exports.getOriginStats = void 0;
var Bluebird = require("bluebird");
var lodash_1 = require("lodash");
var constants_1 = require("../../common/constants");
var utils_1 = require("../../common/utils");
var db_1 = require("../db");
function getOriginStats(accounts) {
    return __awaiter(this, void 0, void 0, function () {
        var totalOrigins, totalOriginsIP4, totalOriginsIP6, distribution, uniques, duplicates, _i, accounts_1, account, _a, _b, origin_1, count, uniqueOrigins, duplicateOrigins, singleOrigins;
        return __generator(this, function (_c) {
            totalOrigins = 0;
            totalOriginsIP4 = 0;
            totalOriginsIP6 = 0;
            distribution = [];
            uniques = new Set();
            duplicates = new Set();
            for (_i = 0, accounts_1 = accounts; _i < accounts_1.length; _i++) {
                account = accounts_1[_i];
                if (account.origins) {
                    for (_a = 0, _b = account.origins; _a < _b.length; _a++) {
                        origin_1 = _b[_a];
                        totalOrigins++;
                        if (uniques.has(origin_1.ip)) {
                            duplicates.add(origin_1.ip);
                        }
                        else {
                            uniques.add(origin_1.ip);
                        }
                        if (origin_1.ip.indexOf(':') !== -1) {
                            totalOriginsIP6++;
                        }
                        else {
                            totalOriginsIP4++;
                        }
                    }
                }
                count = account.origins ? account.origins.length : 0;
                while (distribution.length <= count) {
                    distribution.push(0);
                }
                distribution[count]++;
            }
            uniqueOrigins = uniques.size;
            duplicateOrigins = duplicates.size;
            singleOrigins = uniqueOrigins - duplicateOrigins;
            return [2 /*return*/, {
                    uniqueOrigins: uniqueOrigins,
                    duplicateOrigins: duplicateOrigins,
                    singleOrigins: singleOrigins,
                    totalOrigins: totalOrigins,
                    totalOriginsIP4: totalOriginsIP4,
                    totalOriginsIP6: totalOriginsIP6,
                    distribution: distribution
                }];
        });
    });
}
exports.getOriginStats = getOriginStats;
function removeAllOrigins(service, accountId) {
    service.removeOriginsFromAccount(accountId);
    return db_1.updateAccount(accountId, { origins: [] });
}
exports.removeAllOrigins = removeAllOrigins;
function removeOrigins(service, accountId, ips) {
    service.removeOriginsFromAccount(accountId, ips);
    return db_1.updateAccount(accountId, { $pull: { origins: { ip: { $in: ips } } } });
}
exports.removeOrigins = removeOrigins;
function addOrigin(accountId, _a) {
    var ip = _a.ip, country = _a.country;
    return db_1.updateAccount(accountId, { $push: { origins: { ip: ip, country: country, last: new Date() } } });
}
exports.addOrigin = addOrigin;
function clearOriginsForAccount(service, accountId, options) {
    return __awaiter(this, void 0, void 0, function () {
        var account, ips;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    account = service.accounts.get(accountId);
                    if (!account) return [3 /*break*/, 2];
                    ips = getOriginsToRemove(account, options).ips;
                    return [4 /*yield*/, removeOrigins(service, accountId, ips)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.clearOriginsForAccount = clearOriginsForAccount;
function clearOriginsForAccounts(service, accounts, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Bluebird.map(accounts, function (id) { return clearOriginsForAccount(service, id, options); }, { concurrency: 4 })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.clearOriginsForAccounts = clearOriginsForAccounts;
function clearOrigins(service, count, andHigher, options) {
    return __awaiter(this, void 0, void 0, function () {
        var origins;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    origins = service.accounts.items
                        .filter(function (a) { return a.originsRefs && (andHigher ? a.originsRefs.length >= count : a.originsRefs.length === count); })
                        .map(function (a) { return getOriginsToRemove(a, options); })
                        .filter(function (_a) {
                        var ips = _a.ips;
                        return !!ips.length;
                    });
                    return [4 /*yield*/, Bluebird.map(origins, function (o) { return removeOrigins(service, o.accountId, o.ips); }, { concurrency: 4 })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.clearOrigins = clearOrigins;
var isBanned = function (origin) { return origin.ban || origin.mute || origin.shadow; };
function getOriginsToRemove(account, _a) {
    var old = _a.old, singles = _a.singles, trim = _a.trim, veryOld = _a.veryOld, country = _a.country;
    var date = utils_1.fromNow((veryOld ? -90 : -14) * constants_1.DAY).getTime();
    var originsRefs = account.originsRefs || [];
    var filtered = country ?
        originsRefs.filter(function (_a) {
            var origin = _a.origin;
            return origin.country === country;
        }) :
        originsRefs.filter(function (_a) {
            var last = _a.last, origin = _a.origin;
            return (!old || (!last || last.getTime() < date))
                && (!singles || origin.accounts.length === 1)
                && !isBanned(origin);
        });
    var ips = filtered.map(function (_a) {
        var origin = _a.origin;
        return origin.ip;
    });
    if (trim) {
        ips.push.apply(ips, lodash_1.difference(originsRefs.map(function (_a) {
            var origin = _a.origin;
            return origin.ip;
        }), ips).slice(10));
    }
    return { accountId: account._id, ips: ips };
}
//# sourceMappingURL=origins.js.map