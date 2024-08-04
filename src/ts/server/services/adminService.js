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
exports.AdminService = void 0;
var timsort_1 = require("timsort");
var lodash_1 = require("lodash");
var rxjs_1 = require("rxjs");
var db = require("../db");
var liveList_1 = require("./liveList");
var utils_1 = require("../../common/utils");
var adminInterfaces_1 = require("../../common/adminInterfaces");
var adminUtils_1 = require("../../common/adminUtils");
var logger_1 = require("../logger");
var observableList_1 = require("./observableList");
var constants_1 = require("../../common/constants");
var internal_1 = require("../internal");
function addAuthToAccount(account, auth, log) {
    var existingAuth = account.auths.find(function (a) { return a._id === auth._id; });
    if (existingAuth) { // TODO: remove
        console.log('duplicate auth', auth._id, 'to', account._id, log);
    }
    else {
        account.authsList.pushOrdered(auth, adminUtils_1.compareAuths);
    }
}
function pushUnique(list, item) {
    if (list.indexOf(item) === -1) {
        list.push(item);
    }
}
function removeAuthFromAccount(account, auth) {
    return account.authsList.remove(auth);
}
function addPonyToAccount(account, pony) {
    if (account.poniesList) {
        account.poniesList.pushOrdered(pony, adminUtils_1.compareByName);
    }
}
function removePonyFromAccount(account, pony) {
    if (account.poniesList) {
        return account.poniesList.remove(pony);
    }
    else {
        return false;
    }
}
function getTotalPledged(auths) {
    return Math.floor((auths || []).reduce(function (sum, a) { return sum + utils_1.toInt(a.pledged); }, 0) / 100);
}
var AdminService = /** @class */ (function () {
    function AdminService() {
        var _this = this;
        this.accountDeleted = new rxjs_1.Subject();
        this.emailMap = new Map();
        this.noteRefMap = new Map();
        this.browserIdMap = new Map();
        this.unassignedAuths = [];
        this.unassignedPonies = [];
        this.duplicateFilter = adminUtils_1.createPotentialDuplicatesFilter(function (id) { return _this.browserIdMap.get(id); });
        this.accountsForPotentialDuplicatesCheck = [];
        var accountId = adminUtils_1.createIdStore();
        this.accounts = new liveList_1.LiveList(db.Account, {
            fields: [
                '_id', 'updatedAt', 'createdAt', 'lastVisit', 'name', 'birthdate', 'origins', 'ignores', 'emails', 'note',
                'counters', 'mute', 'shadow', 'ban', 'flags', 'roles', 'characterCount', 'patreon', 'supporter',
                'supporterDeclinedSince', 'lastBrowserId', 'noteUpdated', 'alert', 'birthyear'
            ],
            clean: function (_a) {
                var _id = _a._id, createdAt = _a.createdAt, updatedAt = _a.updatedAt, lastVisit = _a.lastVisit, name = _a.name, birthdate = _a.birthdate, origins = _a.origins, ignoresCount = _a.ignoresCount, emails = _a.emails, note = _a.note, counters = _a.counters, mute = _a.mute, shadow = _a.shadow, ban = _a.ban, flags = _a.flags, roles = _a.roles, characterCount = _a.characterCount, patreon = _a.patreon, supporter = _a.supporter, supporterDeclinedSince = _a.supporterDeclinedSince, auths = _a.auths, noteUpdated = _a.noteUpdated, alert = _a.alert, birthyear = _a.birthyear;
                return ({
                    _id: _id,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                    lastVisit: lastVisit,
                    name: name,
                    birthdate: birthdate,
                    origins: origins,
                    ignoresCount: utils_1.toInt(ignoresCount),
                    emails: emails,
                    note: note,
                    counters: counters,
                    mute: mute,
                    shadow: shadow,
                    ban: ban,
                    flags: utils_1.toInt(flags),
                    roles: roles,
                    birthyear: birthyear,
                    characterCount: utils_1.toInt(characterCount), patreon: utils_1.toInt(patreon), supporter: utils_1.toInt(supporter),
                    supporterDeclinedSince: supporterDeclinedSince,
                    totalPledged: getTotalPledged(auths),
                    noteUpdated: noteUpdated,
                    alert: alert,
                });
            },
            fix: function (account) {
                account._id = accountId(account._id);
                account.nameLower = account.name.toLowerCase();
                account.ignoresCount = account.ignores ? account.ignores.length : 0;
                account.ignores = undefined;
                account.origins = (account.origins || []).map(function (o) { return ({ ip: o.ip, country: o.country, last: o.last }); });
            },
            onAdd: function (account) {
                account.auths = [];
                // account.ponies = [];
                account.originsRefs = [];
                account.authsList = new observableList_1.ObservableList(account.auths, function (a) { return a._id; });
                if (account.lastBrowserId) {
                    _this.addBrowserIdToMap(account.lastBrowserId, account);
                }
                if (account.emails) {
                    for (var _i = 0, _a = account.emails; _i < _a.length; _i++) {
                        var e = _a[_i];
                        _this.addEmailToMap(e, account);
                    }
                }
                _this.addNoteRefsToMap(account.note, account);
                _this.updateOriginRefs(account);
                _this.accountsForPotentialDuplicatesCheck.push(account);
            },
            onUpdate: function (oldAccount, newAccount) {
                if (oldAccount.emails) {
                    for (var _i = 0, _a = oldAccount.emails; _i < _a.length; _i++) {
                        var e = _a[_i];
                        if (!utils_1.includes(newAccount.emails, e)) {
                            _this.removeEmailFromMap(e, oldAccount);
                        }
                    }
                }
                if (newAccount.emails) {
                    for (var _b = 0, _c = newAccount.emails; _b < _c.length; _b++) {
                        var e = _c[_b];
                        if (!utils_1.includes(oldAccount.emails, e)) {
                            _this.addEmailToMap(e, oldAccount);
                        }
                    }
                }
                if (oldAccount.note !== newAccount.note) {
                    _this.removeNoteRefsFromMap(oldAccount.note, oldAccount);
                    _this.addNoteRefsToMap(newAccount.note, oldAccount);
                }
                if (oldAccount.lastBrowserId !== newAccount.lastBrowserId) {
                    oldAccount.lastBrowserId && _this.removeBrowserIdFromMap(oldAccount.lastBrowserId, oldAccount);
                    newAccount.lastBrowserId && _this.addBrowserIdToMap(newAccount.lastBrowserId, oldAccount);
                }
                Object.assign(oldAccount, newAccount);
                if (newAccount.birthyear === undefined) {
                    oldAccount.birthyear = undefined;
                }
                if (newAccount.alert === undefined) {
                    oldAccount.alert = undefined;
                }
                if (newAccount.patreon === undefined) {
                    oldAccount.patreon = undefined;
                }
                if (newAccount.supporter === undefined) {
                    oldAccount.supporter = undefined;
                }
                _this.updateOriginRefs(oldAccount);
                _this.accountsForPotentialDuplicatesCheck.push(oldAccount);
            },
            onAddedOrUpdated: function () {
                _this.assignItems(_this.unassignedAuths, function (account, auth) { return addAuthToAccount(account, auth, 'onAddedOrUpdated'); });
                _this.assignItems(_this.unassignedPonies, addPonyToAccount);
            },
            onDelete: function (account) {
                account.origins = [];
                _this.updateOriginRefs(account);
                if (account.emails) {
                    for (var _i = 0, _a = account.emails; _i < _a.length; _i++) {
                        var email = _a[_i];
                        _this.removeEmailFromMap(email, account);
                    }
                }
                account.lastBrowserId && _this.removeBrowserIdFromMap(account.lastBrowserId, account);
                _this.removeNoteRefsFromMap(account.note, account);
                _this.accountDeleted.next(account);
            },
            onFinished: function () {
                timsort_1.sort(_this.accounts.items, adminUtils_1.compareAccounts);
                _this.auths.start();
            },
        });
        this.origins = new liveList_1.LiveList(db.Origin, {
            fields: ['_id', 'updatedAt', 'ip', 'country', 'mute', 'shadow', 'ban'],
            clean: function (_a) {
                var _id = _a._id, updatedAt = _a.updatedAt, ip = _a.ip, country = _a.country, mute = _a.mute, shadow = _a.shadow, ban = _a.ban, accounts = _a.accounts;
                return ({ _id: _id, updatedAt: updatedAt, ip: ip, country: country, mute: mute, shadow: shadow, ban: ban, accountsCount: accounts ? accounts.length : 0 });
            },
            onAdd: function (origin) {
                origin.accounts = [];
            },
            onSubscribeToMissing: function (ip) { return ({ ip: ip, country: '??' }); },
        }, function (origin) { return origin.ip; });
        this.auths = new liveList_1.LiveList(db.Auth, {
            fields: ['_id', 'updatedAt', 'account', 'provider', 'name', 'url', 'disabled', 'banned', 'pledged', 'lastUsed'],
            clean: function (_a) {
                var _id = _a._id, updatedAt = _a.updatedAt, account = _a.account, provider = _a.provider, name = _a.name, url = _a.url, disabled = _a.disabled, banned = _a.banned, pledged = _a.pledged, lastUsed = _a.lastUsed;
                return ({ _id: _id, updatedAt: updatedAt, account: account, provider: provider, name: name, url: url, disabled: disabled, banned: banned, pledged: pledged, lastUsed: lastUsed });
            },
            fix: function (auth) {
                if (auth.account) {
                    auth.account = accountId(auth.account.toString());
                }
            },
            onAdd: function (auth) {
                _this.assignAccount(auth, _this.unassignedAuths, function (account) { return addAuthToAccount(account, auth, 'onAdd'); });
            },
            onUpdate: this.createUpdater({
                remove: function (account, auth) { return removeAuthFromAccount(account, auth) || utils_1.removeItem(_this.unassignedAuths, auth); },
                add: function (account, auth) {
                    return account ? addAuthToAccount(account, auth, 'onUpdate') : pushUnique(_this.unassignedAuths, auth);
                },
            }),
            onDelete: function (auth) {
                utils_1.removeItem(_this.unassignedAuths, auth);
                _this.accounts.for(auth.account, function (account) { return removeAuthFromAccount(account, auth); });
            },
            onFinished: function () {
                logger_1.logger.info('Admin service loaded');
            },
        });
        this.ponies = new liveList_1.LiveList(db.Character, {
            fields: ['_id', 'createdAt', 'updatedAt', 'lastUsed', 'account', 'name', 'flags'],
            noStore: true,
            clean: function (_a) {
                var _id = _a._id, createdAt = _a.createdAt, updatedAt = _a.updatedAt, account = _a.account, name = _a.name, flags = _a.flags, lastUsed = _a.lastUsed;
                return ({ _id: _id, createdAt: createdAt, updatedAt: updatedAt, account: account, name: name, flags: flags, lastUsed: lastUsed });
            },
            fix: function (pony) {
                if (pony.account) {
                    pony.account = accountId(pony.account.toString());
                }
            },
            ignore: function (pony) {
                var account = _this.accounts.get(pony.account);
                return account === undefined || account.ponies === undefined;
            },
            onAdd: function (pony) {
                _this.assignAccount(pony, _this.unassignedPonies, function (account) { return addPonyToAccount(account, pony); });
            },
            onUpdate: this.createUpdater({
                remove: function (account, pony) { return removePonyFromAccount(account, pony) || utils_1.removeItem(_this.unassignedPonies, pony); },
                add: function (account, pony) { return account ? addPonyToAccount(account, pony) : pushUnique(_this.unassignedPonies, pony); },
            }),
            onDelete: function (pony) {
                utils_1.removeItem(_this.unassignedPonies, pony);
                _this.accounts.for(pony.account, function (account) { return removePonyFromAccount(account, pony); });
            },
            // afterAssign: (from, to) => Promise.all([updateCharacterCount(from), updateCharacterCount(to)]),
        });
        this.events = new liveList_1.LiveList(db.Event, {
            fields: adminInterfaces_1.eventFields,
            clean: function (_a) {
                var _id = _a._id, createdAt = _a.createdAt, updatedAt = _a.updatedAt, message = _a.message, desc = _a.desc, account = _a.account, pony = _a.pony, origin = _a.origin;
                return ({ _id: _id, createdAt: createdAt, updatedAt: updatedAt, message: message, desc: desc, account: account, pony: pony, origin: origin });
            },
        });
        setTimeout(function () { return _this.events.start(); }, 100);
        setTimeout(function () { return _this.ponies.start(); }, 200);
        setTimeout(function () { return _this.origins.start(); }, 300);
        setTimeout(function () { return _this.accounts.start(); }, 400);
    }
    Object.defineProperty(AdminService.prototype, "loaded", {
        get: function () {
            return this.accounts.loaded && this.origins.loaded && this.auths.loaded;
        },
        enumerable: false,
        configurable: true
    });
    AdminService.prototype.removedItem = function (type, id) {
        if (type === 'accounts') {
            this.accounts.removed(id);
        }
        else if (type === 'origins') {
            this.origins.removed(id);
        }
        else if (type === 'auths') {
            this.auths.removed(id);
        }
        else if (type === 'ponies') {
            this.ponies.removed(id);
        }
        else {
            console.warn("Unhandled removedItem for type: " + type);
        }
    };
    AdminService.prototype.getAccountsByNoteRef = function (accountId) {
        return this.noteRefMap.get(accountId) || [];
    };
    AdminService.prototype.getAccountsByEmailName = function (emailName) {
        return this.emailMap.get(emailName) || [];
    };
    AdminService.prototype.getAccountsByBrowserId = function (browserId) {
        return this.browserIdMap.get(browserId);
    };
    AdminService.prototype.removeOriginsFromAccount = function (accountId, ips) {
        var account = this.accounts.get(accountId);
        if (account) {
            if (ips) {
                if (lodash_1.remove(account.origins, function (o) { return utils_1.includes(ips, o.ip); }).length) {
                    this.updateOriginRefs(account);
                }
            }
            else if (account.origins.length) {
                account.origins = [];
                this.updateOriginRefs(account);
            }
        }
    };
    AdminService.prototype.subscribeToAccountAuths = function (accountId, listener) {
        var account = this.accounts.get(accountId);
        if (account) {
            return account.authsList.subscribe(listener);
        }
        else {
            return undefined;
        }
    };
    AdminService.prototype.subscribeToAccountOrigins = function (accountId, listener) {
        var account = this.accounts.get(accountId);
        if (account) {
            if (!account.originsList) {
                account.originsList = new observableList_1.ObservableList(account.originsRefs, function (_a) {
                    var origin = _a.origin, last = _a.last;
                    return ({ ip: origin.ip, country: origin.country, last: last });
                });
            }
            return account.originsList.subscribe(listener);
        }
        return undefined;
    };
    AdminService.prototype.subscribeToAccountPonies = function (accountId, listener) {
        var account = this.accounts.get(accountId);
        if (account) {
            if (!account.ponies) {
                account.ponies = this.ponies.items.filter(function (p) { return p.account === account._id; });
                this.ponies.fetch({ account: account._id });
            }
            if (!account.poniesList) {
                account.poniesList = new observableList_1.ObservableList(account.ponies, function (p) { return ({ id: p._id, name: p.name, date: p.lastUsed ? p.lastUsed.getTime() : 0 }); });
            }
            return account.poniesList.subscribe(listener);
        }
        return undefined;
    };
    AdminService.prototype.cleanupOriginsList = function (accountId) {
        var account = this.accounts.get(accountId);
        if (account && account.originsList && !account.originsList.hasSubscribers()) {
            account.originsList = undefined;
        }
    };
    AdminService.prototype.cleanupPoniesList = function (accountId) {
        var account = this.accounts.get(accountId);
        if (account && account.ponies && account.poniesList && !account.poniesList.hasSubscribers()) {
            var ponies = account.ponies;
            account.ponies = undefined;
            account.poniesList = undefined;
            for (var _i = 0, ponies_1 = ponies; _i < ponies_1.length; _i++) {
                var pony = ponies_1[_i];
                this.cleanupPony(pony._id);
            }
        }
    };
    AdminService.prototype.cleanupPony = function (ponyId) {
        var pony = this.ponies.get(ponyId);
        if (pony && !this.ponies.hasSubscriptions(ponyId)) {
            var account = this.accounts.get(pony.account);
            if (!account || !account.ponies) {
                this.ponies.discard(ponyId);
            }
        }
    };
    AdminService.prototype.mergePotentialDuplicates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var start, duplicateFilter, _loop_1, this_1, state_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = Date.now();
                        duplicateFilter = this.duplicateFilter;
                        _loop_1 = function () {
                            var popedAccount, account, threshold_1, duplicates, server, duplicate, accountIsOlder, accountId, withId;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        popedAccount = this_1.accountsForPotentialDuplicatesCheck.pop();
                                        account = this_1.getAccount(popedAccount._id);
                                        if (!(account && duplicateFilter(account))) return [3 /*break*/, 2];
                                        threshold_1 = utils_1.fromNow(-1 * constants_1.HOUR).getTime();
                                        duplicates = adminUtils_1.getPotentialDuplicates(account, function (id) { return _this.getAccountsByBrowserId(id); })
                                            .filter(function (a) { return a.createdAt && a.createdAt.getTime() < threshold_1; });
                                        if (!duplicates.length) return [3 /*break*/, 2];
                                        server = internal_1.getLoginServer('login');
                                        duplicate = duplicates[0];
                                        accountIsOlder = account.lastVisit && duplicate.lastVisit
                                            && account.lastVisit.getTime() < duplicate.lastVisit.getTime();
                                        accountId = accountIsOlder ? duplicate._id : account._id;
                                        withId = accountIsOlder ? account._id : duplicate._id;
                                        logger_1.logPerformance("mergePotentialDuplicates (" + (Date.now() - start) + "ms) [yes]");
                                        return [4 /*yield*/, server.api.mergeAccounts(accountId, withId, "by server", false, true)];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/, { value: accountId }];
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!this.accountsForPotentialDuplicatesCheck.length) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        return [3 /*break*/, 1];
                    case 3:
                        this.accountsForPotentialDuplicatesCheck = [];
                        logger_1.logPerformance("mergePotentialDuplicates (" + (Date.now() - start) + "ms) [no]");
                        return [2 /*return*/, undefined];
                }
            });
        });
    };
    // helpers
    AdminService.prototype.addEmailToMap = function (email, account) {
        adminUtils_1.addToMap(this.emailMap, adminUtils_1.emailName(email), account);
    };
    AdminService.prototype.removeEmailFromMap = function (email, account) {
        adminUtils_1.removeFromMap(this.emailMap, adminUtils_1.emailName(email), account);
    };
    AdminService.prototype.addNoteRefsToMap = function (note, account) {
        for (var _i = 0, _a = adminUtils_1.getIdsFromNote(note); _i < _a.length; _i++) {
            var id = _a[_i];
            if (id !== account._id) {
                adminUtils_1.addToMap(this.noteRefMap, id, account);
            }
        }
    };
    AdminService.prototype.removeNoteRefsFromMap = function (note, account) {
        for (var _i = 0, _a = adminUtils_1.getIdsFromNote(note); _i < _a.length; _i++) {
            var id = _a[_i];
            if (id !== account._id) {
                adminUtils_1.removeFromMap(this.noteRefMap, id, account);
            }
        }
    };
    AdminService.prototype.addBrowserIdToMap = function (browserId, account) {
        adminUtils_1.addToMap(this.browserIdMap, browserId, account);
    };
    AdminService.prototype.removeBrowserIdFromMap = function (browserId, account) {
        adminUtils_1.removeFromMap(this.browserIdMap, browserId, account);
    };
    AdminService.prototype.getAccount = function (id) {
        return id ? this.accounts.get(id) : undefined;
    };
    AdminService.prototype.getOrCreateOrigin = function (_a) {
        var ip = _a.ip, country = _a.country;
        return this.origins.get(ip)
            || this.origins.add({ _id: '', ip: ip, country: country, accounts: [], updatedAt: new Date(0), createdAt: new Date(0) });
    };
    AdminService.prototype.assignAccount = function (item, unassigned, action) {
        var account = this.getAccount(item.account);
        if (account) {
            action(account);
        }
        else {
            pushUnique(unassigned, item);
        }
    };
    AdminService.prototype.updateOriginRefs = function (a) {
        var _this = this;
        if (a.originsRefs) {
            for (var _i = 0, _a = a.originsRefs; _i < _a.length; _i++) {
                var o = _a[_i];
                removeById(o.origin.accounts, a._id);
            }
        }
        var oldOriginRefs = a.originsRefs;
        a.originsRefs = a.origins.map(function (o) { return ({ origin: _this.getOrCreateOrigin(o), last: o.last }); });
        timsort_1.sort(a.originsRefs, adminUtils_1.compareOriginRefs);
        for (var _b = 0, _c = a.originsRefs; _b < _c.length; _b++) {
            var o = _c[_b];
            if (o.origin.accounts && !utils_1.includes(o.origin.accounts, a)) {
                o.origin.accounts.push(a);
            }
        }
        if (oldOriginRefs) {
            for (var _d = 0, oldOriginRefs_1 = oldOriginRefs; _d < oldOriginRefs_1.length; _d++) {
                var o = oldOriginRefs_1[_d];
                if (!o.origin._id && o.origin.accounts.length === 0) {
                    this.origins.removed(o.origin.ip);
                }
                else {
                    this.origins.trigger(o.origin.ip, o.origin);
                }
            }
        }
        if (a.originsList) {
            a.originsList.replace(a.originsRefs);
        }
    };
    AdminService.prototype.assignItems = function (unassigned, push) {
        var _this = this;
        lodash_1.remove(unassigned, function (item) {
            var account = item.account && _this.getAccount(item.account);
            if (account) {
                push(account, item);
                return true;
            }
            else {
                return false;
            }
        });
    };
    AdminService.prototype.createUpdater = function (_a) {
        var _this = this;
        var add = _a.add, remove = _a.remove;
        return function (oldItem, newItem) {
            var oldAccountId = oldItem.account;
            var newAccountId = newItem.account;
            Object.assign(oldItem, newItem);
            if (oldAccountId !== newAccountId) {
                var oldAccount = _this.getAccount(oldAccountId);
                var newAccount = _this.getAccount(newAccountId);
                if (oldAccount) {
                    remove(oldAccount, oldItem);
                }
                add(newAccount, oldItem);
            }
        };
    };
    return AdminService;
}());
exports.AdminService = AdminService;
function findIndexById(items, id) {
    for (var i = 0; i < items.length; i++) {
        if (items[i]._id === id) {
            return i;
        }
    }
    return -1;
}
function removeById(items, id) {
    var index = findIndexById(items, id);
    if (index !== -1) {
        var item = items[index];
        items.splice(index, 1);
        return item;
    }
    else {
        return undefined;
    }
}
//# sourceMappingURL=adminService.js.map