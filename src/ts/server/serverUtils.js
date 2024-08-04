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
exports.cached = exports.handlePromiseDefault = exports.getMemoryUsage = exports.getCertificateExpirationDate = exports.getDiskSpace = exports.logErrorToFile = exports.execAsync = exports.toSocialSite = exports.toSocialSiteFields = exports.toPonyObjectAdmin = exports.toPonyObject = exports.toPonyObjectFields = exports.toAccountData = exports.isServerOffline = exports.tokenService = void 0;
var fs = require("fs");
var child_process_1 = require("child_process");
var lodash_1 = require("lodash");
var adminUtils_1 = require("../common/adminUtils");
var utils_1 = require("../common/utils");
var paths = require("./paths");
function tokenService(socket) {
    return {
        clearTokensForAccount: function (accountId) {
            socket.clearTokens(function (_, data) { return data.accountId === accountId; });
        },
        clearTokensAll: function () {
            socket.clearTokens(function () { return true; });
        },
        createToken: function (token) {
            return socket.token(token);
        }
    };
}
exports.tokenService = tokenService;
function isServerOffline(server) {
    return server.state.dead || !!server.state.settings.isServerOffline || !!server.state.shutdown;
}
exports.isServerOffline = isServerOffline;
function toAccountData(account) {
    var _id = account._id, name = account.name, birthdate = account.birthdate, birthyear = account.birthyear, characterCount = account.characterCount, roles = account.roles, settings = account.settings, flags = account.flags;
    return {
        id: _id.toString(),
        name: name,
        characterCount: characterCount,
        birthdate: birthdate && utils_1.formatISODate(birthdate) || '',
        birthyear: birthyear,
        settings: utils_1.cloneDeep(settings || {}),
        supporter: adminUtils_1.supporterLevel(account) || undefined,
        roles: (roles && roles.length) ? __spreadArray([], roles) : undefined,
        flags: (utils_1.hasFlag(flags, 4 /* DuplicatesNotification */) ? 1 /* Duplicates */ : 0) |
            (adminUtils_1.isPastSupporter(account) ? 4 /* PastSupporter */ : 0),
    };
}
exports.toAccountData = toAccountData;
exports.toPonyObjectFields = '_id name info desc site tag lastUsed flags';
function toPonyObject(character) {
    return character ? {
        id: character._id.toString(),
        name: character.name,
        desc: character.desc || '',
        info: character.info || '',
        site: character.site ? character.site.toString() : undefined,
        tag: character.tag || undefined,
        lastUsed: character.lastUsed && character.lastUsed.toISOString(),
        hideSupport: utils_1.hasFlag(character.flags, 4 /* HideSupport */) ? true : undefined,
        respawnAtSpawn: utils_1.hasFlag(character.flags, 8 /* RespawnAtSpawn */) ? true : undefined,
    } : null;
}
exports.toPonyObject = toPonyObject;
function toPonyObjectAdmin(character) {
    return character ? __assign(__assign({}, toPonyObject(character)), { creator: character.creator }) : null;
}
exports.toPonyObjectAdmin = toPonyObjectAdmin;
exports.toSocialSiteFields = '_id name provider url';
function toSocialSite(_a) {
    var _id = _a._id, name = _a.name, provider = _a.provider, url = _a.url;
    return { id: _id.toString(), name: name, provider: provider, url: url };
}
exports.toSocialSite = toSocialSite;
/* istanbul ignore next */
function execAsync(command, options) {
    return new Promise(function (resolve, reject) {
        child_process_1.exec(command, options || {}, function (error, stdout, stderr) {
            if (error) {
                reject(error);
            }
            else {
                resolve({ stdout: stdout, stderr: stderr });
            }
        });
    });
}
exports.execAsync = execAsync;
/* istanbul ignore next */
function logErrorToFile(message, data) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileName = "error-" + Date.now() + ".json";
                    filePath = paths.pathTo('store', fileName);
                    return [4 /*yield*/, fs.writeFileAsync(filePath, JSON.stringify({ message: message, data: data }, null, 2), 'utf8')];
                case 1:
                    _a.sent();
                    return [2 /*return*/, fileName];
            }
        });
    });
}
exports.logErrorToFile = logErrorToFile;
/* istanbul ignore next */
function getDiskSpace() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // NOTE: add your own code here
            return [2 /*return*/, ''];
        });
    });
}
exports.getDiskSpace = getDiskSpace;
/* istanbul ignore next */
function getCertificateExpirationDate() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // NOTE: add your own code here
            return [2 /*return*/, ''];
        });
    });
}
exports.getCertificateExpirationDate = getCertificateExpirationDate;
/* istanbul ignore next */
function getMemoryUsage() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // NOTE: add your own code here
            return [2 /*return*/, "0%"];
        });
    });
}
exports.getMemoryUsage = getMemoryUsage;
/* istanbul ignore next */
function handlePromiseDefault(promise, errorHandler) {
    if (errorHandler === void 0) { errorHandler = lodash_1.noop; }
    Promise.resolve(promise).catch(errorHandler);
}
exports.handlePromiseDefault = handlePromiseDefault;
function cached(func, cacheTimeout) {
    if (cacheTimeout === void 0) { cacheTimeout = 1000; }
    var cacheMap = new Map();
    var cachedFunc = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var cacheKey = JSON.stringify(args);
        var cache = cacheMap.get(cacheKey);
        if (cache) {
            clearTimeout(cache.timeout);
            cache.timeout = setTimeout(function () { return cacheMap.delete(cacheKey); }, cacheTimeout);
            return cache.result;
        }
        else {
            var result = func.apply(void 0, args);
            var timeout = setTimeout(function () { return cacheMap.delete(cacheKey); }, cacheTimeout);
            cacheMap.set(cacheKey, { result: result, timeout: timeout });
            return result;
        }
    };
    cachedFunc.clear = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        cacheMap.delete(JSON.stringify(args));
    };
    return cachedFunc;
}
exports.cached = cached;
//# sourceMappingURL=serverUtils.js.map