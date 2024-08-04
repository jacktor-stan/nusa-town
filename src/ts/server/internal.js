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
exports.createRemovedDocument = exports.accountHidden = exports.accountAround = exports.accountStatus = exports.accountMerged = exports.accountChanged = exports.init = exports.createJoin = exports.createApi = exports.getServer = exports.getLoginServer = exports.findServer = exports.servers = exports.adminServer = exports.loginServers = exports.serverStatus = void 0;
var request = require("request-promise");
var lodash_1 = require("lodash");
var accountUtils_1 = require("../common/accountUtils");
var utils_1 = require("../common/utils");
var config_1 = require("./config");
var logger_1 = require("./logger");
var db_1 = require("./db");
var internal_1 = require("./api/internal");
var userError_1 = require("./userError");
// import { taskQueue } from './utils/taskQueue';
exports.serverStatus = {
    diskSpace: '',
    memoryUsage: '',
    certificateExpiration: '',
    lastPatreonUpdate: '',
};
exports.loginServers = [
    {
        id: 'login',
        state: {
            updating: false,
            dead: true,
        },
        api: createApi(config_1.config.local, 'api-internal-login', config_1.config.token),
    },
];
exports.adminServer = config_1.config.adminLocal && !config_1.args.admin ? {
    id: 'admin',
    api: createApi(config_1.config.adminLocal, 'api-internal-admin', config_1.config.token),
} : undefined;
exports.servers = [];
if (config_1.args.login || config_1.args.admin) {
    exports.servers.push.apply(exports.servers, config_1.gameServers.map(function (s) { return ({
        id: s.id,
        state: __assign(__assign({}, s), { offline: true, dead: true, maps: 0, online: 0, onMain: 0, queued: 0, shutdown: false, filter: false, settings: {} }),
        api: createApi(s.local, 'api-internal', config_1.config.token),
    }); }));
}
function findServer(id) {
    return utils_1.findById(exports.servers, id);
}
exports.findServer = findServer;
function getLoginServer(_id) {
    return exports.loginServers[0];
}
exports.getLoginServer = getLoginServer;
function getServer(id) {
    var server = findServer(id);
    if (!server) {
        throw new Error("Invalid server ID (" + id + ")");
    }
    return server;
}
exports.getServer = getServer;
function createApi(host, url, apiToken) {
    return new Proxy({}, {
        get: function (_, key) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Promise.resolve(request("http://" + host + "/" + url + "/api", {
                    json: true,
                    headers: { 'api-token': apiToken },
                    method: 'post',
                    body: { method: key, args: args },
                }));
            };
        },
    });
}
exports.createApi = createApi;
function mapGameServers(action) {
    return Promise.all(exports.servers.filter(function (s) { return !s.state.dead; }).map(action));
}
function createJoin() {
    return join;
}
exports.createJoin = createJoin;
function join(joinServer, account, character) {
    return __awaiter(this, void 0, void 0, function () {
        var kicked, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, mapGameServers(function (s) {
                            if (accountUtils_1.isMod(account) && s !== joinServer) {
                                return false;
                            }
                            else {
                                return s.api.kick(account._id.toString(), undefined).catch(function (e) { return (logger_1.logger.error(e), false); });
                            }
                        })];
                case 1:
                    kicked = _a.sent();
                    if (!kicked.some(function (x) { return x; })) return [3 /*break*/, 3];
                    return [4 /*yield*/, utils_1.delay(2000)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, joinServer.api.join(account._id.toString(), character._id.toString())];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    error_1 = _a.sent();
                    if (error_1.error && error_1.error.userError) {
                        throw new userError_1.UserError(error_1.error.error);
                    }
                    else {
                        logger_1.logger.error(error_1);
                        throw new Error('Internal error');
                    }
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
var accountChangedHandler = function (_accountId) { return Promise.resolve(); };
function init(world, tokens) {
    accountChangedHandler = internal_1.createAccountChanged(world, tokens, db_1.findAccountSafe);
}
exports.init = init;
function accountChanged(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(config_1.args.login || config_1.args.admin)) return [3 /*break*/, 2];
                    return [4 /*yield*/, mapGameServers(function (s) {
                            s.api.accountChanged(accountId).catch(lodash_1.noop);
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, accountChangedHandler(accountId)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.accountChanged = accountChanged;
function accountMerged(accountId, mergedId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mapGameServers(function (s) { s.api.accountMerged(accountId, mergedId).catch(lodash_1.noop); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.accountMerged = accountMerged;
function accountStatus(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var statuses;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mapGameServers(function (s) { return s.api.accountStatus(accountId).catch(function () { return ({ online: false }); }); })];
                case 1:
                    statuses = _a.sent();
                    return [2 /*return*/, statuses.filter(function (s) { return !!s.online; })];
            }
        });
    });
}
exports.accountStatus = accountStatus;
function accountAround(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mapGameServers(function (s) { return s.api.accountAround(accountId).catch(function () { return []; }); })];
                case 1:
                    users = _a.sent();
                    return [2 /*return*/, utils_1.flatten(users).sort(function (a, b) { return a.distance - b.distance; }).slice(0, 10)];
            }
        });
    });
}
exports.accountAround = accountAround;
function accountHidden(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, users, permaHidden, permaHiddenBy;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        mapGameServers(function (s) { return s.api.accountHidden(accountId).catch(function () { return ({ account: '', hidden: [], hiddenBy: [] }); }); }),
                        db_1.findHideIds(accountId),
                        db_1.findHideIdsRev(accountId),
                    ])];
                case 1:
                    _a = _b.sent(), users = _a[0], permaHidden = _a[1], permaHiddenBy = _a[2];
                    return [2 /*return*/, {
                            account: accountId,
                            hidden: lodash_1.uniq(lodash_1.flatMap(users, function (u) { return u.hidden; })),
                            hiddenBy: lodash_1.uniq(lodash_1.flatMap(users, function (u) { return u.hiddenBy; })),
                            permaHidden: permaHidden,
                            permaHiddenBy: permaHiddenBy,
                        }];
            }
        });
    });
}
exports.accountHidden = accountHidden;
var createRemovedDocument = function (endPoints, adminService) {
    return function (model, id) {
        endPoints && model in endPoints && endPoints[model].removedItem(id);
        adminService && adminService.removedItem(model, id);
        return exports.adminServer ? exports.adminServer.api.removedDocument(model, id).catch(lodash_1.noop) : Promise.resolve();
    };
};
exports.createRemovedDocument = createRemovedDocument;
//# sourceMappingURL=internal.js.map