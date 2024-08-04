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
exports.getSupporterInviteLimit = exports.getCharacterLimit = exports.removeFriend = exports.addFriend = exports.getAccountAlertMessage = exports.updateAccountState = exports.updateCharacterCount = exports.checkIfNotAdmin = exports.isNew = exports.findOrCreateAccount = exports.connectOnlySocialError = exports.getModInfo = void 0;
var moment = require("moment");
var lodash_1 = require("lodash");
var constants_1 = require("../common/constants");
var utils_1 = require("../common/utils");
var accountUtils_1 = require("../common/accountUtils");
var clientUtils_1 = require("../client/clientUtils");
var db_1 = require("./db");
var authUtils_1 = require("./authUtils");
var userError_1 = require("./userError");
var logger_1 = require("./logger");
var adminUtils_1 = require("../common/adminUtils");
var oauth_1 = require("./oauth");
var taskQueue_1 = require("./utils/taskQueue");
function getBanInfo(value) {
    return adminUtils_1.isActive(value) ? (value === -1 ? 'perma' : moment(value).fromNow(true)) : undefined;
}
function getModInfo(_a) {
    var accountId = _a.accountId, account = _a.account, country = _a.country;
    return {
        shadow: getBanInfo(account.shadow),
        mute: getBanInfo(account.mute),
        note: account.note,
        counters: account.counters || {},
        country: country,
        account: account.name + " [" + accountId.substr(-3) + "]",
    };
}
exports.getModInfo = getModInfo;
function findAccountByEmail(emails) {
    return emails && emails.length ? db_1.queryAccount({ emails: { $in: emails } }) : Promise.resolve(undefined);
}
var availableProviders = oauth_1.providers.filter(function (a) { return !a.connectOnly; }).map(function (a) { return a.name; }).join(', ');
exports.connectOnlySocialError = "Cannot create new account using this social site, new accounts can only be created using: " + availableProviders;
function createNewAccount(profile, options) {
    if (!options.canCreateAccounts) {
        throw new userError_1.UserError('Creating accounts is temporarily disabled, try again later');
    }
    else if (options.connectOnly) {
        throw new userError_1.UserError(exports.connectOnlySocialError);
    }
    else if (options.creationLocked) {
        throw new userError_1.UserError('Could not create account, try again later', { log: "account creation blocked by ACL (" + options.ip + ")" });
    }
    else if (profile.suspended) {
        throw new userError_1.UserError('Cannot create new account using suspended social site account', { log: 'account creation blocked by suspended' });
    }
    else {
        return new db_1.Account();
    }
}
function hasDuplicatesAtOrigin(account, ip) {
    return __awaiter(this, void 0, void 0, function () {
        var now, query, duplicates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = Date.now();
                    query = { origins: { $elemMatch: { ip: ip } } };
                    return [4 /*yield*/, db_1.Account.find(query, '_id ban mute shadow flags name').lean().exec()];
                case 1:
                    duplicates = _a.sent();
                    return [2 /*return*/, duplicates.some(function (_a) {
                            var _id = _a._id, _b = _a.ban, ban = _b === void 0 ? 0 : _b, _c = _a.mute, mute = _c === void 0 ? 0 : _c, _d = _a.shadow, shadow = _d === void 0 ? 0 : _d, _e = _a.flags, flags = _e === void 0 ? 0 : _e, name = _a.name;
                            if (_id.toString() === account._id.toString())
                                return false;
                            if (ban === -1 || ban > now || mute === -1 || mute > now || shadow === -1 || shadow > now)
                                return true;
                            if (utils_1.hasFlag(flags, 2 /* CreatingDuplicates */))
                                return true;
                            if (name === account.name)
                                return true;
                            return false;
                        })];
            }
        });
    });
}
var newAccountCheckQueue = taskQueue_1.taskQueue();
function checkNewAccount(account, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            newAccountCheckQueue.push(function () { return __awaiter(_this, void 0, void 0, function () {
                var duplicate, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            if (!options.reportPotentialDuplicates) return [3 /*break*/, 2];
                            return [4 /*yield*/, hasDuplicatesAtOrigin(account, options.ip)];
                        case 1:
                            duplicate = _a.sent();
                            if (duplicate) {
                                options.warn(account._id, "Potential duplicate");
                            }
                            _a.label = 2;
                        case 2: return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            options.warn(account._id, "Error when checking new account", e_1.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
function findOrCreateAccount(auth, profile, options) {
    return __awaiter(this, void 0, void 0, function () {
        var account, isNew, assigned, suspiciousEmails, name_1, emails, lastVisit, lastUserAgent, lastBrowserId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    account = undefined;
                    isNew = false;
                    if (!auth.account) return [3 /*break*/, 2];
                    return [4 /*yield*/, db_1.findAccount(auth.account)];
                case 1:
                    account = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!!account) return [3 /*break*/, 4];
                    return [4 /*yield*/, findAccountByEmail(profile.emails)];
                case 3:
                    account = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!account) {
                        account = createNewAccount(profile, options);
                        isNew = true;
                    }
                    return [4 /*yield*/, authUtils_1.assignAuth(auth, account)];
                case 5:
                    assigned = _a.sent();
                    if (assigned && options.isSuspiciousAuth(auth)) {
                        options.warn(account._id, 'Suspicious auth');
                    }
                    // fix accounts fields
                    account.name = account.name || lodash_1.truncate(clientUtils_1.cleanName(profile.name) || 'Anonymous', { length: constants_1.ACCOUNT_NAME_MAX_LENGTH });
                    account.emails = account.emails || [];
                    if (profile.emails.some(function (e) { return !utils_1.includes(account.emails, e); })) {
                        suspiciousEmails = profile.emails.filter(options.isSuspiciousName);
                        if (suspiciousEmails.length) {
                            options.warn(account._id, 'Suspicious email', suspiciousEmails.join(', '));
                        }
                        account.emails = lodash_1.uniq(__spreadArray(__spreadArray([], account.emails), profile.emails));
                    }
                    account.lastVisit = new Date();
                    account.lastUserAgent = options.userAgent || account.lastUserAgent;
                    account.lastBrowserId = options.browserId || account.lastBrowserId;
                    if (!isNew) return [3 /*break*/, 7];
                    return [4 /*yield*/, account.save()];
                case 6:
                    _a.sent();
                    logger_1.system(account._id, "created account \"" + account.name + "\"");
                    checkNewAccount(account, options);
                    return [3 /*break*/, 9];
                case 7:
                    name_1 = account.name, emails = account.emails, lastVisit = account.lastVisit, lastUserAgent = account.lastUserAgent, lastBrowserId = account.lastBrowserId;
                    return [4 /*yield*/, db_1.Account.updateOne({ _id: account._id }, { name: name_1, emails: emails, lastVisit: lastVisit, lastUserAgent: lastUserAgent, lastBrowserId: lastBrowserId }).exec()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [2 /*return*/, account];
            }
        });
    });
}
exports.findOrCreateAccount = findOrCreateAccount;
function isNew(account) {
    return !account.createdAt || account.createdAt.getTime() > utils_1.fromNow(-constants_1.DAY).getTime();
}
exports.isNew = isNew;
function checkIfNotAdmin(account, message) {
    if (accountUtils_1.isAdmin(account)) {
        logger_1.logger.warn("Cannot perform this action on admin user (" + message + ")");
        throw new Error('Cannot perform this action on admin user');
    }
    else {
        return account;
    }
}
exports.checkIfNotAdmin = checkIfNotAdmin;
function updateCharacterCount(account) {
    return __awaiter(this, void 0, void 0, function () {
        var characterCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.characterCount(account)];
                case 1:
                    characterCount = _a.sent();
                    return [4 /*yield*/, db_1.updateAccount(account, { characterCount: characterCount })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateCharacterCount = updateCharacterCount;
function updateAccountState(account, update) {
    var state = account.state || {};
    update(state);
    account.state = state;
    db_1.updateAccount(account._id, { state: account.state })
        .catch(function (e) { return logger_1.logger.error(e); });
}
exports.updateAccountState = updateAccountState;
function getAccountAlertMessage(account) {
    return (account.alert && account.alert.expires.getTime() > Date.now()) ? account.alert.message : undefined;
}
exports.getAccountAlertMessage = getAccountAlertMessage;
function findFriendRequest(accountId, friendId) {
    return __awaiter(this, void 0, void 0, function () {
        var requests;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.FriendRequest.find({
                        $or: [
                            { source: accountId, target: friendId },
                            { source: friendId, target: accountId },
                        ]
                    }).exec()];
                case 1:
                    requests = _a.sent();
                    return [2 /*return*/, requests[0]];
            }
        });
    });
}
function addFriend(accountId, friendId) {
    return __awaiter(this, void 0, void 0, function () {
        var existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findFriendRequest(accountId, friendId)];
                case 1:
                    existing = _a.sent();
                    if (existing) {
                        throw new Error("Friend request already exists");
                    }
                    return [4 /*yield*/, db_1.FriendRequest.create({ source: accountId, target: friendId })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.addFriend = addFriend;
function removeFriend(accountId, friendId) {
    return __awaiter(this, void 0, void 0, function () {
        var existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findFriendRequest(accountId, friendId)];
                case 1:
                    existing = _a.sent();
                    if (existing) {
                        existing.remove();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.removeFriend = removeFriend;
function getCharacterLimit(account) {
    return accountUtils_1.getCharacterLimit({
        flags: adminUtils_1.isPastSupporter(account) ? 4 /* PastSupporter */ : 0,
        supporter: adminUtils_1.supporterLevel(account),
    });
}
exports.getCharacterLimit = getCharacterLimit;
function getSupporterInviteLimit(account) {
    return accountUtils_1.getSupporterInviteLimit({
        roles: account.roles,
        flags: adminUtils_1.isPastSupporter(account) ? 4 /* PastSupporter */ : 0,
        supporter: adminUtils_1.supporterLevel(account),
    });
}
exports.getSupporterInviteLimit = getSupporterInviteLimit;
//# sourceMappingURL=accountUtils.js.map