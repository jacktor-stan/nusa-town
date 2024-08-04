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
exports.HidingService = exports.pollHidingDataSave = exports.saveHidingData = exports.hidingDataPath = void 0;
var fs = require("fs");
var rxjs_1 = require("rxjs");
var constants_1 = require("../../common/constants");
var logger_1 = require("../logger");
var utils_1 = require("../../common/utils");
var friends_1 = require("./friends");
var paths_1 = require("../paths");
var db_1 = require("../db");
var entityUtils_1 = require("../entityUtils");
var chat_1 = require("../chat");
var hidePlayerLimit = 'Cannot hide any more players.';
var cannotHidePlayerInParty = 'Cannot hide players from your party.';
var cannotHideFriends = 'Cannot hide friends.';
var unhideAllLimit = 'Cannot unhide hidden players, try again later.';
var unhideAllLimitNote = 'You can only do this once per hour.';
function clientInfo(_a) {
    var accountId = _a.accountId, account = _a.account, characterName = _a.characterName;
    return characterName + " (" + account.name + ") [" + accountId + "]";
}
function simpleNotification(message, note) {
    return { id: 0, name: '', message: message, note: note, flags: 1 /* Ok */ };
}
function hidingDataPath(serverId) {
    return paths_1.pathTo('settings', "hiding-" + serverId + ".json");
}
exports.hidingDataPath = hidingDataPath;
function saveHidingData(hiding, serverId) {
    return __awaiter(this, void 0, void 0, function () {
        var data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!TESTS) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    data = hiding.serialize();
                    return [4 /*yield*/, fs.writeFileAsync(hidingDataPath(serverId), data, 'utf8')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    logger_1.logger.error(e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.saveHidingData = saveHidingData;
function pollHidingDataSave(hiding, serverId) {
    setInterval(function () { return saveHidingData(hiding, serverId); }, 10 * constants_1.MINUTE);
}
exports.pollHidingDataSave = pollHidingDataSave;
var HidingService = /** @class */ (function () {
    function HidingService(clearUnhides, notifications, findClient, log) {
        this.clearUnhides = clearUnhides;
        this.notifications = notifications;
        this.findClient = findClient;
        this.log = log;
        this.changes = new rxjs_1.Subject();
        this.unhidesAll = new rxjs_1.Subject();
        this.hides = new Map();
        this.unhides = new Map();
    }
    HidingService.prototype.serialize = function () {
        var hides = {};
        var unhides = {};
        this.hides.forEach(function (hidesMap, by) {
            var list = {};
            hidesMap.forEach(function (value, key) { return list[key] = value; });
            hides[by] = list;
        });
        this.unhides.forEach(function (value, key) { return unhides[key] = value; });
        return JSON.stringify({ hides: hides, unhides: unhides });
    };
    HidingService.prototype.deserialize = function (data) {
        try {
            var _a = JSON.parse(data), hides = _a.hides, unhides = _a.unhides;
            for (var _i = 0, _b = Object.keys(hides); _i < _b.length; _i++) {
                var by = _b[_i];
                var hidesMap = new Map();
                for (var _c = 0, _d = Object.keys(hides[by]); _c < _d.length; _c++) {
                    var key = _d[_c];
                    hidesMap.set(key, hides[by][key]);
                }
                this.hides.set(by, hidesMap);
            }
            for (var _e = 0, _f = Object.keys(unhides); _e < _f.length; _e++) {
                var key = _f[_e];
                this.unhides.set(key, unhides[key]);
            }
            this.cleanup();
        }
        catch (e) {
            logger_1.logger.error(e);
        }
    };
    HidingService.prototype.getStatsFor = function (account) {
        var hides = this.hides.get(account);
        var hidden = hides ? Array.from(hides.keys()) : [];
        var hiddenBy = [];
        this.hides.forEach(function (hides, by) {
            if (hides.has(account)) {
                hiddenBy.push(by);
            }
        });
        return { account: account, hidden: hidden, hiddenBy: hiddenBy, permaHidden: [], permaHiddenBy: [] };
    };
    HidingService.prototype.connected = function (client) {
        var hides = this.hides.get(client.accountId);
        if (hides) {
            for (var _i = 0, _a = Array.from(hides.keys()); _i < _a.length; _i++) {
                var id = _a[_i];
                client.hides.add(id);
            }
        }
    };
    HidingService.prototype.requestHide = function (requester, target, timeout) {
        var _this = this;
        var hides = this.hides.get(requester.accountId);
        var count = hides && hides.size || 0;
        if (requester.accountId === target.accountId) {
            chat_1.saySystem(requester, "Cannot hide yourself");
        }
        else if (requester.party && utils_1.includes(requester.party.clients, target)) {
            this.notifications.addNotification(requester, simpleNotification(cannotHidePlayerInParty));
        }
        else if (friends_1.isFriend(requester, target)) {
            this.notifications.addNotification(requester, simpleNotification(cannotHideFriends));
        }
        else if (count >= constants_1.HIDE_LIMIT) {
            this.notifications.addNotification(requester, simpleNotification(hidePlayerLimit));
        }
        else {
            this.notifications.addNotification(requester, {
                id: 0,
                name: target.pony.name || '',
                entityId: target.pony.id,
                message: "Are you sure you want to hide <b>#NAME#</b> ?",
                flags: 2 /* Yes */ | 4 /* No */ | (target.pony.nameBad ? 128 /* NameBad */ : 0),
                accept: function () { return _this.confirmHide(requester, target, timeout); },
            });
        }
    };
    HidingService.prototype.requestUnhideAll = function (requester) {
        var _this = this;
        var unhideTimestamp = this.unhides.get(requester.accountId) || 0;
        if (unhideTimestamp > Date.now()) {
            this.notifications.addNotification(requester, simpleNotification(unhideAllLimit, unhideAllLimitNote));
        }
        else {
            this.notifications.addNotification(requester, {
                id: 0,
                name: '',
                message: 'Are you sure you want to unhide all temporarily hidden players ?',
                note: 'You can only do this once per hour. This action will require re-joining the game.',
                flags: 2 /* Yes */ | 4 /* No */,
                accept: function () { return _this.unhideAll(requester); },
            });
        }
    };
    HidingService.prototype.confirmHide = function (requester, target, timeout) {
        if (this.hide(requester, target, timeout)) {
            var message = requester.characterName + " (" + requester.account.name + ") hides " + clientInfo(target);
            if (timeout === 0) {
                message += ' (permanent)';
            }
            this.log(logger_1.systemMessage(requester.accountId, message));
        }
    };
    HidingService.prototype.isHiddenInner = function (who, from) {
        var hides = this.hides.get(who);
        return hides !== undefined && hides.has(from);
    };
    HidingService.prototype.isHidden = function (who, from) {
        return this.isHiddenInner(who, from) || this.isHiddenInner(from, who);
    };
    HidingService.prototype.isHiddenClient = function (who, from) {
        return this.isHidden(who.accountId, from.accountId);
    };
    HidingService.prototype.hide = function (byClient, whoClient, timeout) {
        var _this = this;
        var by = byClient.accountId;
        var who = whoClient.accountId;
        if (timeout === 0) { // permanent
            db_1.addHide(by, who, entityUtils_1.getEntityName(whoClient.pony, byClient) || '[none]')
                .then(function () {
                byClient.permaHides.add(who);
                _this.notify([{ by: by, who: who }]);
            })
                .catch(function (e) { return logger_1.logger.error(e); });
            return true;
        }
        else {
            if (by === who)
                return false;
            if (this.isHiddenInner(by, who))
                return false;
            var hides = this.hides.get(by) || new Map();
            hides.set(who, Date.now() + timeout);
            this.hides.set(by, hides);
            byClient.hides.add(who);
            this.notify([{ by: by, who: who }]);
            return true;
        }
    };
    // TODO: remove ?
    HidingService.prototype.unhide = function (byClient, whoClient) {
        var by = byClient.accountId;
        var who = whoClient.accountId;
        var hides = this.hides.get(by);
        if (hides) {
            if (hides.has(who)) {
                hides.delete(who);
                if (hides.size === 0) {
                    this.hides.delete(by);
                }
                byClient.hides.delete(who);
                this.notify([{ by: by, who: who }]);
            }
        }
    };
    HidingService.prototype.unhideAll = function (byClient) {
        var by = byClient.accountId;
        if (this.unhides.has(by))
            return;
        var hides = this.hides.get(by);
        if (hides) {
            var notify_1 = [];
            hides.forEach(function (_, who) { return notify_1.push({ by: by, who: who }); });
            this.hides.delete(by);
            this.unhides.set(by, Date.now() + this.clearUnhides);
            byClient.hides.clear();
            this.notify(notify_1);
            this.unhidesAll.next(by);
        }
        this.log(logger_1.systemMessage(by, 'unhide all'));
    };
    HidingService.prototype.merged = function (target, merge) {
        var _this = this;
        var targetHides = this.hides.get(target);
        var mergeHides = this.hides.get(merge);
        var notify = [];
        if (targetHides) {
            targetHides.delete(merge);
        }
        if (mergeHides) {
            var targetClient = this.findClient(target);
            mergeHides.delete(target);
            if (targetHides) {
                for (var _i = 0, _a = Array.from(mergeHides.keys()); _i < _a.length; _i++) {
                    var id = _a[_i];
                    var who = targetHides.get(id);
                    targetHides.set(id, Math.max(who || 0, mergeHides.get(id)));
                    targetClient && targetClient.hides.add(id);
                    if (!who) {
                        notify.push({ by: target, who: id });
                        notify.push({ by: merge, who: id });
                    }
                }
            }
            else {
                this.hides.set(target, mergeHides);
                for (var _b = 0, _c = Array.from(mergeHides.keys()); _b < _c.length; _b++) {
                    var id = _c[_b];
                    targetClient && targetClient.hides.add(id);
                    notify.push({ by: target, who: id });
                    notify.push({ by: merge, who: id });
                }
            }
            this.hides.delete(merge);
        }
        var targetUnhides = this.unhides.get(target);
        var mergeUnhides = this.unhides.get(merge);
        if (mergeUnhides) {
            this.unhides.set(target, Math.max(targetUnhides || 0, mergeUnhides));
            this.unhides.delete(merge);
        }
        this.hides.forEach(function (_, by) {
            var hides = _this.hides.get(by);
            var mergeHide = hides.get(merge);
            if (mergeHide) {
                hides.set(target, Math.max(mergeHide, hides.get(target) || 0));
                hides.delete(merge);
                var client = _this.findClient(by);
                if (client) {
                    client.hides.delete(merge);
                    if (target !== by) {
                        client && client.hides.add(target);
                    }
                }
                notify.push({ by: by, who: target });
                notify.push({ by: by, who: merge });
            }
        });
        this.notify(notify);
    };
    HidingService.prototype.cleanup = function () {
        var now = Date.now();
        var notify = [];
        for (var _i = 0, _a = Array.from(this.hides.keys()); _i < _a.length; _i++) {
            var by = _a[_i];
            var hides = this.hides.get(by);
            for (var _b = 0, _c = Array.from(hides.keys()); _b < _c.length; _b++) {
                var who = _c[_b];
                if (hides.get(who) < now) {
                    hides.delete(who);
                    var client = this.findClient(by);
                    client && client.hides.delete(who);
                    notify.push({ by: by, who: who });
                }
            }
            if (hides.size === 0) {
                this.hides.delete(by);
            }
        }
        this.notify(notify);
        for (var _d = 0, _e = Array.from(this.unhides.keys()); _d < _e.length; _d++) {
            var key = _e[_d];
            if (this.unhides.get(key) < now) {
                this.unhides.delete(key);
            }
        }
    };
    HidingService.prototype.start = function () {
        var _this = this;
        this.interval = this.interval || setInterval(function () { return _this.cleanup(); }, 10 * constants_1.MINUTE);
    };
    HidingService.prototype.stop = function () {
        clearInterval(this.interval);
        this.interval = undefined;
    };
    HidingService.prototype.notify = function (hides) {
        for (var _i = 0, hides_1 = hides; _i < hides_1.length; _i++) {
            var hide = hides_1[_i];
            this.changes.next(hide);
        }
    };
    return HidingService;
}());
exports.HidingService = HidingService;
//# sourceMappingURL=hiding.js.map