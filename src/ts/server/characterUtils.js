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
exports.swapCharacter = exports.logRemovedCharacter = exports.createExtraOptions = exports.updatePony = exports.filterForbidden = exports.cleanupPonyOptions = exports.updatePonyFromState = exports.getAndFixCharacterState = exports.updateCharacterState = exports.getCharacterState = exports.createPony = exports.encryptInfo = exports.defaultCharacterState = void 0;
var lodash_1 = require("lodash");
var base64_js_1 = require("base64-js");
var utf8_1 = require("ag-sockets/dist/utf8");
var db_1 = require("./db");
var security_1 = require("../common/security");
var adminUtils_1 = require("../common/adminUtils");
var utils_1 = require("../common/utils");
var logger_1 = require("./logger");
var entities_1 = require("../common/entities");
var constants_1 = require("../common/constants");
var compressPony_1 = require("../common/compressPony");
var ponyUtils_1 = require("../client/ponyUtils");
var tags_1 = require("../common/tags");
var emoji_1 = require("../client/emoji");
var entityUtils_1 = require("./entityUtils");
var chat_1 = require("./chat");
var entityUtils_2 = require("../common/entityUtils");
var playerUtils_1 = require("./playerUtils");
var expressionEncoder_1 = require("../common/encoders/expressionEncoder");
exports.defaultCharacterState = { x: 0, y: 0 };
function encryptInfo(info) {
    return utils_1.bitmask(base64_js_1.toByteArray(info), constants_1.PONY_INFO_KEY);
}
exports.encryptInfo = encryptInfo;
function createPony(account, character, state) {
    var pony = entities_1.pony(state.x, state.y);
    pony.state = utils_1.hasFlag(state.flags, 1 /* Right */) ? 2 /* FacingRight */ : 0;
    updatePony(pony, account, character);
    updatePonyFromState(pony, state);
    cleanupPonyOptions(pony);
    return pony;
}
exports.createPony = createPony;
function createDefaultCharacterState(map) {
    return __assign(__assign(__assign({}, exports.defaultCharacterState), utils_1.randomPoint(map.spawnArea)), { map: map.id });
}
function getCharacterState(character, serverId, map) {
    return character.state && character.state[serverId] || createDefaultCharacterState(map);
}
exports.getCharacterState = getCharacterState;
function updateCharacterState(characterId, serverId, state) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.Character.updateOne({ _id: characterId }, (_a = {}, _a["state." + serverId] = state, _a)).exec()];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateCharacterState = updateCharacterState;
function getAndFixCharacterState(server, character, world, states) {
    var map = world.getMainMap();
    var savedState = utils_1.last(states.get(character._id.toString()).items) || getCharacterState(character, server.id, map);
    var state = __assign(__assign({}, exports.defaultCharacterState), savedState);
    if (utils_1.hasFlag(character.flags, 8 /* RespawnAtSpawn */)) {
        Object.assign(state, __assign({ map: map.id }, utils_1.randomPoint(map.spawnArea)));
    }
    return state;
}
exports.getAndFixCharacterState = getAndFixCharacterState;
function updatePonyFromState(pony, state) {
    if (!pony.options) {
        pony.options = {};
    }
    if (state.hold) {
        var type = entities_1.getEntityType(state.hold);
        if (type) {
            pony.options.hold = type;
        }
    }
    else if (pony.options.hold) {
        pony.options.hold = 0;
    }
    if (state.toy) {
        pony.options.toy = state.toy;
    }
    else if (pony.options.toy) {
        pony.options.toy = 0;
    }
    pony.options.extra = utils_1.hasFlag(state.flags, 2 /* Extra */);
}
exports.updatePonyFromState = updatePonyFromState;
function cleanupPonyOptions(_a) {
    var options = _a.options;
    if (options) {
        if (!options.hold) {
            delete options.hold;
        }
        if (!options.extra) {
            delete options.extra;
        }
    }
}
exports.cleanupPonyOptions = cleanupPonyOptions;
function filterForbidden(name) {
    var isForbidden = security_1.isForbiddenName(name);
    return isForbidden ? lodash_1.repeat('?', name.length) : name;
}
exports.filterForbidden = filterForbidden;
function updatePony(pony, account, character) {
    var info = character.info || '';
    var ponyInfo = compressPony_1.decompressPony(info);
    var originalName = emoji_1.replaceEmojis(character.name);
    var allowedName = filterForbidden(originalName);
    var options = {};
    var level = adminUtils_1.supporterLevel(account);
    if (character.tag && tags_1.canUseTag(account, character.tag)) {
        options.tag = character.tag;
    }
    else if (level && !utils_1.hasFlag(character.flags, 4 /* HideSupport */)) {
        options.tag = "sup" + level;
    }
    pony.options = options;
    pony.extraOptions = createExtraOptions(character);
    pony.canFly = ponyUtils_1.canFly(ponyInfo);
    pony.canMagic = ponyUtils_1.canMagic(ponyInfo);
    // name
    entityUtils_1.setEntityName(pony, allowedName);
    // info
    pony.info = info;
    if (utils_1.hasFlag(character.flags, 1 /* BadCM */) && ponyInfo.cm) {
        ponyInfo.cm = undefined;
        pony.infoSafe = compressPony_1.compressPony(ponyInfo);
        pony.encryptedInfoSafe = encryptInfo(pony.infoSafe);
    }
    else {
        pony.infoSafe = pony.info;
        pony.encryptedInfoSafe = encryptInfo(info);
    }
    // crc
    pony.crc = createCharacterCRC(account._id.toString(), originalName);
}
exports.updatePony = updatePony;
function createCharacterCRC(accountId, characterName) {
    var characterNameBuffer = utf8_1.encodeString(characterName);
    var accountIdBuffer = utf8_1.encodeString(accountId);
    var buffer = new Uint32Array(Math.ceil((characterNameBuffer.byteLength + accountIdBuffer.byteLength) / 4));
    var bufferUint8 = new Uint8Array(buffer.buffer);
    bufferUint8.set(characterNameBuffer);
    bufferUint8.set(accountIdBuffer, characterNameBuffer.byteLength);
    return utils_1.computeCRC(buffer) & 0xffff;
}
function createExtraOptions(character) {
    var options = {
        ex: true,
    };
    if (character.auth && !security_1.isForbiddenName(character.auth.name)) {
        options.site = {
            provider: character.auth.provider,
            name: character.auth.name,
            url: character.auth.url,
        };
    }
    return options;
}
exports.createExtraOptions = createExtraOptions;
function logRemovedCharacter(_a) {
    var _id = _a._id, account = _a.account, name = _a.name, info = _a.info;
    logger_1.log(logger_1.systemMessage("" + account, "removed pony [" + _id + "] \"" + name + "\" " + info));
}
exports.logRemovedCharacter = logRemovedCharacter;
function swapCharacter(client, _a, query) {
    var server = _a.server;
    return __awaiter(this, void 0, void 0, function () {
        var character, state, options;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (client.isSwitchingMap)
                        return [2 /*return*/];
                    if ((Date.now() - client.lastSwap) < constants_1.SWAP_TIMEOUT) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db_1.queryCharacter(query)];
                case 1:
                    character = _b.sent();
                    if (!character) {
                        return [2 /*return*/, chat_1.saySystem(client, "Can't find character")];
                    }
                    if (entityUtils_2.isPonyFlying(client.pony) && !ponyUtils_1.canFly(compressPony_1.decompressPony(character.info || ''))) {
                        return [2 /*return*/, chat_1.saySystem(client, "Can't swap to that character in-flight")];
                    }
                    state = playerUtils_1.createCharacterState(client.pony, client.map);
                    updateCharacterState(client.characterId, server.id, state)
                        .catch(logger_1.logger.error);
                    db_1.Character.updateOne({ _id: character._id }, { lastUsed: new Date() }).exec()
                        .catch(logger_1.logger.error);
                    playerUtils_1.updateClientCharacter(client, character);
                    updatePony(client.pony, client.account, client.character);
                    updatePonyFromState(client.pony, getCharacterState(character, server.id, client.map));
                    options = client.pony.options;
                    options.expr = expressionEncoder_1.encodeExpression(undefined);
                    client.pony.state &= ~8 /* Magic */;
                    entityUtils_1.pushUpdateEntity({
                        entity: client.pony, options: __assign({ hold: 0, toy: 0 }, options),
                        flags: 64 /* Info */ | 256 /* Name */ | 32 /* Options */ | 4 /* State */,
                    });
                    cleanupPonyOptions(client.pony);
                    client.myEntity(client.pony.id, client.characterName, client.character.info, client.characterId, client.pony.crc || 0);
                    client.reporter.systemLog("Swapped to \"" + client.characterName + "\"");
                    client.lastSwap = Date.now();
                    return [2 /*return*/];
            }
        });
    });
}
exports.swapCharacter = swapCharacter;
//# sourceMappingURL=characterUtils.js.map