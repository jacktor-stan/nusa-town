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
exports.teleportTo = exports.switchTool = exports.execAction = exports.reloadFriends = exports.getPlayerState = exports.isHiddenBy = exports.isGift = exports.openGift = exports.getNextToyOrExtra = exports.getCollectedToysCount = exports.unholdToy = exports.holdToy = exports.unholdItem = exports.holdItem = exports.expressionAction = exports.fly = exports.lie = exports.sit = exports.stand = exports.sneeze = exports.kiss = exports.boop = exports.turnHead = exports.updateEntityPlayerState = exports.canPerformAction = exports.useHeldItem = exports.interactWith = exports.playerCry = exports.playerLove = exports.playerSleep = exports.parseOrCurrentExpression = exports.playerBlush = exports.setEntityExpression = exports.cancelEntityExpression = exports.findClientByEntityId = exports.createIgnorePlayer = exports.removeIgnore = exports.addIgnore = exports.createAndUpdateCharacterState = exports.createCharacterState = exports.resetClientUpdates = exports.createClient = exports.updateClientCharacter = exports.createClientAndPony = exports.getCounter = exports.kickClient = exports.isIgnored = exports.isMutedOrShadowed = void 0;
var lodash_1 = require("lodash");
var ag_sockets_1 = require("ag-sockets");
var db_1 = require("./db");
var entities = require("../common/entities");
var adminUtils_1 = require("../common/adminUtils");
var serverUtils_1 = require("./serverUtils");
var utils_1 = require("../common/utils");
var interfaces_1 = require("../common/interfaces");
var expressionEncoder_1 = require("../common/encoders/expressionEncoder");
var constants_1 = require("../common/constants");
var camera_1 = require("../common/camera");
var serverMap_1 = require("./serverMap");
var reporter_1 = require("./reporter");
var accountUtils_1 = require("./accountUtils");
var accountUtils_2 = require("../common/accountUtils");
var originUtils_1 = require("./originUtils");
var characterUtils_1 = require("./characterUtils");
var entityUtils_1 = require("./entityUtils");
var emoji_1 = require("../client/emoji");
var expressionUtils_1 = require("../common/expressionUtils");
var entityUtils_2 = require("../common/entityUtils");
var rect_1 = require("../common/rect");
var friends_1 = require("./services/friends");
var entities_1 = require("../common/entities");
var chat_1 = require("./chat");
function isMutedOrShadowed(client) {
    return client.shadowed || adminUtils_1.isMuted(client.account);
}
exports.isMutedOrShadowed = isMutedOrShadowed;
function isIgnored(ignoring, target) {
    return target.ignores.has(ignoring.accountId);
}
exports.isIgnored = isIgnored;
function kickClient(client, reason) {
    if (reason === void 0) { reason = 'kicked'; }
    client.leaveReason = reason;
    client.disconnect(true, true);
}
exports.kickClient = kickClient;
function getCounter(client, key) {
    return utils_1.toInt(client.account.state && client.account.state[key]);
}
exports.getCounter = getCounter;
function createClientAndPony(client, friends, hides, server, world, states) {
    var _a = client.tokenData, account = _a.account, character = _a.character;
    var origin = client.originalRequest && originUtils_1.getOriginFromHTTP(client.originalRequest);
    var reporter = reporter_1.create(server, account._id, character._id, origin);
    var state = characterUtils_1.getAndFixCharacterState(server, character, world, states);
    client.characterState = state;
    var pony = characterUtils_1.createPony(account, character, state);
    pony.client = createClient(client, account, friends, hides, character, pony, world.getMainMap(), reporter, origin);
    camera_1.centerCameraOn(client.camera, pony);
}
exports.createClientAndPony = createClientAndPony;
function updateClientCharacter(client, character) {
    client.character = character;
    client.characterId = client.character._id.toString();
    client.characterName = emoji_1.replaceEmojis(client.character.name);
}
exports.updateClientCharacter = updateClientCharacter;
function isMobileUserAgent(userAgent) {
    if (!userAgent) {
        return false;
    }
    return userAgent.includes('Android') ||
        userAgent.includes('iPhone') ||
        userAgent.includes('iPad') ||
        userAgent.includes('iPod') ||
        userAgent.includes('Windows Phone');
}
function createClient(client, account, friends, hides, character, pony, defaultMap, reporter, origin) {
    updateClientCharacter(client, character);
    client.ip = origin && origin.ip || '';
    client.country = origin && origin.country || '??';
    client.userAgent = client.originalRequest && client.originalRequest.headers['user-agent'];
    client.isMobile = isMobileUserAgent(client.userAgent);
    client.accountId = account._id.toString();
    client.accountName = account.name;
    client.ignores = new Set(account.ignores);
    client.hides = new Set();
    client.permaHides = new Set(hides);
    client.friends = new Set(friends);
    client.friendsCRC = undefined;
    client.accountSettings = __assign({}, account.settings);
    client.supporterLevel = adminUtils_1.supporterLevel(account);
    client.isMod = accountUtils_2.isMod(account);
    client.reporter = reporter;
    client.account = account;
    client.character = character;
    client.pony = pony;
    client.map = defaultMap;
    client.isSwitchingMap = false;
    client.notifications = [];
    client.regions = [];
    client.shadowed = adminUtils_1.isShadowed(account);
    client.country = origin && origin.country || '??';
    client.camera = camera_1.createCamera();
    client.camera.w = 800;
    client.camera.h = 600;
    client.safeX = pony.x;
    client.safeY = pony.y;
    client.lastPacket = Date.now();
    client.lastBoopOrKissAction = 0;
    client.lastExpressionAction = 0;
    client.lastSays = [];
    client.lastX = pony.x;
    client.lastY = pony.y;
    client.lastTime = 0;
    client.lastVX = 0;
    client.lastVY = 0;
    client.lastMapSwitch = 0;
    client.lastSitX = 0;
    client.lastSitY = 0;
    client.lastSitTime = 0;
    client.sitCount = 0;
    client.lastSwap = 0;
    client.lastMapLoadOrSave = 0;
    client.lastCameraX = 0;
    client.lastCameraY = 0;
    client.lastCameraW = 0;
    client.lastCameraH = 0;
    client.updateQueue = ag_sockets_1.createBinaryWriter(128);
    client.regionUpdates = [];
    client.saysQueue = [];
    client.unsubscribes = [];
    client.subscribes = [];
    client.positions = [];
    return client;
}
exports.createClient = createClient;
function resetClientUpdates(client) {
    ag_sockets_1.resetWriter(client.updateQueue);
    client.regionUpdates.length = 0;
    client.saysQueue.length = 0;
    client.unsubscribes.length = 0;
    client.subscribes.length = 0;
}
exports.resetClientUpdates = resetClientUpdates;
function createCharacterState(entity, map) {
    var options = entity.options;
    var flags = (utils_1.hasFlag(entity.state, 2 /* FacingRight */) ? 1 /* Right */ : 0) |
        (options.extra ? 2 /* Extra */ : 0);
    var state = { x: entity.x, y: entity.y };
    if (flags) {
        state.flags = flags;
    }
    if (map.id) {
        state.map = map.id;
    }
    if (options.hold) {
        state.hold = entities.getEntityTypeName(options.hold);
    }
    if (options.toy) {
        state.toy = options.toy;
    }
    return state;
}
exports.createCharacterState = createCharacterState;
function createAndUpdateCharacterState(client, server) {
    return __awaiter(this, void 0, void 0, function () {
        var state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = createCharacterState(client.pony, client.map);
                    return [4 /*yield*/, characterUtils_1.updateCharacterState(client.characterId, server.id, state)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createAndUpdateCharacterState = createAndUpdateCharacterState;
// utils
function addIgnore(target, accountId) {
    target.account.ignores = target.account.ignores || [];
    target.account.ignores.push(accountId);
    target.ignores.add(accountId);
}
exports.addIgnore = addIgnore;
function removeIgnore(target, accountId) {
    if (target.account.ignores) {
        utils_1.removeItem(target.account.ignores, accountId);
    }
    target.ignores.delete(accountId);
}
exports.removeIgnore = removeIgnore;
var createIgnorePlayer = function (updateAccount, handlePromise) {
    if (handlePromise === void 0) { handlePromise = serverUtils_1.handlePromiseDefault; }
    return function (client, target, ignored) {
        var _a;
        if (target.accountId === client.accountId)
            return;
        var id = client.accountId;
        var is = isIgnored(client, target);
        if (ignored === is)
            return;
        if (ignored) {
            addIgnore(target, id);
        }
        else {
            removeIgnore(target, id);
        }
        handlePromise(updateAccount(target.accountId, (_a = {}, _a[ignored ? '$push' : '$pull'] = { ignores: id }, _a))
            .then(function () { return updateEntityPlayerState(client, target.pony); })
            .then(function () {
            var accountId = target.accountId, account = target.account, character = target.character;
            var message = (ignored ? 'ignored' : 'unignored') + " " + character.name + " (" + account.name + ") [" + accountId + "]";
            client.reporter.systemLog(message);
        }), client.reporter.error);
    };
};
exports.createIgnorePlayer = createIgnorePlayer;
function findClientByEntityId(self, entityId) {
    var selected = self.selected;
    if (selected && selected.id === entityId && selected.client) {
        return selected.client;
    }
    if (self.party) { // TODO: remove ?
        var client = self.party.clients.find(function (c) { return c.pony.id === entityId; });
        if (client) {
            //this.logger.log('client from party');
            return client;
        }
        var pending = self.party.pending.find(function (c) { return c.client.pony.id === entityId; });
        if (pending) {
            //this.logger.log('pending from party');
            return pending.client;
        }
    }
    var notification = self.notifications.find(function (c) { return c.entityId === entityId; });
    if (notification) {
        //this.logger.log('sender from notification');
        return notification.sender;
    }
    return undefined;
}
exports.findClientByEntityId = findClientByEntityId;
function cancelEntityExpression(entity) {
    if (entity.exprCancellable) {
        setEntityExpression(entity, undefined);
    }
}
exports.cancelEntityExpression = cancelEntityExpression;
function setEntityExpression(entity, expression, timeout, cancellable) {
    if (timeout === void 0) { timeout = constants_1.EXPRESSION_TIMEOUT; }
    if (cancellable === void 0) { cancellable = false; }
    expression = expression || entity.exprPermanent;
    var expr = expressionEncoder_1.encodeExpression(expression);
    entity.options.expr = expr;
    if (expression && timeout) {
        entity.exprTimeout = Date.now() + timeout;
    }
    else {
        entity.exprTimeout = undefined;
    }
    var sleeping = expression !== undefined && utils_1.hasFlag(expression.extra, 2 /* Zzz */);
    entity.exprCancellable = cancellable || sleeping;
    entityUtils_1.updateEntityExpression(entity);
}
exports.setEntityExpression = setEntityExpression;
function playerBlush(pony, args) {
    if (args === void 0) { args = ''; }
    var expr = parseOrCurrentExpression(pony, args) || expressionUtils_1.expression(1 /* Neutral */, 1 /* Neutral */, 2 /* Neutral */);
    expr.extra |= 1 /* Blush */;
    setEntityExpression(pony, expr, constants_1.DAY, !!pony.exprCancellable);
}
exports.playerBlush = playerBlush;
function parseOrCurrentExpression(pony, message) {
    return expressionUtils_1.parseExpression(message)
        || expressionEncoder_1.decodeExpression((!pony.options || pony.options.expr == null) ? expressionEncoder_1.EMPTY_EXPRESSION : pony.options.expr);
}
exports.parseOrCurrentExpression = parseOrCurrentExpression;
function playerSleep(pony, args) {
    if (args === void 0) { args = ''; }
    if (pony.vx === 0 && pony.vy === 0) {
        var base = parseOrCurrentExpression(pony, args) || expressionUtils_1.expression(6 /* Closed */, 6 /* Closed */, 2 /* Neutral */);
        var muzzle = interfaces_1.getMuzzleOpenness(base.muzzle) === 0 ? base.muzzle : 2 /* Neutral */;
        var expr = __assign(__assign({}, base), { muzzle: muzzle, left: 6 /* Closed */, right: 6 /* Closed */, extra: 2 /* Zzz */ });
        setEntityExpression(pony, expr, 0, true);
    }
}
exports.playerSleep = playerSleep;
function playerLove(pony, args) {
    if (args === void 0) { args = ''; }
    var expr = parseOrCurrentExpression(pony, args) || expressionUtils_1.expression(1 /* Neutral */, 1 /* Neutral */, 0 /* Smile */);
    expr.extra |= 16 /* Hearts */;
    setEntityExpression(pony, expr, constants_1.DAY, !!pony.exprCancellable);
}
exports.playerLove = playerLove;
function playerCry(pony, args) {
    if (args === void 0) { args = ''; }
    var expr = expressionUtils_1.parseExpression(args) || expressionUtils_1.expression(15 /* Sad */, 15 /* Sad */, 1 /* Frown */);
    expr.extra = expr.extra | 4 /* Cry */;
    setEntityExpression(pony, expr, 0);
}
exports.playerCry = playerCry;
var fruitTypes = entities.fruits.map(function (f) { return f.type; });
function interactWith(client, target) {
    if (target) {
        var pony = client.pony;
        if (target.interact && (!target.interactRange || utils_1.distance(pony, target) < target.interactRange)) {
            target.interact(target, client);
        }
        else if (target.triggerBounds && target.trigger) {
            if (utils_1.containsPointWitBorder(target.x, target.y, target.triggerBounds, pony.x, pony.y, 3)) {
                target.trigger(target, client);
            }
            else {
                DEVELOPMENT && console.warn("outside trigger bounds " +
                    ("(bounds: " + target.x + " " + target.y + " " + JSON.stringify(target.triggerBounds) + " point: " + pony.x + " " + pony.y + ")"));
            }
        }
        else if (target.interactAction) {
            switch (target.interactAction) {
                case 1 /* Toolbox */: {
                    switchTool(client, false);
                    break;
                }
                case 2 /* GiveLantern */: {
                    if (client.pony.options.hold === entities.lanternOn.type) {
                        unholdItem(pony);
                    }
                    else {
                        holdItem(pony, entities.lanternOn.type);
                    }
                    break;
                }
                case 3 /* GiveFruits */: {
                    var index = fruitTypes.indexOf(client.pony.options.hold || 0) + 1;
                    holdItem(client.pony, fruitTypes[index % fruitTypes.length]);
                    break;
                }
                case 4 /* GiveCookie1 */: {
                    var hold = client.pony.options.hold;
                    var cookie = hold;
                    while (hold === cookie) {
                        cookie = lodash_1.sample(entities.candies1Types);
                    }
                    holdItem(client.pony, cookie);
                    break;
                }
                case 5 /* GiveCookie2 */: {
                    var hold = client.pony.options.hold;
                    var cookie = hold;
                    while (hold === cookie) {
                        cookie = lodash_1.sample(entities.candies2Types);
                    }
                    holdItem(client.pony, cookie);
                    break;
                }
                // baru
                case 6 /* GiveMangkokBakso */: {
                    var hold = client.pony.options.hold;
                    var mangkokBakso = hold;
                    while (hold === mangkokBakso) {
                        mangkokBakso = lodash_1.sample(entities.mangkokBaksoTypes);
                    }
                    holdItem(client.pony, mangkokBakso);
                    break;
                }
                case 7 /* GivePiringSate */: {
                    var hold = client.pony.options.hold;
                    var piringSate = hold;
                    while (hold === piringSate) {
                        piringSate = lodash_1.sample(entities.piringSateTypes);
                    }
                    holdItem(client.pony, piringSate);
                    break;
                }
                default:
                    utils_1.invalidEnum(target.interactAction);
            }
        }
    }
}
exports.interactWith = interactWith;
function useHeldItem(client) {
    var hold = client.pony.options.hold || 0;
    if (isGift(hold)) {
        openGift(client);
    }
}
exports.useHeldItem = useHeldItem;
function canPerformAction(client, now) {
    if (!now) {
        now = Date.now();
    }
    return client.lastExpressionAction < now && client.lastBoopOrKissAction < now;
}
exports.canPerformAction = canPerformAction;
function updateEntityPlayerState(client, entity) {
    var playerState = getPlayerState(client, entity);
    entityUtils_1.pushUpdateEntityToClient(client, { entity: entity, flags: 1024 /* PlayerState */, playerState: playerState });
}
exports.updateEntityPlayerState = updateEntityPlayerState;
// actions
function turnHead(client) {
    entityUtils_1.updateEntityState(client.pony, client.pony.state ^ 4 /* HeadTurned */);
}
exports.turnHead = turnHead;
var purpleGrapeTypes = entities.grapesPurple.map(function (x) { return x.type; });
var greenGrapeTypes = entities.grapesGreen.map(function (x) { return x.type; });
function boopEntity(client, rect, isOnlyBooping) {
    if (!client.shadowed && (entityUtils_2.isPonySitting(client.pony) || entityUtils_2.isPonyStanding(client.pony))) {
        var boopBounds = rect_1.withBorder(rect, 1);
        var entities_2 = serverMap_1.findEntitiesInBounds(client.map, boopBounds);
        var entity = entities_2.find(function (e) { return entityUtils_1.canBoopEntity(e, rect); });
        if (entity) {
            if (entity.boop) {
                entity.boop(client);
            }
            else if (!isOnlyBooping && entity.type === constants_1.PONY_TYPE) {
                var clientHold = client.pony.options.hold || 0;
                if (entityUtils_1.isHoldingGrapes(entity) && clientHold !== entities_1.grapeGreen.type && clientHold !== entities_1.grapePurple.type) {
                    var index = purpleGrapeTypes.indexOf(entity.options.hold || 0);
                    if (index !== -1) {
                        holdItem(client.pony, entities_1.grapePurple.type);
                        if (index === (purpleGrapeTypes.length - 1)) {
                            unholdItem(entity);
                        }
                        else {
                            holdItem(entity, purpleGrapeTypes[index + 1]);
                        }
                    }
                    else {
                        var index_1 = greenGrapeTypes.indexOf(entity.options.hold || 0);
                        if (index_1 !== -1) {
                            holdItem(client.pony, entities_1.grapeGreen.type);
                            if (index_1 === (greenGrapeTypes.length - 1)) {
                                unholdItem(entity);
                            }
                            else {
                                holdItem(entity, greenGrapeTypes[index_1 + 1]);
                            }
                        }
                    }
                }
            }
        }
    }
}
function boop(client, now) {
    if (canPerformAction(client, now) && entityUtils_2.canBoopOrKiss(client.pony)) {
        cancelEntityExpression(client.pony);
        entityUtils_1.sendAction(client.pony, 1 /* Boop */);
        boopEntity(client, entityUtils_2.getBoopRect(client.pony), false);
        client.lastBoopOrKissAction = now + 850;
    }
}
exports.boop = boop;
function kiss(client, now) {
    if (canPerformAction(client, now) && entityUtils_2.canBoopOrKiss(client.pony)) {
        cancelEntityExpression(client.pony);
        entityUtils_1.sendAction(client.pony, 27 /* Kiss */);
        boopEntity(client, entityUtils_2.getKissRect(client.pony), false);
        client.lastBoopOrKissAction = now + 3400;
    }
}
exports.kiss = kiss;
function sneeze(client) {
    var now = Date.now();
    if (canPerformAction(client, now)) {
        cancelEntityExpression(client.pony);
        entityUtils_1.sendAction(client.pony, 5 /* Sneeze */);
        boopEntity(client, entityUtils_2.getSneezeRect(client.pony), true);
        client.lastExpressionAction = now + 750;
    }
}
exports.sneeze = sneeze;
function stand(client) {
    if (canPerformAction(client) && entityUtils_2.canStand(client.pony, client.map)) {
        if (!entityUtils_2.isPonyFlying(client.pony)) {
            cancelEntityExpression(client.pony);
        }
        entityUtils_1.updateEntityState(client.pony, entityUtils_2.setPonyState(client.pony.state, 0 /* PonyStanding */));
    }
}
exports.stand = stand;
var SIT_MAX_TIME = 2 * constants_1.SECOND;
var SIT_MAX_DIST = 1;
var SIT_MAX_COUNT = 5;
function checkSuspiciousSitting(client) {
    var now = Date.now();
    var _a = client.pony, x = _a.x, y = _a.y;
    var dist = utils_1.distanceXY(x, y, client.lastSitX, client.lastSitY);
    if ((now - client.lastSitTime) < SIT_MAX_TIME && dist < SIT_MAX_DIST && entityUtils_1.findPlayersThetCanBeSitOn(client.map, client.pony)) {
        client.sitCount++;
        if (client.sitCount > SIT_MAX_COUNT) {
            client.reporter.warn("Suspicious sitting");
            client.sitCount = 0;
        }
    }
    else {
        client.sitCount = 1;
    }
    client.lastSitX = x;
    client.lastSitY = y;
    client.lastSitTime = now;
}
function sit(client, settings) {
    if (canPerformAction(client) && entityUtils_2.canSit(client.pony, client.map)) {
        entityUtils_1.updateEntityState(client.pony, entityUtils_2.setPonyState(client.pony.state, 48 /* PonySitting */));
        if (settings.reportSitting) {
            checkSuspiciousSitting(client);
        }
    }
}
exports.sit = sit;
function lie(client) {
    if (canPerformAction(client) && entityUtils_2.canLie(client.pony, client.map)) {
        entityUtils_1.updateEntityState(client.pony, entityUtils_2.setPonyState(client.pony.state, 64 /* PonyLying */));
    }
}
exports.lie = lie;
function fly(client) {
    if (canPerformAction(client) && client.pony.canFly && !entityUtils_2.isPonyFlying(client.pony)) {
        cancelEntityExpression(client.pony);
        entityUtils_1.updateEntityState(client.pony, entityUtils_2.setPonyState(client.pony.state, 80 /* PonyFlying */));
        client.pony.inTheAirDelay = constants_1.FLY_DELAY;
    }
}
exports.fly = fly;
function expressionAction(client, action) {
    var now = Date.now();
    if (canPerformAction(client, now) && interfaces_1.isExpressionAction(action)) {
        cancelEntityExpression(client.pony);
        entityUtils_1.sendAction(client.pony, action);
        client.lastExpressionAction = now + 750;
    }
}
exports.expressionAction = expressionAction;
// hold
function holdItem(entity, hold) {
    if (entity.options && entity.options.hold !== hold) {
        entityUtils_1.updateEntityOptions(entity, { hold: hold });
    }
}
exports.holdItem = holdItem;
function unholdItem(entity) {
    if (entity.options && entity.options.hold) {
        entityUtils_1.updateEntityOptions(entity, { hold: 0 });
        delete entity.options.hold;
    }
}
exports.unholdItem = unholdItem;
// toy
function holdToy(entity, toy) {
    if (entity.options && entity.options.toy !== toy) {
        entityUtils_1.updateEntityOptions(entity, { toy: toy });
    }
}
exports.holdToy = holdToy;
function unholdToy(entity) {
    if (entity.options && entity.options.toy) {
        entityUtils_1.updateEntityOptions(entity, { toy: 0 });
        delete entity.options.toy;
    }
}
exports.unholdToy = unholdToy;
// gifts and toys
var giftTypes = [entities.gift2.type];
var toys = [
    // hat
    { type: 0, multiplier: 20 },
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 5 },
    { type: 0, multiplier: 1 },
    // snowpony
    { type: 0, multiplier: 20 },
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 1 },
    // gift
    { type: 0, multiplier: 20 },
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 5 },
    { type: 0, multiplier: 1 },
    // hanging thing
    { type: 0, multiplier: 20 },
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 5 },
    { type: 0, multiplier: 1 },
    // teddy
    { type: 0, multiplier: 20 },
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 20 },
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 5 },
    { type: 0, multiplier: 5 },
    { type: 0, multiplier: 1 },
    // xmas tree
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 5 },
    // deer
    { type: 0, multiplier: 5 },
    { type: 0, multiplier: 1 },
    // candy horns
    { type: 0, multiplier: 10 },
    { type: 0, multiplier: 2 },
    { type: 0, multiplier: 1 },
    // star
    { type: 0, multiplier: 5 },
    // halo
    { type: 0, multiplier: 5 },
];
toys.forEach(function (toy, i) { return toy.type = i + 1; });
var toyTypes = utils_1.flatten(toys.map(function (x) { return utils_1.array(x.multiplier, x.type); }));
function hasToyUnlocked(type, collectedToys) {
    var index = toys.findIndex(function (t) { return t.type === type; });
    return utils_1.hasFlag(collectedToys, 1 << index);
}
function unlockToy(type, collectedToys) {
    var index = toys.findIndex(function (t) { return t.type === type; });
    return collectedToys | (1 << index);
}
function getCollectedToysCount(client) {
    var stateToys = utils_1.toInt((client.account.state || {}).toys);
    var total = toys.length;
    var collected = 0;
    for (var i = 0, bit = 1; i < total; i++, bit <<= 1) {
        if (stateToys & bit) {
            collected++;
        }
    }
    return { collected: collected, total: total };
}
exports.getCollectedToysCount = getCollectedToysCount;
function getNextToyOrExtra(client) {
    var collectedToys = utils_1.toInt((client.account.state || {}).toys);
    var options = client.pony.options || {};
    var extra = !!options.extra;
    var toy = utils_1.toInt(options.toy);
    if (extra) {
        return { extra: false, toy: 0 };
    }
    else {
        for (var i = toys.findIndex(function (t) { return t.type === toy; }) + 1; i < toys.length; i++) {
            var type = toys[i].type;
            if (hasToyUnlocked(type, collectedToys)) {
                return { extra: false, toy: type };
            }
        }
        return { extra: true, toy: 0 };
    }
}
exports.getNextToyOrExtra = getNextToyOrExtra;
function openGift(client) {
    var options = client.pony.options || {};
    if (isGift(options.hold)) {
        var toyType_1 = 0;
        do {
            toyType_1 = lodash_1.sample(toyTypes);
        } while (toyType_1 === options.toy);
        entityUtils_1.sendAction(client.pony, 12 /* HoldPoof */);
        unholdItem(client.pony);
        setTimeout(function () { return holdToy(client.pony, toyType_1); }, 200);
        var state = client.account.state || {};
        if (!hasToyUnlocked(toyType_1, utils_1.toInt(state.toys))) {
            accountUtils_1.updateAccountState(client.account, function (state) {
                state.toys = unlockToy(toyType_1, utils_1.toInt(state.toys));
            });
        }
    }
}
exports.openGift = openGift;
function isGift(type) {
    return type !== undefined && utils_1.includes(giftTypes, type);
}
exports.isGift = isGift;
function isHiddenBy(a, b) {
    return a.hides.has(b.accountId) || b.hides.has(a.accountId) ||
        a.permaHides.has(b.accountId) || b.permaHides.has(a.accountId);
}
exports.isHiddenBy = isHiddenBy;
function getPlayerState(client, entity) {
    var state = 0 /* None */;
    if (entity.client !== undefined) {
        if (isIgnored(client, entity.client)) {
            state |= 1 /* Ignored */;
        }
        if (isHiddenBy(client, entity.client)) {
            state |= 2 /* Hidden */;
        }
        if (friends_1.isOnlineFriend(client, entity.client)) {
            state |= 4 /* Friend */;
        }
    }
    return state;
}
exports.getPlayerState = getPlayerState;
function reloadFriends(client) {
    return __awaiter(this, void 0, void 0, function () {
        var friends;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.findFriendIds(client.accountId)];
                case 1:
                    friends = _a.sent();
                    client.friends = new Set(friends);
                    client.friendsCRC = undefined;
                    client.actionParam(0, 23 /* FriendsCRC */, undefined);
                    return [2 /*return*/];
            }
        });
    });
}
exports.reloadFriends = reloadFriends;
function execAction(client, action, settings) {
    switch (action) {
        case 1 /* Boop */:
            boop(client, Date.now());
            break;
        case 2 /* TurnHead */:
            turnHead(client);
            break;
        case 5 /* Sneeze */:
            sneeze(client);
            break;
        case 10 /* Stand */:
            stand(client);
            break;
        case 6 /* Sit */:
            sit(client, settings);
            break;
        case 7 /* Lie */:
            lie(client);
            break;
        case 8 /* Fly */:
            fly(client);
            break;
        case 14 /* Drop */:
            unholdItem(client.pony);
            break;
        case 13 /* Sleep */:
            playerSleep(client.pony);
            break;
        case 16 /* Blush */:
            playerBlush(client.pony);
            break;
        case 17 /* Cry */:
            playerCry(client.pony);
            break;
        case 18 /* Love */:
            playerLove(client.pony);
            break;
        case 15 /* DropToy */:
            unholdToy(client.pony);
            entityUtils_1.updateEntityOptions(client.pony, { extra: false });
            break;
        case 26 /* Magic */:
            if (client.pony.canMagic) {
                var has = utils_1.hasFlag(client.pony.state, 8 /* Magic */);
                entityUtils_1.updateEntityState(client.pony, utils_1.setFlag(client.pony.state, 8 /* Magic */, !has));
            }
            break;
        case 27 /* Kiss */:
            kiss(client, Date.now());
            break;
        case 30 /* SwitchTool */:
            switchTool(client, false);
            break;
        case 31 /* SwitchToolRev */:
            switchTool(client, true);
            break;
        case 32 /* SwitchToPlaceTool */:
            holdItem(client.pony, entities.hammer.type);
            break;
        case 33 /* SwitchToTileTool */:
            holdItem(client.pony, entities.shovel.type);
            break;
        default:
            if (interfaces_1.isExpressionAction(action)) {
                expressionAction(client, action);
            }
            else {
                throw new Error("Invalid action (" + action + ")");
            }
            break;
    }
}
exports.execAction = execAction;
function switchTool(client, reverse) {
    var hold = client.pony.options.hold || 0;
    var index = entities_1.tools.findIndex(function (t) { return t.type === hold; });
    var unholdIndex = reverse ? 0 : entities_1.tools.length - 1;
    if (index === unholdIndex) {
        unholdItem(client.pony);
    }
    else {
        var newIndex = reverse ? (index === -1 ? entities_1.tools.length - 1 : index - 1) : ((index + 1) % entities_1.tools.length);
        var tool = entities_1.tools[newIndex];
        holdItem(client.pony, tool.type);
        var text = (client.isMobile && tool.textMobile) ? tool.textMobile : tool.text;
        chat_1.saySystem(client, text);
    }
}
exports.switchTool = switchTool;
function teleportTo(client, x, y) {
    entityUtils_1.fixPosition(client.pony, client.map, x, y, true);
    client.safeX = client.pony.x;
    client.safeY = client.pony.y;
    client.lastTime = 0;
}
exports.teleportTo = teleportTo;
//# sourceMappingURL=playerUtils.js.map