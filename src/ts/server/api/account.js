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
exports.removeHide = exports.createRemoveSite = exports.createUpdateSettings = exports.createUpdateAccount = exports.createGetAccountCharacters = exports.getHides = exports.getFriends = exports.createGetAccountData = exports.modCheck = exports.allEntities = void 0;
var moment = require("moment");
var constants_1 = require("../../common/constants");
var accountUtils_1 = require("../../common/accountUtils");
var clientUtils_1 = require("../../client/clientUtils");
var serverUtils_1 = require("../serverUtils");
var db_1 = require("../db");
var userError_1 = require("../userError");
var entities = require("../../common/entities");
var utils_1 = require("../../common/utils");
var accountUtils_2 = require("../accountUtils");
var adminUtils_1 = require("../../common/adminUtils");
var exclude = [
    'getEntityType', 'getEntityTypeName', 'createAnEntity', 'createEntity', 'pony',
    'createBaseEntity', 'getEntityTypesAndNames',
];
exports.allEntities = Object.keys(entities)
    .filter(function (key) { return typeof entities[key] === 'function'; })
    .filter(function (key) { return !utils_1.includes(exclude, key); });
function getEntityNamesToTypes() {
    var result = [];
    for (var _i = 0, allEntities_1 = exports.allEntities; _i < allEntities_1.length; _i++) {
        var name_1 = allEntities_1[_i];
        var created = entities[name_1](0, 0);
        var array = Array.isArray(created) ? created : [created];
        var types = array.map(function (e) { return e.type; });
        result.push({ name: name_1, types: types });
    }
    return result;
}
var entitiesInfo = {
    typeToName: entities.getEntityTypesAndNames(),
    nameToTypes: getEntityNamesToTypes(),
    names: exports.allEntities,
};
var actions = [
    { name: 'kick', action: 4 /* Kick */ },
    { name: 'ban', action: 5 /* Ban */ },
];
exports.modCheck = { hgf: { bvc: { wer: { ngf: {} } } }, actions: actions };
function fixUpdateAccountData(update) {
    var fixed = {};
    if (update) {
        if (update.name && typeof update.name === 'string') {
            var name_2 = clientUtils_1.cleanName(update.name);
            if (name_2.length >= constants_1.ACCOUNT_NAME_MIN_LENGTH && name_2.length <= constants_1.ACCOUNT_NAME_MAX_LENGTH) {
                fixed.name = name_2;
            }
        }
        if (update.birthdate && typeof update.birthdate === 'string') {
            fixed.birthdate = update.birthdate;
        }
    }
    return fixed;
}
function fixAccountSettings(settings) {
    var fixed = {};
    if (settings) {
        if (settings.defaultServer !== undefined) {
            fixed.defaultServer = "" + settings.defaultServer;
        }
        if (settings.filterCyrillic !== undefined) {
            fixed.filterCyrillic = !!settings.filterCyrillic;
        }
        if (settings.filterSwearWords !== undefined) {
            fixed.filterSwearWords = !!settings.filterSwearWords;
        }
        if (settings.ignorePartyInvites !== undefined) {
            fixed.ignorePartyInvites = !!settings.ignorePartyInvites;
        }
        if (settings.ignoreFriendInvites !== undefined) {
            fixed.ignoreFriendInvites = !!settings.ignoreFriendInvites;
        }
        if (settings.ignorePublicChat !== undefined) {
            fixed.ignorePublicChat = !!settings.ignorePublicChat;
        }
        if (settings.ignoreNonFriendWhispers !== undefined) {
            fixed.ignoreNonFriendWhispers = !!settings.ignoreNonFriendWhispers;
        }
        if (settings.chatlogOpacity !== undefined) {
            fixed.chatlogOpacity = utils_1.clamp(settings.chatlogOpacity | 0, 0, 100);
        }
        if (settings.chatlogRange !== undefined) {
            fixed.chatlogRange = utils_1.clamp(settings.chatlogRange | 0, constants_1.MIN_CHATLOG_RANGE, constants_1.MAX_CHATLOG_RANGE);
        }
        if (settings.seeThroughObjects !== undefined) {
            fixed.seeThroughObjects = !!settings.seeThroughObjects;
        }
        if (settings.filterWords !== undefined) {
            fixed.filterWords = "" + settings.filterWords;
        }
        if (settings.actions !== undefined) {
            fixed.actions = "" + settings.actions;
        }
        if (settings.hidden !== undefined) {
            fixed.hidden = !!settings.hidden;
        }
    }
    return fixed;
}
var createGetAccountData = function (findCharacters, findAuths) {
    return function (account) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ponies, auths, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        findCharacters(account._id, serverUtils_1.toPonyObjectFields),
                        findAuths(account._id, serverUtils_1.toSocialSiteFields),
                    ])];
                case 1:
                    _a = _b.sent(), ponies = _a[0], auths = _a[1];
                    data = serverUtils_1.toAccountData(account);
                    data.ponies = ponies.map(serverUtils_1.toPonyObject);
                    data.sites = auths.map(serverUtils_1.toSocialSite);
                    data.alert = accountUtils_2.getAccountAlertMessage(account);
                    if (accountUtils_1.isMod(account)) {
                        data.check = exports.modCheck;
                    }
                    if (BETA && accountUtils_1.isMod(account)) {
                        data.editor = entitiesInfo;
                    }
                    return [2 /*return*/, data];
            }
        });
    }); };
};
exports.createGetAccountData = createGetAccountData;
function getFriends(account) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.findFriends(account._id, true)];
        });
    });
}
exports.getFriends = getFriends;
function getHides(account, page) {
    return __awaiter(this, void 0, void 0, function () {
        var hideRequests;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.HideRequest
                        .find({ source: account._id }, '_id name date')
                        .sort({ date: -1 })
                        .skip(page * constants_1.HIDES_PER_PAGE)
                        .limit(constants_1.HIDES_PER_PAGE)
                        .lean()
                        .exec()];
                case 1:
                    hideRequests = _a.sent();
                    return [2 /*return*/, hideRequests.map(function (f) { return ({
                            id: f._id.toString(),
                            name: f.name,
                            date: moment(f.date).fromNow(),
                        }); })];
            }
        });
    });
}
exports.getHides = getHides;
var createGetAccountCharacters = function (findCharacters) {
    return function (account) { return __awaiter(void 0, void 0, void 0, function () {
        var ponies;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findCharacters(account._id)];
                case 1:
                    ponies = _a.sent();
                    return [2 /*return*/, ponies.map(serverUtils_1.toPonyObject)];
            }
        });
    }); };
};
exports.createGetAccountCharacters = createGetAccountCharacters;
var createUpdateAccount = function (findAccount, log) {
    return function (account, update) { return __awaiter(void 0, void 0, void 0, function () {
        var a, fixed, up, _a, day, month, year, date, from, to;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, findAccount(account._id)];
                case 1:
                    a = _b.sent();
                    if (!update) return [3 /*break*/, 3];
                    fixed = fixUpdateAccountData(update);
                    up = {};
                    if (fixed.name && fixed.name !== a.name) {
                        up.name = fixed.name;
                        log(a._id, "Renamed \"" + a.name + "\" => \"" + fixed.name + "\"");
                    }
                    if (fixed.birthdate) {
                        _a = utils_1.parseISODate(fixed.birthdate), day = _a.day, month = _a.month, year = _a.year;
                        date = utils_1.createValidBirthDate(day, month, year);
                        if ((date && a.birthdate && date.getTime() !== a.birthdate.getTime()) || !a.birthdate) {
                            up.birthdate = date;
                            from = a.birthdate ? utils_1.formatISODate(a.birthdate) + " (" + adminUtils_1.getAge(a.birthdate) + "yo)" : "undefined";
                            to = up.birthdate ? utils_1.formatISODate(up.birthdate) + " (" + adminUtils_1.getAge(up.birthdate) + "yo)" : "undefined";
                            log(a._id, "Changed birthdate " + from + " => " + to);
                        }
                    }
                    Object.assign(a, up);
                    return [4 /*yield*/, db_1.Account.updateOne({ _id: a._id }, up).exec()];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/, serverUtils_1.toAccountData(a)];
            }
        });
    }); };
};
exports.createUpdateAccount = createUpdateAccount;
var createUpdateSettings = function (findAccount) {
    return function (account, settings) { return __awaiter(void 0, void 0, void 0, function () {
        var a;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findAccount(account._id)];
                case 1:
                    a = _a.sent();
                    account.settings = a.settings = __assign(__assign({}, a.settings), fixAccountSettings(settings));
                    return [4 /*yield*/, db_1.Account.updateOne({ _id: account._id }, { settings: account.settings }).exec()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, serverUtils_1.toAccountData(a)];
            }
        });
    }); };
};
exports.createUpdateSettings = createUpdateSettings;
var createRemoveSite = function (findAuth, countAllVisibleAuths, log) {
    return function (account, siteId) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, auth, auths;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        siteId && typeof siteId === 'string' ? findAuth(siteId, account._id) : Promise.resolve(undefined),
                        countAllVisibleAuths(account._id),
                    ])];
                case 1:
                    _a = _b.sent(), auth = _a[0], auths = _a[1];
                    if (!(!auth || auth.disabled)) return [3 /*break*/, 2];
                    throw new userError_1.UserError('Social account not found');
                case 2:
                    if (!(auths === 1)) return [3 /*break*/, 3];
                    throw new userError_1.UserError('Cannot remove your only one social account');
                case 3:
                    log(account._id, "removed auth: " + auth.name + " [" + auth._id + "]");
                    return [4 /*yield*/, db_1.Auth.updateOne({ _id: auth._id }, { disabled: true }).exec()];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [2 /*return*/, {}];
            }
        });
    }); };
};
exports.createRemoveSite = createRemoveSite;
function removeHide(account, hideId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.HideRequest.deleteOne({ source: account._id, _id: hideId }).exec()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.removeHide = removeHide;
//# sourceMappingURL=account.js.map