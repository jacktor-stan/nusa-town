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
exports.getDuplicateEmailNames = exports.getAllDuplicatesWithInfo = exports.getAllDuplicatesQuickInfo = exports.getDuplicateInfo = exports.getDuplicateAuths = exports.getDuplicateEmails = exports.getDuplicateEntries = void 0;
var lodash_1 = require("lodash");
var adminUtils_1 = require("../../common/adminUtils");
var constants_1 = require("../../common/constants");
var db_1 = require("../db");
var utils_1 = require("../../common/utils");
// get duplicate entries
var DUPLICATE_TIMEOUT = 1 * constants_1.HOUR;
var duplicateEntries = undefined;
var duplicateTimestamp = 0;
function getDuplicateEntries(accounts, force) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!duplicateEntries || force || (Date.now() - duplicateTimestamp) > DUPLICATE_TIMEOUT) {
                duplicateTimestamp = Date.now();
                duplicateEntries = __spreadArray([], getDuplicateEmails(accounts));
            }
            return [2 /*return*/, duplicateEntries];
        });
    });
}
exports.getDuplicateEntries = getDuplicateEntries;
function getDuplicateEmails(accounts) {
    var duplicates = [];
    var collect = adminUtils_1.duplicatesCollector(duplicates);
    accounts.forEach(function (a) { return a.emails !== undefined && a.emails.forEach(collect); });
    return duplicates;
}
exports.getDuplicateEmails = getDuplicateEmails;
function getDuplicateAuths(accounts) {
    var duplicates = [];
    var collect = adminUtils_1.duplicatesCollector(duplicates);
    accounts.forEach(function (a) { return a.auths !== undefined && a.auths.forEach(function (a) { return a.url && collect(a.url); }); });
    return duplicates;
}
exports.getDuplicateAuths = getDuplicateAuths;
// get duplicate info
function getDuplicateInfo(accountId, otherAccounts) {
    return __awaiter(this, void 0, void 0, function () {
        var ids, _a, chars, accounts, groups, account, userAgent;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ids = __spreadArray([accountId], otherAccounts);
                    return [4 /*yield*/, Promise.all([
                            db_1.Character.find({ account: ids }, 'account name').lean().exec(),
                            db_1.Account.find({ _id: ids }, '_id lastUserAgent').lean().exec(),
                        ])];
                case 1:
                    _a = _b.sent(), chars = _a[0], accounts = _a[1];
                    chars.forEach(function (c) { return c.name = c.name.toLowerCase(); });
                    groups = lodash_1.groupBy(chars, function (c) { return c.account; });
                    account = accounts.find(function (a) { return a._id.toString() === accountId; });
                    userAgent = account && account.lastUserAgent || '';
                    return [2 /*return*/, otherAccounts.map(function (id) {
                            var account = accounts.find(function (a) { return a._id.toString() === id; });
                            return {
                                account: id,
                                userAgent: (account && userAgent && account.lastUserAgent === userAgent) ? userAgent : '',
                                ponies: getDuplicateNames(groups[accountId], groups[id]),
                            };
                        })];
            }
        });
    });
}
exports.getDuplicateInfo = getDuplicateInfo;
function getDuplicateNames(mine, others) {
    if (mine === void 0) { mine = []; }
    if (others === void 0) { others = []; }
    return lodash_1.uniq(mine.filter(function (a) { return others.some(function (b) { return a.name === b.name; }); }).map(function (c) { return c.name; }));
}
// get all duplicates
function getAllDuplicatesQuickInfo(service, accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var duplicates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllDuplicates(service, accountId)];
                case 1:
                    duplicates = _a.sent();
                    return [2 /*return*/, {
                            generatedAt: Date.now(),
                            count: duplicates.length,
                            name: duplicates.some(function (d) { return !!d.name; }),
                            emails: duplicates.some(function (d) { return !!d.emails; }),
                            browserId: duplicates.some(function (d) { return !!d.browserId; }),
                            perma: duplicates.some(function (d) { return !!d.perma; }),
                        }];
            }
        });
    });
}
exports.getAllDuplicatesQuickInfo = getAllDuplicatesQuickInfo;
function getAllDuplicatesWithInfo(service, accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var duplicates, accountIds, duplicatesInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllDuplicates(service, accountId)];
                case 1:
                    duplicates = _a.sent();
                    accountIds = duplicates.map(function (x) { return x.account; });
                    return [4 /*yield*/, getDuplicateInfo(accountId, accountIds)];
                case 2:
                    duplicatesInfo = _a.sent();
                    duplicatesInfo.forEach(function (_a) {
                        var account = _a.account, ponies = _a.ponies, userAgent = _a.userAgent;
                        var duplicate = duplicates.find(function (d) { return d.account === account; });
                        if (duplicate) {
                            duplicate.ponies = ponies;
                            duplicate.userAgent = userAgent;
                        }
                    });
                    duplicates.forEach(function (d) { return d.ponies = d.ponies || []; });
                    return [2 /*return*/, duplicates];
            }
        });
    });
}
exports.getAllDuplicatesWithInfo = getAllDuplicatesWithInfo;
function getAllDuplicates(service, accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            account = service.accounts.get(accountId);
            if (!account) {
                return [2 /*return*/, []];
            }
            else {
                return [2 /*return*/, lodash_1.uniq(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], getDuplicatesByNote(service, account)), getDuplicatesByEmail(service, account)), getDuplicatesByBrowserId(service, account)), getDuplicates(account)))
                        .filter(function (a) { return a !== account; })
                        .map(function (a) { return adminUtils_1.createDuplicateResult(a, account); })
                        .sort(adminUtils_1.compareDuplicates)
                        .slice(0, 50)];
            }
            return [2 /*return*/];
        });
    });
}
function getDuplicates(account) {
    var accounts = [];
    var origins = [];
    utils_1.removeItem(accounts, account);
    collectDuplicates(accounts, origins, account, 3);
    return accounts;
}
function getDuplicatesByNote(service, account) {
    var linkedTo = lodash_1.compact(adminUtils_1.getIdsFromNote(account.note).map(function (id) { return service.accounts.get(id); }));
    var linkedFrom = service.getAccountsByNoteRef(account._id);
    return uniqueOtherAccounts(__spreadArray(__spreadArray([], linkedTo), linkedFrom), account);
}
function getDuplicatesByEmail(service, account) {
    var accounts = (account.emails || [])
        .map(adminUtils_1.emailName)
        .map(function (name) { return service.getAccountsByEmailName(name); });
    return uniqueOtherAccounts(utils_1.flatten(accounts), account);
}
function getDuplicatesByBrowserId(service, account) {
    var browserId = account.lastBrowserId;
    var accounts = browserId && service.getAccountsByBrowserId(browserId) || [];
    return uniqueOtherAccounts(accounts, account);
}
function uniqueOtherAccounts(accounts, exclude) {
    return lodash_1.uniq(accounts.filter(function (a) { return a !== exclude; }));
}
function collectDuplicates(accounts, origins, account, level) {
    if (level > 0 && !utils_1.includes(accounts, account)) {
        accounts.push(account);
        account.originsRefs.forEach(function (o) {
            if (!utils_1.includes(origins, o.origin)) {
                origins.push(o.origin);
                if (o.origin.accounts) {
                    o.origin.accounts.forEach(function (a) { return collectDuplicates(accounts, origins, a, level - 1); });
                }
            }
        });
    }
}
// unused
function getDuplicateEmailNames(accounts) {
    var set = new Set();
    return lodash_1.uniq(accounts.reduce(function (duplicates, a) {
        if (a.emails !== undefined && a.emails.length > 0) {
            var names = a.emails.map(function (e) { return e.replace(/@.+$/, ''); });
            duplicates.push.apply(duplicates, names.filter(function (name) { return set.has(name); }));
            names.forEach(function (name) { return set.add(name); });
        }
        return duplicates;
    }, []));
}
exports.getDuplicateEmailNames = getDuplicateEmailNames;
//# sourceMappingURL=duplicates.js.map