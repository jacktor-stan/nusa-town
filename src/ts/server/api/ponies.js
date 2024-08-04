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
exports.createCharacter = exports.removeAllCharacters = exports.removeCharactersAboveLimit = exports.removeCharacter = exports.assignCharacter = exports.findPonies = void 0;
var Bluebird = require("bluebird");
var lodash_1 = require("lodash");
var accountUtils_1 = require("../accountUtils");
var db_1 = require("../db");
var constants_1 = require("../../common/constants");
var serverUtils_1 = require("../serverUtils");
var characterUtils_1 = require("../characterUtils");
var admin_1 = require("./admin");
var ITEMS_PER_PAGE = 20;
var ITEMS_LIMIT = 1000;
var CACHE_TIMEOUT = 10 * constants_1.MINUTE;
function createQuery(_a) {
    var search = _a.search;
    var and = [];
    if (search) {
        if (search === 'orphan') {
            and.push({ account: { $exists: false } });
        }
        else if (/^exact:/.test(search)) {
            and.push({ name: new RegExp("^" + lodash_1.escapeRegExp(search.substr(6)) + "$", 'i') });
        }
        else {
            and.push({ name: new RegExp(lodash_1.escapeRegExp(search), 'i') });
        }
    }
    return and.length === 0 ? {} : (and.length === 1 ? and[0] : { $and: and });
}
function getPonyIds(query) {
    return __awaiter(this, void 0, void 0, function () {
        var items;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Character
                        .find(createQuery(query), '_id')
                        .sort(query.orderBy || 'createdAt')
                        .limit(ITEMS_LIMIT)
                        .lean()
                        .exec()];
                case 1:
                    items = _a.sent();
                    return [2 /*return*/, items.map(function (i) { return i._id.toString(); })];
            }
        });
    });
}
var cachedGetPonyIds = serverUtils_1.cached(getPonyIds, CACHE_TIMEOUT);
function findPonies(query, page) {
    return __awaiter(this, void 0, void 0, function () {
        var from, ids, idsOnPage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    from = page * ITEMS_PER_PAGE;
                    return [4 /*yield*/, cachedGetPonyIds(query)];
                case 1:
                    ids = _a.sent();
                    idsOnPage = ids.slice(from, from + ITEMS_PER_PAGE);
                    return [2 /*return*/, {
                            items: idsOnPage,
                            totalCount: ids.length
                        }];
            }
        });
    });
}
exports.findPonies = findPonies;
function assignCharacter(characterId, accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var character;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Character.findById(characterId).exec()];
                case 1:
                    character = _a.sent();
                    if (!character)
                        return [2 /*return*/];
                    return [4 /*yield*/, admin_1.kickFromAllServersByCharacter(characterId)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db_1.Character.updateOne({ _id: characterId }, { account: accountId }).exec()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, Promise.all([
                            accountUtils_1.updateCharacterCount(character.account),
                            accountUtils_1.updateCharacterCount(accountId),
                        ])];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.assignCharacter = assignCharacter;
function removeCharacter(service, characterId) {
    return __awaiter(this, void 0, void 0, function () {
        var character;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Character.findById(characterId).exec()];
                case 1:
                    character = _a.sent();
                    if (!character)
                        return [2 /*return*/];
                    return [4 /*yield*/, admin_1.kickFromAllServersByCharacter(characterId)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, character.remove()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, accountUtils_1.updateCharacterCount(character.account)];
                case 4:
                    _a.sent();
                    characterUtils_1.logRemovedCharacter(character);
                    service.ponies.removed(characterId);
                    return [2 /*return*/];
            }
        });
    });
}
exports.removeCharacter = removeCharacter;
function removeCharacters(character, accountId, removedDocument) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Bluebird.map(character, function (c) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, c.remove()];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, removedDocument('ponies', c._id.toString())];
                                case 2:
                                    _a.sent();
                                    characterUtils_1.logRemovedCharacter(c);
                                    return [2 /*return*/];
                            }
                        });
                    }); }, { concurrency: 4 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, accountUtils_1.updateCharacterCount(accountId)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function removeCharactersAboveLimit(removedDocument, accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, account, items, limited;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        db_1.findAccountSafe(accountId),
                        db_1.Character.find({ account: accountId }).sort({ lastUsed: -1 }).exec(),
                    ])];
                case 1:
                    _a = _b.sent(), account = _a[0], items = _a[1];
                    limited = items.slice(accountUtils_1.getCharacterLimit(account));
                    return [4 /*yield*/, removeCharacters(limited, accountId, removedDocument)];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.removeCharactersAboveLimit = removeCharactersAboveLimit;
function removeAllCharacters(removedDocument, accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var items;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Character.find({ account: accountId }).sort({ lastUsed: -1 }).exec()];
                case 1:
                    items = _a.sent();
                    return [4 /*yield*/, removeCharacters(items, accountId, removedDocument)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.removeAllCharacters = removeAllCharacters;
function createCharacter(account, name, info) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Character.create({ account: account, name: name, info: info })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, accountUtils_1.updateCharacterCount(account)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createCharacter = createCharacter;
//# sourceMappingURL=ponies.js.map