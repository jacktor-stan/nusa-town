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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitAccounts = exports.mergeAccounts = exports.split = void 0;
var lodash_1 = require("lodash");
var utils_1 = require("../../common/utils");
var accountUtils_1 = require("../accountUtils");
var db_1 = require("../db");
var internal_1 = require("../internal");
var logger_1 = require("../logger");
var taskQueue_1 = require("../utils/taskQueue");
var admin_1 = require("./admin");
function mergeBan(a, b) {
    return (a === -1 || b === -1) ? -1 : Math.max(a || 0, b || 0);
}
function mergeLists(a, b, limit) {
    return __spreadArray(__spreadArray([], (a || [])), (b || [])).sort(function (a, b) { return utils_1.compareDates(a.date, b.date); }).slice(-limit);
}
function findAccounts(id, withId, allowAdmin) {
    if (allowAdmin === void 0) { allowAdmin = false; }
    return __awaiter(this, void 0, void 0, function () {
        var accounts, account, merge;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Account.find({ _id: { $in: [id, withId] } })
                        .populate('auths', 'name')
                        .populate('characters', 'name')
                        .exec()];
                case 1:
                    accounts = _a.sent();
                    if (!allowAdmin) {
                        accounts.forEach(function (a) { return accountUtils_1.checkIfNotAdmin(a, "merge: " + a._id); });
                    }
                    account = accounts.find(function (a) { return a._id.toString() === id; });
                    merge = accounts.find(function (a) { return a._id.toString() === withId; });
                    if (accounts.length !== 2 || !account || !merge) {
                        throw new Error('Account does not exist');
                    }
                    return [2 /*return*/, { account: account, merge: merge }];
            }
        });
    });
}
function dumpData(account, friends, hides) {
    var name = account.name, note = account.note, flags = account.flags, _a = account.counters, counters = _a === void 0 ? {} : _a, _b = account.auths, auths = _b === void 0 ? [] : _b, _c = account.characters, characters = _c === void 0 ? [] : _c, _d = account.ignores, ignores = _d === void 0 ? [] : _d, _e = account.emails, emails = _e === void 0 ? [] : _e, _f = account.state, state = _f === void 0 ? {} : _f, birthdate = account.birthdate;
    return {
        name: name,
        note: note,
        flags: flags,
        state: state,
        birthdate: birthdate,
        emails: emails.slice(),
        ignores: ignores.slice(),
        counters: lodash_1.clone(counters),
        auths: auths.map(function (_a) {
            var _id = _a._id, name = _a.name;
            return ({ id: _id.toString(), name: name });
        }),
        characters: characters.map(function (_a) {
            var _id = _a._id, name = _a.name;
            return ({ id: _id.toString(), name: name });
        }),
        settings: account.settings,
        friends: friends.slice(),
        hides: hides.slice(),
    };
}
function mergeStates(a, b) {
    if (a && b) {
        return __assign(__assign(__assign({}, b), a), { gifts: utils_1.toInt(a.gifts) + utils_1.toInt(b.gifts), candies: utils_1.toInt(a.candies) + utils_1.toInt(b.candies), clovers: utils_1.toInt(a.clovers) + utils_1.toInt(b.clovers), toys: utils_1.toInt(a.toys) | utils_1.toInt(b.toys) });
    }
    else {
        return a || b;
    }
}
function merge(id, withId, reason, removedDocument, allowAdmin, creatingDuplicates) {
    if (allowAdmin === void 0) { allowAdmin = false; }
    if (creatingDuplicates === void 0) { creatingDuplicates = false; }
    return __awaiter(this, void 0, void 0, function () {
        var start, _a, _b, account, merge, accountFriends, mergeFriends, accountHides, mergeHides, data, origins, ignores, emails, note, createdAt, lastVisit, ban, shadow, mute, patreon, counters, creatingDuplicatesFlag, flags, supporter, birthdate, supporterLog, supporterTotal, banLog, merges, state, alert, update;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    start = Date.now();
                    return [4 /*yield*/, Promise.all([
                            findAccounts(id, withId, allowAdmin),
                            db_1.findFriendIds(id),
                            db_1.findFriendIds(withId),
                            db_1.findHidesForMerge(id),
                            db_1.findHidesForMerge(withId),
                        ])];
                case 1:
                    _a = _c.sent(), _b = _a[0], account = _b.account, merge = _b.merge, accountFriends = _a[1], mergeFriends = _a[2], accountHides = _a[3], mergeHides = _a[4];
                    data = {
                        account: dumpData(account, accountFriends, accountHides),
                        merge: dumpData(merge, mergeFriends, mergeHides),
                    };
                    origins = lodash_1.uniqBy(__spreadArray(__spreadArray([], (account.origins || [])), (merge.origins || [])), function (x) { return x.ip; });
                    ignores = lodash_1.uniq(__spreadArray(__spreadArray([], (account.ignores || [])), (merge.ignores || [])));
                    emails = lodash_1.uniq(__spreadArray(__spreadArray([], (account.emails || [])), (merge.emails || [])));
                    note = ((account.note || '') + "\n" + (merge.note || '')).trim();
                    createdAt = utils_1.minDate(account.createdAt, merge.createdAt);
                    lastVisit = utils_1.maxDate(account.lastVisit, merge.lastVisit);
                    ban = mergeBan(account.ban, merge.ban);
                    shadow = mergeBan(account.shadow, merge.shadow);
                    mute = mergeBan(account.mute, merge.mute);
                    patreon = Math.max(utils_1.toInt(account.patreon), utils_1.toInt(merge.patreon));
                    counters = lodash_1.assignWith(account.counters || {}, merge.counters || {}, function (a, b) { return (a | 0) + (b | 0); });
                    creatingDuplicatesFlag = creatingDuplicates ? 2 /* CreatingDuplicates */ : 0;
                    flags = account.flags | merge.flags | creatingDuplicatesFlag;
                    supporter = utils_1.toInt(account.supporter) | utils_1.toInt(merge.supporter);
                    birthdate = account.birthdate || merge.birthdate;
                    supporterLog = mergeLists(account.supporterLog, merge.supporterLog, 10);
                    supporterTotal = utils_1.toInt(account.supporterTotal) + utils_1.toInt(merge.supporterTotal);
                    banLog = mergeLists(account.banLog, merge.banLog, 10);
                    merges = mergeLists(account.merges, merge.merges, 20);
                    state = mergeStates(account.state, merge.state);
                    alert = account.alert || merge.alert;
                    merges.push({ id: withId, name: merge.name, date: new Date(), reason: reason, data: data });
                    update = {
                        origins: origins,
                        ignores: ignores,
                        emails: emails,
                        note: note,
                        lastVisit: lastVisit,
                        ban: ban,
                        shadow: shadow,
                        mute: mute,
                        flags: flags,
                        counters: counters,
                        patreon: patreon,
                        supporter: supporter,
                        merges: merges,
                        createdAt: createdAt,
                        supporterLog: supporterLog,
                        supporterTotal: supporterTotal,
                        banLog: banLog,
                        state: state,
                        alert: alert,
                        birthdate: birthdate,
                    };
                    return [4 /*yield*/, Promise.all([
                            db_1.Account.updateOne({ _id: account._id }, update).exec(),
                            db_1.Account.updateMany({ ignores: { $exists: true, $ne: [], $in: [withId] } }, { $addToSet: { ignores: id } }).exec()
                                .then(function () { return db_1.Account.updateMany({ ignores: { $exists: true, $ne: [], $in: [withId] } }, { $pull: { ignores: withId } }).exec(); }),
                            db_1.Auth.updateMany({ account: merge._id }, { account: account._id }).exec(),
                            db_1.Event.updateMany({ account: merge._id }, { account: account._id }).exec(),
                            db_1.Character.updateMany({ account: merge._id }, { account: account._id }).exec(),
                            Promise.all([
                                db_1.SupporterInvite.updateMany({ source: merge._id }, { source: account._id }).exec(),
                                db_1.SupporterInvite.updateMany({ target: merge._id }, { target: account._id }).exec(),
                            ]).then(function () { return db_1.SupporterInvite.remove({ target: account._id, source: account._id }).exec(); }),
                            Promise.all([
                                db_1.FriendRequest.updateMany({ source: merge._id }, { source: account._id }).exec(),
                                db_1.FriendRequest.updateMany({ target: merge._id }, { target: account._id }).exec(),
                            ]).then(function () { return db_1.FriendRequest.remove({ target: account._id, source: account._id }).exec(); }),
                            Promise.all([
                                db_1.HideRequest.updateMany({ source: merge._id }, { source: account._id }).exec(),
                                db_1.HideRequest.updateMany({ target: merge._id }, { target: account._id }).exec(),
                            ]).then(function () { return db_1.HideRequest.remove({ target: account._id, source: account._id }).exec(); }),
                        ])];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, removeDuplicateFriendRequests(id)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, merge.remove()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, admin_1.kickFromAllServers(withId)];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, removedDocument('accounts', withId)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, accountUtils_1.updateCharacterCount(id)];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, internal_1.accountMerged(id, withId)];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, internal_1.accountChanged(id)];
                case 9:
                    _c.sent();
                    logger_1.system(account._id, "Merged " + account.name + " with " + merge.name + " [" + merge._id + "] (" + reason + ") (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    });
}
function removeDuplicateFriendRequests(id) {
    return __awaiter(this, void 0, void 0, function () {
        var friendRequests, checked, removeRequests, _i, friendRequests_1, request, friendId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.FriendRequest.find({ $or: [{ source: id }, { target: id }] }).exec()];
                case 1:
                    friendRequests = _a.sent();
                    checked = new Set();
                    removeRequests = [];
                    for (_i = 0, friendRequests_1 = friendRequests; _i < friendRequests_1.length; _i++) {
                        request = friendRequests_1[_i];
                        friendId = request.source.toString() === id ? request.target.toString() : request.source.toString();
                        if (checked.has(friendId)) {
                            removeRequests.push(request._id);
                        }
                        else {
                            checked.add(friendId);
                        }
                    }
                    if (!removeRequests.length) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.FriendRequest.remove({ _id: { $in: removeRequests } }).exec()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function split(accountId, mergeId, split, keep, reason) {
    return __awaiter(this, void 0, void 0, function () {
        var start, account, unmerge, accountUpdate, removeIgnores, newCounters, oldCounters_1, counters, authIds, friendsToRemove, hidesToRemove;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    return [4 /*yield*/, db_1.findAccountSafe(accountId)];
                case 1:
                    account = _a.sent();
                    return [4 /*yield*/, db_1.Account.create({
                            name: split.name,
                            note: split.note,
                            flags: split.flags || 0,
                            emails: split.emails,
                            state: split.state,
                            ignores: split.ignores,
                            counters: split.counters,
                            birthdate: split.birthdate,
                            settings: split.settings,
                        })];
                case 2:
                    unmerge = _a.sent();
                    accountUpdate = {
                        note: (account.note + "\nsplit: [" + unmerge._id + "]").trim(),
                        state: keep.state,
                    };
                    removeIgnores = lodash_1.difference(split.ignores, account.ignores || []);
                    if (removeIgnores.length) {
                        accountUpdate.$pull = { ignores: removeIgnores };
                    }
                    newCounters = split.counters || {};
                    if (Object.keys(newCounters).length > 0) {
                        oldCounters_1 = account.counters || {};
                        counters = lodash_1.mapValues(newCounters, function (value, key) { return Math.max(0, utils_1.toInt(oldCounters_1[key]) - utils_1.toInt(value)); });
                        accountUpdate.counters = counters;
                    }
                    authIds = split.auths.map(function (x) { return x.id; });
                    return [4 /*yield*/, Promise.all([
                            db_1.Auth.updateMany({ _id: { $in: authIds } }, { account: unmerge._id, disabled: false }).exec(),
                            db_1.Character.updateMany({ _id: { $in: split.characters.map(function (x) { return x.id; }) } }, { account: unmerge._id }).exec(),
                            db_1.Account.updateOne({ _id: account._id }, accountUpdate).exec(),
                        ])];
                case 3:
                    _a.sent();
                    friendsToRemove = __spreadArray(__spreadArray([], (keep.friends || [])), (split.friends || []));
                    return [4 /*yield*/, db_1.FriendRequest.deleteMany({
                            $or: [
                                { target: account._id, source: { $in: friendsToRemove } },
                                { source: account._id, target: { $in: friendsToRemove } },
                            ],
                        }).exec()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, db_1.FriendRequest.create(__spreadArray(__spreadArray([], (keep.friends || []).map(function (id) { return ({ source: account._id, target: id }); })), (split.friends || []).map(function (id) { return ({ source: unmerge._id, target: id }); })))];
                case 5:
                    _a.sent();
                    hidesToRemove = __spreadArray(__spreadArray([], (keep.hides || [])), (split.hides || [])).map(function (hide) { return hide.id; });
                    return [4 /*yield*/, db_1.HideRequest.deleteMany({
                            $or: [
                                { source: account._id, target: { $in: hidesToRemove } },
                            ],
                        }).exec()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, db_1.HideRequest.create(__spreadArray(__spreadArray([], (keep.hides || []).map(function (hide) { return ({ source: account._id, target: hide.id, name: hide.name, date: new Date(hide.date) }); })), (split.hides || []).map(function (hide) { return ({ source: unmerge._id, target: hide.id, name: hide.name, date: new Date(hide.date) }); })))];
                case 7:
                    _a.sent();
                    if (!mergeId) return [3 /*break*/, 9];
                    return [4 /*yield*/, db_1.Account.updateOne({ _id: account._id, 'merges._id': mergeId }, { 'merges.$.split': true }).exec()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [4 /*yield*/, Promise.all([
                        accountUtils_1.updateCharacterCount(accountId),
                        accountUtils_1.updateCharacterCount(unmerge._id),
                        internal_1.accountChanged(accountId),
                    ])];
                case 10:
                    _a.sent();
                    logger_1.system(account._id, "Split off " + unmerge.name + " [" + unmerge._id + "] (" + reason + ") (" + (Date.now() - start) + "ms)");
                    return [2 /*return*/];
            }
        });
    });
}
exports.split = split;
exports.mergeAccounts = taskQueue_1.makeQueued(merge);
exports.splitAccounts = taskQueue_1.makeQueued(split);
//# sourceMappingURL=merge.js.map