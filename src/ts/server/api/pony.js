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
exports.createRemovePony = exports.createSavePony = void 0;
var clientUtils_1 = require("../../client/clientUtils");
var serverUtils_1 = require("../serverUtils");
var security_1 = require("../../common/security");
var color_1 = require("../../common/color");
var cmUtils_1 = require("../cmUtils");
var userError_1 = require("../userError");
var errors_1 = require("../../common/errors");
var compressPony_1 = require("../../common/compressPony");
var accountUtils_1 = require("../accountUtils");
var constants_1 = require("../../common/constants");
function colorToText(c) {
    return c ? color_1.colorToHexRGB(c) : '';
}
var createSavePony = function (findCharacter, findAuth, characterCount, updateCharacterCount, createCharacter, log, isSuspiciousName, isSuspiciousPony) {
    return function (account, data, reporter) { return __awaiter(void 0, void 0, void 0, function () {
        var originalName, _a, character, auth, suspicious, created, nameChanged, oldName, deco, info, badCM, forbiddenName, flags, message, count, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!data || !data.info || typeof data.name !== 'string') {
                        throw new userError_1.UserError('Invalid data', { data: data });
                    }
                    originalName = data.name;
                    data.name = clientUtils_1.cleanName(data.name);
                    if (!clientUtils_1.validatePonyName(data.name)) {
                        throw new userError_1.UserError('Invalid name', { desc: JSON.stringify(originalName), data: data });
                    }
                    return [4 /*yield*/, Promise.all([
                            data.id ? findCharacter(data.id, account._id) : undefined,
                            data.site ? findAuth(data.site, account._id, '_id') : undefined,
                        ]).catch(function (error) {
                            throw new userError_1.UserError('Invalid data', { error: error, data: data });
                        })];
                case 1:
                    _a = _c.sent(), character = _a[0], auth = _a[1];
                    suspicious = [];
                    created = false;
                    nameChanged = false;
                    try {
                        if (!character) {
                            character = createCharacter(account);
                            created = true;
                        }
                        deco = compressPony_1.decompressPony(data.info);
                        info = compressPony_1.compressPony(deco);
                        badCM = cmUtils_1.isBadCM(deco.cm && deco.cm.map(colorToText) || [], color_1.colorToHexRGB(deco.coatFill));
                        forbiddenName = security_1.isForbiddenName(data.name);
                        flags = (badCM ? 1 /* BadCM */ : 0) |
                            (data.hideSupport ? 4 /* HideSupport */ : 0) |
                            (data.respawnAtSpawn ? 8 /* RespawnAtSpawn */ : 0) |
                            (forbiddenName ? 16 /* ForbiddenName */ : 0);
                        nameChanged = character.name !== data.name;
                        oldName = character.name;
                        if (nameChanged && isSuspiciousName(data.name)) {
                            suspicious.push('name');
                        }
                        if (character.info !== data.info && isSuspiciousPony(deco)) {
                            suspicious.push('look');
                        }
                        character.desc = typeof data.desc === 'string' ? data.desc.substr(0, constants_1.PLAYER_DESC_MAX_LENGTH) : '';
                        character.name = data.name;
                        character.tag = data.tag;
                        character.site = auth ? auth._id : null;
                        character.info = info;
                        character.flags = flags;
                        character.lastUsed = new Date();
                    }
                    catch (error) {
                        message = DEVELOPMENT ? errors_1.CHARACTER_SAVING_ERROR + " (" + error + ")" : errors_1.CHARACTER_SAVING_ERROR;
                        throw new userError_1.UserError(message, { error: error, data: { pony: data }, desc: "info: \"" + data.info + "\"" });
                    }
                    if (!created) return [3 /*break*/, 3];
                    return [4 /*yield*/, characterCount(account._id)];
                case 2:
                    _b = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _b = 0;
                    _c.label = 4;
                case 4:
                    count = _b;
                    if (count >= accountUtils_1.getCharacterLimit(account)) {
                        throw new userError_1.UserError(errors_1.CHARACTER_LIMIT_ERROR);
                    }
                    return [4 /*yield*/, character.save()];
                case 5:
                    _c.sent();
                    if (!created) return [3 /*break*/, 7];
                    return [4 /*yield*/, updateCharacterCount(account._id)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    if (suspicious.length) {
                        reporter.setPony(character._id.toString());
                        reporter.warn('Suspicious pony created', "\"" + character.name + "\" (" + suspicious.join(', ') + ")");
                    }
                    if (created) {
                        log(account._id, "created pony \"" + character.name + "\"");
                    }
                    else if (nameChanged) {
                        log(account._id, "renamed pony \"" + oldName + "\" => \"" + character.name + "\"");
                    }
                    return [2 /*return*/, serverUtils_1.toPonyObject(character)];
            }
        });
    }); };
};
exports.createSavePony = createSavePony;
var createRemovePony = function (kickFromAllServersByCharacter, removeCharacter, updateCharacterCount, removedCharacter, logRemovedCharacter) {
    return function (ponyId, accountId) { return __awaiter(void 0, void 0, void 0, function () {
        var character;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ponyId || typeof ponyId !== 'string') {
                        throw new Error("Invalid ponyId (" + ponyId + ")");
                    }
                    return [4 /*yield*/, kickFromAllServersByCharacter(ponyId)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, removeCharacter(ponyId, accountId)];
                case 2:
                    character = _a.sent();
                    return [4 /*yield*/, updateCharacterCount(accountId)];
                case 3:
                    _a.sent();
                    if (character) {
                        logRemovedCharacter(character);
                        removedCharacter(ponyId);
                    }
                    return [2 /*return*/, {}];
            }
        });
    }); };
};
exports.createRemovePony = createRemovePony;
//# sourceMappingURL=pony.js.map