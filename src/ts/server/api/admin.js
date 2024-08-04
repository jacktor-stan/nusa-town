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
exports.updateGameServerSettings = exports.updateServerSettings = exports.getOtherStats = exports.getAccountDetails = exports.getUserCounts = exports.updateOrigin = exports.clearSessions = exports.getChatForAccounts = exports.getChat = exports.reloadSettingsOnAllServers = exports.resetUpdating = exports.shutdownServers = exports.notifyUpdate = exports.kickFromAllServersByCharacter = exports.kickFromAllServers = exports.actionForAllServers = exports.forAllGameServers = exports.getAdminState = exports.createEndPoints = void 0;
var fs = require("fs");
var moment = require("moment");
var adminInterfaces_1 = require("../../common/adminInterfaces");
var serverUtils_1 = require("../serverUtils");
var db_1 = require("../db");
var internal_1 = require("../internal");
var adminEncoders_1 = require("../adminEncoders");
var liveEndPoint_1 = require("../liveEndPoint");
var paths = require("../paths");
var logger_1 = require("../logger");
var settings_1 = require("../settings");
var utils_1 = require("../../common/utils");
function encodeItems(items, base, encode) {
    var baseValues = adminEncoders_1.getBaseTimes(base);
    return items.map(function (i) { return encode(i, baseValues); });
}
var events = liveEndPoint_1.createLiveEndPoint({
    model: db_1.Event,
    fields: adminInterfaces_1.eventFields,
    encode: function (items, base) {
        base.createdAt = adminEncoders_1.getBaseDate(items, function (i) { return i.createdAt; });
        base.updatedAt = adminEncoders_1.getBaseDate(items, function (i) { return i.updatedAt; });
        return encodeItems(items, base, adminEncoders_1.encodeEvent);
    },
});
function createEndPoints() {
    return { events: events };
}
exports.createEndPoints = createEndPoints;
function getAdminState() {
    return {
        status: internal_1.serverStatus,
        loginServers: internal_1.loginServers.map(function (s) { return s.state; }),
        gameServers: internal_1.servers.map(function (s) { return s.state; }),
    };
}
exports.getAdminState = getAdminState;
function forAllLoginServers(action, filter) {
    if (filter === void 0) { filter = function (_) { return true; }; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(internal_1.loginServers.filter(filter).map(action))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function forAllGameServers(action, filter) {
    if (filter === void 0) { filter = function (_) { return true; }; }
    return __awaiter(this, void 0, void 0, function () {
        var liveServers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    liveServers = internal_1.servers.filter(function (s) { return !s.state.dead; });
                    return [4 /*yield*/, Promise.all(liveServers.filter(filter).map(action))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.forAllGameServers = forAllGameServers;
function actionForAllServers(action, accountId) {
    return forAllGameServers(function (s) { return s.api.action(action, accountId); });
}
exports.actionForAllServers = actionForAllServers;
function kickFromAllServers(accountId) {
    return forAllGameServers(function (s) { return s.api.kick(accountId, undefined); });
}
exports.kickFromAllServers = kickFromAllServers;
function kickFromAllServersByCharacter(characterId) {
    return forAllGameServers(function (s) { return s.api.kick(undefined, characterId); });
}
exports.kickFromAllServersByCharacter = kickFromAllServersByCharacter;
function createFilter(id) {
    return function (server) { return id === '*' || server.id === id; };
}
function notifyUpdate(server) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        forAllLoginServers(function (s) { return s.api.updateLiveSettings({ updating: true }); }, createFilter(server)),
                        forAllGameServers(function (s) { return s.api.notifyUpdate(); }, createFilter(server)),
                    ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.notifyUpdate = notifyUpdate;
function shutdownServers(server, value) {
    return forAllGameServers(function (s) { return s.api.shutdownServer(value); }, createFilter(server));
}
exports.shutdownServers = shutdownServers;
function resetUpdating(server) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        forAllLoginServers(function (s) { return s.api.updateLiveSettings({ updating: false }); }, createFilter(server)),
                        forAllGameServers(function (s) { return s.api.cancelUpdate(); }, createFilter(server)),
                        shutdownServers(server, false),
                    ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.resetUpdating = resetUpdating;
function reloadSettingsOnAllServers() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        forAllLoginServers(function (s) { return s.api.reloadSettings(); }),
                        forAllGameServers(function (s) { return s.api.reloadSettings(); }),
                    ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.reloadSettingsOnAllServers = reloadSettingsOnAllServers;
function getChat(search, date, caseInsensitive) {
    return __awaiter(this, void 0, void 0, function () {
        function fetchChatlog(lines) {
            return __awaiter(this, void 0, void 0, function () {
                var logFile, stdout;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            logFile = paths.pathTo('logs', "info." + moment(date).format('YYYYMMDD') + ".log");
                            return [4 /*yield*/, serverUtils_1.execAsync("grep " + flags + "\"" + query + "\" \"" + logFile + "\" | tail -n " + lines, options)];
                        case 1:
                            stdout = (_a.sent()).stdout;
                            return [2 /*return*/, stdout];
                    }
                });
            });
        }
        var query, flags, options, stdout, lines, more, log, e_1, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = search
                        .replace(/\\/g, '\\\\')
                        .replace(/"/g, '\\"')
                        .replace(/\./g, '\\.')
                        .replace(/\*/g, '\\*')
                        .replace(/\$/g, '\\*')
                        .replace(/\^/g, '\\*');
                    flags = caseInsensitive ? '-i -E ' : '-E ';
                    options = { maxBuffer: 1 * 1024 * 1024 };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 13]);
                    if (!!search) return [3 /*break*/, 2];
                    return [2 /*return*/, ''];
                case 2:
                    if (!(date === 'all')) return [3 /*break*/, 4];
                    return [4 /*yield*/, serverUtils_1.execAsync("for f in " + paths.pathTo('logs') + "/*.log; do "
                            + "echo \"$f\" | grep -o '[0-9]*';"
                            + ("cat \"$f\" | grep " + flags + "\"" + query + "\";")
                            + "done", options)];
                case 3:
                    stdout = (_a.sent()).stdout;
                    return [2 /*return*/, stdout];
                case 4:
                    lines = 8192;
                    more = '';
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, fetchChatlog(lines)];
                case 6:
                    log = _a.sent();
                    return [2 /*return*/, more + log];
                case 7:
                    e_1 = _a.sent();
                    if (e_1.message !== 'stdout maxBuffer exceeded') {
                        throw e_1;
                    }
                    return [3 /*break*/, 8];
                case 8:
                    lines /= 2;
                    more = '... more lines ...\n';
                    _a.label = 9;
                case 9:
                    if (lines > 1) return [3 /*break*/, 5];
                    _a.label = 10;
                case 10: return [2 /*return*/, '<error size exceeded>'];
                case 11: return [3 /*break*/, 13];
                case 12:
                    e_2 = _a.sent();
                    console.error('Failed to fetch chatlog: ', e_2);
                    return [2 /*return*/, '<error>'];
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.getChat = getChat;
function getChatForAccounts(accountIds, date) {
    return __awaiter(this, void 0, void 0, function () {
        var accounts, map, ids, _loop_1, _i, accounts_1, a, chat, fixed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Account.find({ _id: { $in: accountIds } }, '_id merges').lean().exec()];
                case 1:
                    accounts = _a.sent();
                    map = new Map();
                    ids = utils_1.flatten(accounts.map(function (a) { return __spreadArray([a._id.toString()], (a.merges || []).map(function (a) { return a.id; })); }));
                    _loop_1 = function (a) {
                        var index = accountIds.indexOf(a._id.toString());
                        map.set(a._id.toString(), index ? "[" + index + "]" : "");
                        (a.merges || []).forEach(function (_a) {
                            var id = _a.id;
                            map.set(id, index ? "[" + index + ":merged]" : "[merged]");
                        });
                    };
                    for (_i = 0, accounts_1 = accounts; _i < accounts_1.length; _i++) {
                        a = accounts_1[_i];
                        _loop_1(a);
                    }
                    return [4 /*yield*/, getChat(ids.join('|'), date, false)];
                case 2:
                    chat = _a.sent();
                    fixed = chat.replace(/^([0-9:]+) \[([a-f0-9]{24})\]/gmu, function (_, date, id) {
                        return date + " " + (map.has(id) ? map.get(id) : "[" + id + "]");
                    });
                    return [2 /*return*/, fixed];
            }
        });
    });
}
exports.getChatForAccounts = getChatForAccounts;
function clearSessions(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var clearIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearIds = [];
                    return [4 /*yield*/, db_1.iterate(db_1.Session.find({ session: { $exists: true } }).lean(), function (session) {
                            try {
                                if (session.session) {
                                    var data = JSON.parse(session.session);
                                    var user = data && data.passport && data.passport.user;
                                    if (user === accountId) {
                                        clearIds.push(session._id);
                                    }
                                }
                            }
                            catch (e) {
                                logger_1.logger.error('Error when claring session', e, session._id, session.session);
                            }
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.Session.deleteOne({ _id: { $in: clearIds } }).exec()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.clearSessions = clearSessions;
function updateOrigin(update) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Origin.updateOne({ ip: update.ip }, update, { upsert: true }).exec()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateOrigin = updateOrigin;
function getUserCounts() {
    return __awaiter(this, void 0, void 0, function () {
        var statsFile, content, lines, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    statsFile = paths.pathTo('settings', "user-counts.log");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFileAsync(statsFile, 'utf8')];
                case 2:
                    content = _b.sent();
                    lines = content.trim().split(/\n/);
                    return [2 /*return*/, lines.map(function (line) { return JSON.parse(line); })];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getUserCounts = getUserCounts;
function convertInvite(invite) {
    return {
        _id: invite._id.toString(),
        name: invite.name,
        info: invite.info,
        source: invite.source.toHexString(),
        target: invite.target.toHexString(),
        active: invite.active,
        updatedAt: invite.updatedAt,
        createdAt: invite.createdAt,
    };
}
function getAccountDetails(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, account, invitesReceived, invitesSent;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        db_1.findAccount(accountId, 'merges supporterLog banLog state'),
                        db_1.SupporterInvite.find({ target: accountId }).exec(),
                        db_1.SupporterInvite.find({ source: accountId }).exec(),
                    ])];
                case 1:
                    _a = _b.sent(), account = _a[0], invitesReceived = _a[1], invitesSent = _a[2];
                    return [2 /*return*/, account ? {
                            merges: account.merges || [],
                            banLog: account.banLog || [],
                            supporterLog: account.supporterLog || [],
                            invitesReceived: invitesReceived.map(convertInvite),
                            invitesSent: invitesSent.map(convertInvite),
                            state: account.state || {},
                        } : {
                            merges: [],
                            banLog: [],
                            supporterLog: [],
                            invitesReceived: [],
                            invitesSent: [],
                            state: {},
                        }];
            }
        });
    });
}
exports.getAccountDetails = getAccountDetails;
function getOtherStats(service) {
    return __awaiter(this, void 0, void 0, function () {
        var totalIgnores, authsWithEmptyAccount, authsWithMissingAccount, _i, _a, account, _b, _c, auth;
        return __generator(this, function (_d) {
            totalIgnores = 0;
            authsWithEmptyAccount = 0;
            authsWithMissingAccount = 0;
            for (_i = 0, _a = service.accounts.items; _i < _a.length; _i++) {
                account = _a[_i];
                totalIgnores += account.ignoresCount;
            }
            for (_b = 0, _c = service.auths.items; _b < _c.length; _b++) {
                auth = _c[_b];
                if (!auth.account) {
                    authsWithEmptyAccount++;
                }
                else if (!service.accounts.get(auth.account)) {
                    authsWithMissingAccount++;
                }
            }
            return [2 /*return*/, {
                    totalIgnores: totalIgnores,
                    authsWithEmptyAccount: authsWithEmptyAccount,
                    authsWithMissingAccount: authsWithMissingAccount,
                }];
        });
    });
}
exports.getOtherStats = getOtherStats;
function updateServerSettings(currentSettings, update) {
    return __awaiter(this, void 0, void 0, function () {
        var settings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve(settings_1.loadSettings())];
                case 1:
                    settings = _a.sent();
                    Object.assign(currentSettings, settings, update);
                    return [4 /*yield*/, settings_1.saveSettings(currentSettings)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, reloadSettingsOnAllServers()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateServerSettings = updateServerSettings;
function updateGameServerSettings(currentSettings, serverId, update) {
    return __awaiter(this, void 0, void 0, function () {
        var settings, serverSettings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve(settings_1.loadSettings())];
                case 1:
                    settings = _a.sent();
                    Object.assign(currentSettings, settings);
                    serverSettings = currentSettings.servers[serverId] = currentSettings.servers[serverId] || {};
                    Object.assign(serverSettings, update);
                    return [4 /*yield*/, settings_1.saveSettings(currentSettings)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, reloadSettingsOnAllServers()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateGameServerSettings = updateGameServerSettings;
//# sourceMappingURL=admin.js.map