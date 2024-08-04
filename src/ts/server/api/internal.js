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
exports.createInternalApi = exports.createShutdownServer = exports.createCancelUpdate = exports.createNotifyUpdate = exports.createKickAll = exports.createKick = exports.createAction = exports.createGetStatsTable = exports.createGetServerStats = exports.createGetServerState = exports.createJoin = exports.createTeleportTo = exports.createHiddenStats = exports.createAccountAround = exports.createAccountStatus = exports.createAccountMerged = exports.createAccountChanged = void 0;
var adminUtils_1 = require("../../common/adminUtils");
var db_1 = require("../db");
var world_1 = require("../world");
var hiding_1 = require("../services/hiding");
var accountUtils_1 = require("../../common/accountUtils");
var internal_common_1 = require("./internal-common");
var userError_1 = require("../userError");
var liveSettings_1 = require("../liveSettings");
var utils_1 = require("../../common/utils");
var timing_1 = require("../timing");
var lodash_1 = require("lodash");
var serverMap_1 = require("../serverMap");
var playerUtils_1 = require("../playerUtils");
var worldPerfStats_1 = require("../worldPerfStats");
var createAccountChanged = function (world, tokens, findAccount) {
    return function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findAccount(accountId)];
                case 1:
                    account = _a.sent();
                    world.accountUpdated(account);
                    if (adminUtils_1.isBanned(account)) {
                        tokens.clearTokensForAccount(accountId);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
};
exports.createAccountChanged = createAccountChanged;
var createAccountMerged = function (hiding) {
    return function (accountId, mergedId) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, hiding.merged(accountId, mergedId)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    }); }); };
};
exports.createAccountMerged = createAccountMerged;
function toAccountStatus(client, server) {
    return client ? {
        online: true,
        character: client.characterName,
        server: server.id,
        map: client.map.id || '-',
        x: Math.round(client.pony.x),
        y: Math.round(client.pony.y),
        userAgent: client.userAgent,
        incognito: client.incognito,
        duration: utils_1.formatDuration(Date.now() - client.connectedTime),
    } : { online: false };
}
var createAccountStatus = function (world, server) {
    return function (accountId) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, toAccountStatus(world_1.findClientByAccountId(world, accountId), server)];
    }); }); };
};
exports.createAccountStatus = createAccountStatus;
var createAccountAround = function (world) {
    return function (accountId) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, world_1.findClientsAroundAccountId(world, accountId)];
    }); }); };
};
exports.createAccountAround = createAccountAround;
var createHiddenStats = function (hiding) {
    return function (accountId) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, hiding.getStatsFor(accountId)];
    }); }); };
};
exports.createHiddenStats = createHiddenStats;
var createTeleportTo = function (world) {
    return function (adminAccountId, targetAccountId) { return __awaiter(void 0, void 0, void 0, function () {
        var admin, target;
        return __generator(this, function (_a) {
            admin = world_1.findClientByAccountId(world, adminAccountId);
            target = world_1.findClientByAccountId(world, targetAccountId);
            if (admin && target && admin.map === target.map) {
                playerUtils_1.teleportTo(admin, target.pony.x, target.pony.y);
            }
            return [2 /*return*/];
        });
    }); };
};
exports.createTeleportTo = createTeleportTo;
function setupPonyAuth(character, account, findAuth) {
    return __awaiter(this, void 0, void 0, function () {
        var auth;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!character.site) return [3 /*break*/, 2];
                    return [4 /*yield*/, findAuth(character.site, account._id)];
                case 1:
                    auth = _a.sent();
                    if (auth && !auth.disabled && !auth.banned) {
                        character.auth = auth;
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
var createJoin = function (world, getSettings, server, _a, findAccount, findCharacter, findAuth, live, hasInvite) {
    var clearTokensForAccount = _a.clearTokensForAccount, createToken = _a.createToken;
    return function (accountId, characterId) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, account, character, supporterInvited;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (getSettings().isServerOffline || live.shutdown) {
                        throw new userError_1.UserError('Server is offline');
                    }
                    return [4 /*yield*/, Promise.all([
                            findAccount(accountId),
                            findCharacter(characterId, accountId),
                            hasInvite(accountId),
                        ])];
                case 1:
                    _a = _b.sent(), account = _a[0], character = _a[1], supporterInvited = _a[2];
                    if (!accountUtils_1.meetsRequirement({ roles: account.roles, supporter: adminUtils_1.supporterLevel(account), supporterInvited: supporterInvited }, server.require)) {
                        throw new userError_1.UserError('Server is restricted');
                    }
                    return [4 /*yield*/, setupPonyAuth(character, account, findAuth)];
                case 2:
                    _b.sent();
                    character.lastUsed = new Date();
                    account.settings = __assign(__assign({}, account.settings), { defaultServer: server.id });
                    account.lastVisit = new Date();
                    if (!account.settings.hidden) {
                        account.lastOnline = new Date();
                        account.lastCharacter = character._id;
                    }
                    return [4 /*yield*/, Promise.all([character.save(), account.save()])];
                case 3:
                    _b.sent();
                    world.kickByAccount(accountId);
                    clearTokensForAccount(accountId);
                    return [2 /*return*/, createToken({ accountId: accountId, account: account, character: character })];
            }
        });
    }); };
};
exports.createJoin = createJoin;
function getClientCountOnMainMap(world) {
    var count = 0;
    var map = world.getMainMap();
    for (var _i = 0, _a = world.clients; _i < _a.length; _i++) {
        var client = _a[_i];
        if (client.map === map) {
            count++;
        }
    }
    return count;
}
var createGetServerState = function (server, getSettings, world, live) {
    return function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ({
                    id: server.id,
                    name: server.name,
                    path: server.path,
                    desc: server.desc,
                    flag: server.flag,
                    host: server.host,
                    alert: server.alert,
                    flags: server.flags,
                    require: server.require,
                    dead: false,
                    shutdown: live.shutdown,
                    maps: world.maps.length,
                    online: world.clients.length,
                    onMain: getClientCountOnMainMap(world),
                    queued: world.joinQueue.length,
                    settings: getSettings(),
                })];
        });
    }); };
};
exports.createGetServerState = createGetServerState;
var createGetServerStats = function (statsTracker) {
    return function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, statsTracker.getSocketStats()];
    }); }); };
};
exports.createGetServerStats = createGetServerStats;
var createGetStatsTable = function (world) {
    return function (stats) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (stats) {
                case 0 /* Country */:
                    return [2 /*return*/, getCountryStats(world)];
                case 1 /* Support */:
                    return [2 /*return*/, getSupportStats(world)];
                case 2 /* Maps */:
                    return [2 /*return*/, getMapStats(world)];
                default:
                    utils_1.invalidEnum(stats);
                    return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    }); };
};
exports.createGetStatsTable = createGetStatsTable;
var createAction = function (world) {
    return function (action, accountId) { return __awaiter(void 0, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (action) {
                case 'unstuck':
                    client = world_1.findClientByAccountId(world, accountId);
                    if (client) {
                        world.resetToSpawn(client);
                        world.kick(client, 'unstuck');
                    }
                    break;
                default:
                    throw new Error("Invalid action (" + action + ")");
            }
            return [2 /*return*/];
        });
    }); };
};
exports.createAction = createAction;
var createKick = function (world, _a) {
    var clearTokensForAccount = _a.clearTokensForAccount;
    return function (accountId, characterId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (accountId) {
                clearTokensForAccount(accountId);
                return [2 /*return*/, world.kickByAccount(accountId)];
            }
            else if (characterId) {
                return [2 /*return*/, world.kickByCharacter(characterId)];
            }
            else {
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    }); };
};
exports.createKick = createKick;
var createKickAll = function (world, _a) {
    var clearTokensAll = _a.clearTokensAll;
    return function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            world.kickAll();
            clearTokensAll();
            return [2 /*return*/];
        });
    }); };
};
exports.createKickAll = createKickAll;
var createNotifyUpdate = function (world, live) {
    return function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            live.updating = true;
            world.notifyUpdate();
            world.saveClientStates();
            return [2 /*return*/];
        });
    }); };
};
exports.createNotifyUpdate = createNotifyUpdate;
var createCancelUpdate = function (live) {
    return function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            live.updating = false;
            return [2 /*return*/];
        });
    }); };
};
exports.createCancelUpdate = createCancelUpdate;
var createShutdownServer = function (world, live) {
    return function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            live.shutdown = value;
            if (live.shutdown) {
                world.kickAll();
                hiding_1.saveHidingData(world.hidingService, world.server.id);
            }
            return [2 /*return*/];
        });
    }); };
};
exports.createShutdownServer = createShutdownServer;
/* istanbul ignore next */
function createInternalApi(world, server, reloadSettings, getSettings, tokens, hiding, statsTracker, live) {
    var _this = this;
    return {
        reloadSettings: internal_common_1.createReloadSettings(reloadSettings),
        state: exports.createGetServerState(server, getSettings, world, live),
        stats: exports.createGetServerStats(statsTracker),
        statsTable: exports.createGetStatsTable(world),
        action: exports.createAction(world),
        join: exports.createJoin(world, getSettings, server, tokens, db_1.findAccountSafe, db_1.findCharacterSafe, db_1.findAuth, live, db_1.hasActiveSupporterInvites),
        kick: exports.createKick(world, tokens),
        kickAll: exports.createKickAll(world, tokens),
        accountChanged: exports.createAccountChanged(world, tokens, db_1.findAccountSafe),
        accountMerged: exports.createAccountMerged(hiding),
        accountStatus: exports.createAccountStatus(world, server),
        accountAround: exports.createAccountAround(world),
        notifyUpdate: exports.createNotifyUpdate(world, liveSettings_1.liveSettings),
        cancelUpdate: exports.createCancelUpdate(liveSettings_1.liveSettings),
        shutdownServer: exports.createShutdownServer(world, live),
        accountHidden: exports.createHiddenStats(hiding),
        getTimings: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, timing_1.timingEntries()];
        }); }); },
        setTimingEnabled: function (isEnabled) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, timing_1.setTimingEnabled(isEnabled)];
        }); }); },
        getWorldPerfStats: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, worldPerfStats_1.getWorldPerfStats()];
        }); }); },
        teleportTo: exports.createTeleportTo(world),
    };
}
exports.createInternalApi = createInternalApi;
function getCountryStats(world) {
    return __spreadArray([
        ['country', 'users']
    ], lodash_1.toPairs(lodash_1.groupBy(world.clients, function (c) { return c.country; }))
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return ({ key: key, count: value.length });
    })
        .sort(function (a, b) { return b.count - a.count; })
        .map(function (_a) {
        var key = _a.key, count = _a.count;
        return [key, count.toString()];
    }));
}
function getSupportStats(world) {
    var wasmYes = 0;
    var wasmNo = 0;
    var letAndConstYes = 0;
    var letAndConstNo = 0;
    for (var _i = 0, _a = world.clients; _i < _a.length; _i++) {
        var client = _a[_i];
        if (client.supportsWasm) {
            wasmYes++;
        }
        else {
            wasmNo++;
        }
        if (client.supportsLetAndConst) {
            letAndConstYes++;
        }
        else {
            letAndConstNo++;
        }
    }
    function percent(yes, no) {
        return (yes * 100 / ((yes + no) || 1)).toFixed(0) + '%';
    }
    return [
        ['supports', 'yes', 'no', ''],
        ['wasm', wasmYes.toString(), wasmNo.toString(), percent(wasmYes, wasmNo)],
        ['let & const', letAndConstYes.toString(), letAndConstNo.toString(), percent(letAndConstYes, letAndConstNo)],
    ];
}
function getMapStats(world) {
    return __spreadArray([
        ['id', 'instance', 'entities', 'players', 'memory']
    ], world.maps.map(function (map) {
        var _a = serverMap_1.getSizeOfMap(map), entities = _a.entities, memory = _a.memory;
        return [
            map.id || 'main',
            map.instance || '',
            entities.toString(),
            world.clients.reduce(function (sum, c) { return sum + (c.map === map ? 1 : 0); }, 0).toString(),
            (memory / 1024).toFixed() + " kb",
        ];
    }));
}
//# sourceMappingURL=internal.js.map