"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.setAccountAlert = exports.removeAccount = exports.getAccountsByOrigin = exports.getAccountsByEmails = exports.getAccountsByEmail = exports.findAccounts = exports.setAccountState = exports.addIgnores = exports.removeIgnore = exports.removeEmail = exports.addEmail = exports.setRole = exports.updateAccountSafe = exports.reportFriendLimitAccount = exports.reportInviteLimitAccount = exports.reportSpammingAccount = exports.reportSwearingAccount = exports.initLogSwearingAndSpamming = exports.updateAccountCounter = exports.timeoutAccount = void 0;
var lodash_1 = require("lodash");
var accountUtils_1 = require("../accountUtils");
var db_1 = require("../db");
var internal_1 = require("../internal");
var constants_1 = require("../../common/constants");
var utils_1 = require("../../common/utils");
var adminUtils_1 = require("../../common/adminUtils");
var banLogLimit = 10;
function updateAccountAndNotify(accountId, update) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.updateAccount(accountId, update)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, internal_1.accountChanged(accountId)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function timeoutAccount(accountId, timeout, message) {
    return __awaiter(this, void 0, void 0, function () {
        var account, update;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.findAccountSafe(accountId, 'roles mute shadow')];
                case 1:
                    account = _a.sent();
                    accountUtils_1.checkIfNotAdmin(account, "timeout account: " + accountId);
                    update = { mute: timeout.getTime() };
                    if (!adminUtils_1.isMuted(account) && !adminUtils_1.isShadowed(account)) {
                        update.$inc = { 'counters.timeouts': 1 };
                        if (message) {
                            update.$push = {
                                banLog: {
                                    $each: [{ message: message, date: new Date() }],
                                    $slice: -banLogLimit,
                                },
                            };
                        }
                    }
                    return [4 /*yield*/, updateAccountAndNotify(accountId, update)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.timeoutAccount = timeoutAccount;
function incrementAccountCounter(accountId, counter) {
    var _a;
    return updateAccountAndNotify(accountId, { $inc: (_a = {}, _a["counters." + counter] = 1, _a) });
}
function updateAccountCounter(accountId, counter, value) {
    var _a;
    return updateAccountAndNotify(accountId, (_a = {}, _a["counters." + counter] = value, _a));
}
exports.updateAccountCounter = updateAccountCounter;
var logSwearing = lodash_1.noop;
var logSpamming = lodash_1.noop;
function initLogSwearingAndSpamming(swearing, spamming) {
    logSwearing = swearing;
    logSpamming = spamming;
}
exports.initLogSwearingAndSpamming = initLogSwearingAndSpamming;
function reportSwearingAccount(accountId) {
    logSwearing();
    return incrementAccountCounter(accountId, 'swears');
}
exports.reportSwearingAccount = reportSwearingAccount;
function reportSpammingAccount(accountId) {
    logSpamming();
    return incrementAccountCounter(accountId, 'spam');
}
exports.reportSpammingAccount = reportSpammingAccount;
function reportInviteLimitAccount(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, incrementAccountCounter(accountId, 'inviteLimit')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.findAccountSafe(accountId, 'counters')];
                case 2:
                    account = _a.sent();
                    return [2 /*return*/, account.counters && account.counters.inviteLimit || 0];
            }
        });
    });
}
exports.reportInviteLimitAccount = reportInviteLimitAccount;
function reportFriendLimitAccount(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, incrementAccountCounter(accountId, 'friendLimit')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.findAccountSafe(accountId, 'counters')];
                case 2:
                    account = _a.sent();
                    return [2 /*return*/, account.counters && account.counters.friendLimit || 0];
            }
        });
    });
}
exports.reportFriendLimitAccount = reportFriendLimitAccount;
function updateAccountSafe(accountId, update) {
    return __awaiter(this, void 0, void 0, function () {
        var keys, allowAdmin, account, isNoteUpdate, accountUpdate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keys = Object.keys(update);
                    allowAdmin = utils_1.arraysEqual(keys, ['note']) || utils_1.arraysEqual(keys, ['supporter']);
                    return [4 /*yield*/, db_1.findAccountSafe(accountId)];
                case 1:
                    account = _a.sent();
                    if (!allowAdmin) {
                        accountUtils_1.checkIfNotAdmin(account, "update account: " + accountId);
                    }
                    isNoteUpdate = 'note' in update && update.note !== account.note;
                    accountUpdate = isNoteUpdate ? __assign(__assign({}, update), { noteUpdated: new Date() }) : update;
                    return [4 /*yield*/, updateAccountAndNotify(accountId, accountUpdate)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateAccountSafe = updateAccountSafe;
function setRole(accountId, role, set, isSuperadmin) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(role === 'superadmin' || !isSuperadmin)) return [3 /*break*/, 1];
                    throw new Error('Not allowed');
                case 1: return [4 /*yield*/, updateAccountAndNotify(accountId, set ? { $addToSet: { roles: [role] } } : { $pull: { roles: role } })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.setRole = setRole;
function addEmail(accountId, email) {
    return db_1.updateAccount(accountId, { $addToSet: { emails: [email.trim().toLowerCase()] } });
}
exports.addEmail = addEmail;
function removeEmail(accountId, email) {
    return db_1.updateAccount(accountId, { $pull: { emails: email } });
}
exports.removeEmail = removeEmail;
function removeIgnore(accountId, ignoredAccount) {
    return updateAccountAndNotify(ignoredAccount, { $pull: { ignores: accountId } });
}
exports.removeIgnore = removeIgnore;
function addIgnores(accountId, ignores) {
    return updateAccountAndNotify(accountId, { $addToSet: { ignores: ignores } });
}
exports.addIgnores = addIgnores;
function setAccountState(accountId, state) {
    return updateAccountAndNotify(accountId, { state: state });
}
exports.setAccountState = setAccountState;
function isValidCache(entry, query, duration) {
    return entry.query === query && entry.timestamp.getTime() > utils_1.fromNow(-duration).getTime();
}
function findAccounts(cache, service, _a) {
    var search = _a.search, showOnly = _a.showOnly, not = _a.not, page = _a.page, itemsPerPage = _a.itemsPerPage, force = _a.force;
    return __awaiter(this, void 0, void 0, function () {
        var query, found, start;
        return __generator(this, function (_b) {
            query = JSON.stringify({ search: search, showOnly: showOnly, not: not });
            if (force) {
                cache.findAccounts = undefined;
            }
            if (cache.findAccounts && isValidCache(cache.findAccounts, query, 5 * constants_1.MINUTE)) {
                found = cache.findAccounts.result;
            }
            else {
                found = adminUtils_1.filterAccounts(service.accounts.items, search, showOnly, not);
                cache.findAccounts = {
                    query: query,
                    result: found,
                    timestamp: new Date(),
                };
            }
            start = page * itemsPerPage;
            return [2 /*return*/, {
                    accounts: found.slice(start, start + itemsPerPage).map(function (a) { return a._id; }),
                    page: page,
                    totalItems: found.length,
                }];
        });
    });
}
exports.findAccounts = findAccounts;
function getAccountsByEmail(service, email) {
    email = email.toLowerCase();
    var name = adminUtils_1.emailName(email);
    var accounts = service.getAccountsByEmailName(name) || [];
    return accounts.filter(function (a) { return utils_1.includes(a.emails, email); }).map(function (a) { return a._id; });
}
exports.getAccountsByEmail = getAccountsByEmail;
function getAccountsByEmails(service, emails) {
    var pairs = lodash_1.uniq(emails)
        .map(function (email) { return [email, getAccountsByEmail(service, email)]; })
        .filter(function (_a) {
        var _ = _a[0], accounts = _a[1];
        return accounts.length > 0;
    });
    return lodash_1.fromPairs(pairs);
}
exports.getAccountsByEmails = getAccountsByEmails;
function getAccountsByOrigin(service, ip) {
    var origin = service.origins.get(ip);
    return origin && origin.accounts && origin.accounts.map(function (a) { return a._id; }) || [];
}
exports.getAccountsByOrigin = getAccountsByOrigin;
function removeAccount(service, accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.findAccount(accountId)];
                case 1:
                    account = _a.sent();
                    if (!account) return [3 /*break*/, 3];
                    accountUtils_1.checkIfNotAdmin(account, "remove account: " + accountId);
                    return [4 /*yield*/, account.remove()];
                case 2:
                    _a.sent();
                    service.removedItem('accounts', accountId);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.removeAccount = removeAccount;
function setAccountAlert(accountId, message, expires) {
    return __awaiter(this, void 0, void 0, function () {
        var update;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    update = message ? { alert: { message: message, expires: expires } } : { $unset: { alert: 1 } };
                    return [4 /*yield*/, db_1.Account.updateOne({ _id: accountId }, update).exec()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.setAccountAlert = setAccountAlert;
//# sourceMappingURL=admin-accounts.js.map