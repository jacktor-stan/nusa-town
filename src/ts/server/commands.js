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
exports.getChatPrefix = exports.parseCommand = exports.createRunCommand = exports.getSpamCommandNames = exports.createCommands = void 0;
var lodash_1 = require("lodash");
var interfaces_1 = require("../common/interfaces");
var accountUtils_1 = require("../common/accountUtils");
var entities_1 = require("../common/entities");
var emoji_1 = require("../client/emoji");
var userError_1 = require("./userError");
var expressionUtils_1 = require("../common/expressionUtils");
var swears_1 = require("../common/swears");
var stringUtils_1 = require("../common/stringUtils");
var playerUtils_1 = require("./playerUtils");
var utils_1 = require("../common/utils");
var internal_1 = require("./api/internal");
var logger_1 = require("./logger");
var paths_1 = require("./paths");
var chat_1 = require("./chat");
var serverRegion_1 = require("./serverRegion");
var serverMap_1 = require("./serverMap");
var constants_1 = require("../common/constants");
var worldMap_1 = require("../common/worldMap");
var characterUtils_1 = require("./characterUtils");
var fs_1 = require("fs");
var db_1 = require("./db");
var houseMap_1 = require("./maps/houseMap");
function hasRoleNull(client, role) {
    if (!role || accountUtils_1.hasRole(client.account, role))
        return true;
    return (role === 'sup1' && (client.supporterLevel >= 1 || client.isMod)) ||
        (role === 'sup2' && (client.supporterLevel >= 2 || client.isMod)) ||
        (role === 'sup3' && (client.supporterLevel >= 3 || client.isMod));
}
function command(names, help, role, handler, spam) {
    if (spam === void 0) { spam = false; }
    return { names: names, help: help, role: role, handler: handler, spam: spam };
}
function emote(names, expr, timeout, cancellable) {
    return command(names, '', '', function (_a, _b) {
        var pony = _b.pony;
        return playerUtils_1.setEntityExpression(pony, expr, timeout, cancellable);
    });
}
function action(names, action) {
    return command(names, '', '', function (_a, client, _, __, ___, settings) { return playerUtils_1.execAction(client, action, settings); });
}
function adminModChat(names, help, role, type) {
    return command(names, help, role, function (_a, client, message, _, __, settings) {
        chat_1.sayToEveryone(client, message, swears_1.filterBadWords(message), type, settings);
    });
}
function parseWeather(value) {
    switch (value.toLowerCase()) {
        case 'none': return 0 /* None */;
        case 'rain': return 1 /* Rain */;
        default: return undefined;
    }
}
function getSpawnTarget(map, message) {
    if (message === 'spawn') {
        return utils_1.randomPoint(map.spawnArea);
    }
    var spawn = map.spawns.get(message);
    if (spawn) {
        return utils_1.randomPoint(spawn);
    }
    var match = /^(\d+) (\d+)$/.exec(message.trim());
    if (!match) {
        throw new userError_1.UserError('invalid parameters');
    }
    var tx = match[1], ty = match[2];
    var x = utils_1.clamp(+tx, 0, map.width - 0.5 / constants_1.tileWidth);
    var y = utils_1.clamp(+ty, 0, map.height - 0.5 / constants_1.tileHeight);
    return { x: x, y: y };
}
function execWithFileName(client, message, action) {
    var fileName = message.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!fileName) {
        throw new userError_1.UserError('invalid file name');
    }
    action(fileName)
        .catch(function (e) { return (logger_1.logger.error(e), e.message); })
        .then(function (error) { return chat_1.saySystem(client, error || 'saved'); });
}
function shouldNotBeCalled() {
    throw new Error('Should not be called');
}
function isValidMapForEditing(map, client, checkTimeout, onlyLeader) {
    if (map.id !== 'house') {
        chat_1.saySystem(client, 'Can only be done inside the house');
        return false;
    }
    if (checkTimeout && ((Date.now() - client.lastMapLoadOrSave) < constants_1.MAP_LOAD_SAVE_TIMEOUT)) {
        chat_1.saySystem(client, "You need to wait " + Math.floor(constants_1.MAP_LOAD_SAVE_TIMEOUT / 1000) + " seconds before loading or saving again");
        return false;
    }
    if (onlyLeader && client.party && client.party.leader !== client) {
        chat_1.saySystem(client, 'Only party leader can do this');
        return false;
    }
    return true;
}
var interval;
function createCommands(world) {
    var _this = this;
    var commands = lodash_1.compact([
        // chat
        command(['help', 'h', '?'], '/help - show help', '', function (_a, client) {
            var help = commands
                .filter(function (c) { return c.help && hasRoleNull(client, c.role); })
                .map(function (c) { return c.help; })
                .join('\n');
            chat_1.saySystem(client, help);
        }),
        command(['roll', 'rand', 'random'], '/roll [[min-]max] - randomize a number', '', function (_a, client, args, type, target, settings) {
            var random = _a.random;
            var ROLL_MAX = 1000000;
            var _b = /^(?:(\d+)-)?(\d+)$/.exec(args) || ['', '', ''], min = _b[1], max = _b[2];
            var minValue = utils_1.clamp((min ? parseInt(min, 10) : 1) | 0, 0, ROLL_MAX);
            var maxValue = utils_1.clamp((max ? parseInt(max, 10) : 100) | 0, minValue, ROLL_MAX);
            var result = args === '🍎' ? args : random(minValue, maxValue);
            var message = "\uD83C\uDFB2 rolled " + result + " of " + (minValue !== 1 ? minValue + "-" : '') + maxValue;
            chat_1.sayToOthers(client, message, interfaces_1.toAnnouncementMessageType(type), target, settings);
        }, true),
        command(['s', 'say'], '/s - say', '', shouldNotBeCalled),
        command(['p', 'party'], '/p - party chat', '', shouldNotBeCalled),
        command(['t', 'think'], '/t - thinking balloon', '', shouldNotBeCalled),
        command(['w', 'whisper'], '/w <name> - whisper to player', '', shouldNotBeCalled),
        command(['r', 'reply'], '/r - reply to whisper', '', shouldNotBeCalled),
        command(['shrug'], '/shrug - ¯\\_(ツ)_/¯', '', shouldNotBeCalled),
        command(['e'], '/e - set permanent expression', '', function (_a, _b, message) {
            var pony = _b.pony;
            pony.exprPermanent = expressionUtils_1.parseExpression(message, true);
            playerUtils_1.setEntityExpression(pony, undefined, 0);
        }),
        // actions
        command(['turn'], '/turn - turn head', '', function (_a, client, _, __, ___, settings) {
            playerUtils_1.execAction(client, 2 /* TurnHead */, settings);
        }),
        command(['boop', ')'], '/boop or /) - a boop', '', function (_a, client, message, _, __, settings) {
            var expression = expressionUtils_1.parseExpression(message, true);
            if (expression) {
                playerUtils_1.setEntityExpression(client.pony, expression, 800);
            }
            playerUtils_1.execAction(client, 1 /* Boop */, settings);
        }),
        command(['drop'], '/drop - drop held item', '', function (_a, client, _, __, ___, settings) {
            playerUtils_1.execAction(client, 14 /* Drop */, settings);
        }),
        command(['droptoy'], '/droptoy - drop held toy', '', function (_a, client, _, __, ___, settings) {
            playerUtils_1.execAction(client, 15 /* DropToy */, settings);
        }),
        // command(['open'], '/open - open gift', '', ({ }, client) => {
        // 	openGift(client);
        // }),
        // counters
        command(['gifts'], '/gifts - show gift score', '', function (_a, client, _, type, target, settings) {
            chat_1.sayToOthers(client, "collected " + playerUtils_1.getCounter(client, 'gifts') + " \uD83C\uDF81", interfaces_1.toAnnouncementMessageType(type), target, settings);
        }, true),
        command(['candies', 'candy'], '/candies - show candy score', '', function (_a, client, _, type, target, settings) {
            chat_1.sayToOthers(client, "collected " + playerUtils_1.getCounter(client, 'candies') + " \uD83C\uDF6C", interfaces_1.toAnnouncementMessageType(type), target, settings);
        }, true),
        command(['eggs'], '/eggs - show egg score', '', function (_a, client, _, type, target, settings) {
            chat_1.sayToOthers(client, "collected " + playerUtils_1.getCounter(client, 'eggs') + " \uD83E\uDD5A", interfaces_1.toAnnouncementMessageType(type), target, settings);
        }, true),
        command(['clovers', 'clover'], '/clovers - show clover score', '', function (_a, client, _, type, target, settings) {
            chat_1.sayToOthers(client, "collected " + playerUtils_1.getCounter(client, 'clovers') + " \uD83C\uDF40", interfaces_1.toAnnouncementMessageType(type), target, settings);
        }, true),
        command(['toys'], '/toys - show number of collected toys', '', function (_a, client, _, type, target, settings) {
            var _b = playerUtils_1.getCollectedToysCount(client), collected = _b.collected, total = _b.total;
            chat_1.sayToOthers(client, "collected " + collected + "/" + total + " toys", interfaces_1.toAnnouncementMessageType(type), target, settings);
        }),
        // other
        command(['unstuck'], '/unstuck - respawn at spawn point', '', function (_a, client) {
            var world = _a.world;
            world.resetToSpawn(client);
            world.kick(client, '/unstuck');
        }),
        command(['leave'], '/leave - leave the game', '', function (_a, client) {
            var world = _a.world;
            world.kick(client, '/leave');
        }),
        // pony states
        command(['sit'], '/sit - sit down or stand up', '', shouldNotBeCalled),
        command(['lie', 'lay'], '/lie - lie down or sit up', '', shouldNotBeCalled),
        command(['fly'], '/fly - fly up or fly down', '', shouldNotBeCalled),
        command(['stand'], '/stand - stand up', '', shouldNotBeCalled),
        // emotes
        command(['blush'], '', '', function (_a, _b, message) {
            var pony = _b.pony;
            return playerUtils_1.playerBlush(pony, message);
        }),
        command(['love', '<3'], '', '', function (_a, _b, message) {
            var pony = _b.pony;
            return playerUtils_1.playerLove(pony, message);
        }),
        command(['sleep', 'zzz'], '', '', function (_a, _b, message) {
            var pony = _b.pony;
            return playerUtils_1.playerSleep(pony, message);
        }),
        command(['cry'], '', '', function (_a, _b, message) {
            var pony = _b.pony;
            return playerUtils_1.playerCry(pony, message);
        }),
        // expressions
        emote(['smile', 'happy'], expressionUtils_1.expression(1 /* Neutral */, 1 /* Neutral */, 0 /* Smile */)),
        emote(['frown'], expressionUtils_1.expression(1 /* Neutral */, 1 /* Neutral */, 1 /* Frown */)),
        emote(['angry'], expressionUtils_1.expression(19 /* Angry */, 19 /* Angry */, 1 /* Frown */)),
        emote(['sad'], expressionUtils_1.expression(15 /* Sad */, 15 /* Sad */, 1 /* Frown */)),
        emote(['thinking'], expressionUtils_1.expression(1 /* Neutral */, 8 /* Frown2 */, 7 /* Concerned */)),
        // actions
        action(['yawn'], 3 /* Yawn */),
        action(['laugh', 'lol', 'haha', 'хаха', 'jaja', 'wkwk', 'awok'], 4 /* Laugh */),
        action(['sneeze', 'achoo'], 5 /* Sneeze */),
        action(['excite', 'tada'], 34 /* Excite */),
        action(['magic'], 26 /* Magic */),
        action(['kiss'], 27 /* Kiss */),
        // house
        command(['savehouse'], '/savehouse - saves current house setup', '', function (_a, client) { return __awaiter(_this, void 0, void 0, function () {
            var savedMap;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!isValidMapForEditing(client.map, client, true, false))
                            return [2 /*return*/];
                        client.lastMapLoadOrSave = Date.now();
                        savedMap = JSON.stringify(serverMap_1.saveMap(client.map, { saveTiles: true, saveEntities: true, saveWalls: true, saveOnlyEditableEntities: true }));
                        DEVELOPMENT && console.log(savedMap);
                        client.account.savedMap = savedMap;
                        return [4 /*yield*/, db_1.Account.updateOne({ _id: client.accountId }, { savedMap: savedMap }).exec()];
                    case 1:
                        _b.sent();
                        chat_1.saySystem(client, 'Saved');
                        client.reporter.systemLog("Saved house");
                        return [2 /*return*/];
                }
            });
        }); }),
        command(['loadhouse'], '/loadhouse - loads saved house setup', '', function (_a, client) {
            var world = _a.world;
            if (!isValidMapForEditing(client.map, client, true, true))
                return;
            if (!client.account.savedMap)
                return chat_1.saySystem(client, 'No saved map state');
            client.lastMapLoadOrSave = Date.now();
            serverMap_1.loadMap(world, client.map, JSON.parse(client.account.savedMap), { loadEntities: true, loadWalls: true, loadEntitiesAsEditable: true });
            chat_1.saySystem(client, 'Loaded');
            client.reporter.systemLog("Loaded house");
        }),
        command(['resethouse'], '/resethouse - resets house setup to original state', '', function (_a, client) {
            if (!isValidMapForEditing(client.map, client, true, true))
                return;
            client.lastMapLoadOrSave = Date.now();
            if (houseMap_1.defaultHouseSave) {
                serverMap_1.loadMap(world, client.map, houseMap_1.defaultHouseSave, { loadEntities: true, loadWalls: true, loadEntitiesAsEditable: true });
            }
            chat_1.saySystem(client, 'Reset');
            client.reporter.systemLog("Reset house");
        }),
        command(['lockhouse'], '/lockhouse - prevents other people from changing the house', '', function (_a, client) {
            if (!isValidMapForEditing(client.map, client, false, true))
                return;
            client.map.editingLocked = true;
            chat_1.saySystem(client, 'House locked');
            client.reporter.systemLog("House locked");
        }),
        command(['unlockhouse'], '/unlockhouse - enables editing by other people', '', function (_a, client) {
            if (!isValidMapForEditing(client.map, client, false, true))
                return;
            client.map.editingLocked = false;
            chat_1.saySystem(client, 'House unlocked');
            client.reporter.systemLog("House unlocked");
        }),
        command(['removetoolbox'], '/removetoolbox - removes toolbox from the house', '', function (_a, client) {
            var world = _a.world;
            if (!isValidMapForEditing(client.map, client, true, true))
                return;
            client.lastMapLoadOrSave = Date.now();
            houseMap_1.removeToolbox(world, client.map);
            chat_1.saySystem(client, 'Toolbox removed');
            client.reporter.systemLog("Toolbox removed");
        }),
        command(['restoretoolbox'], '/restoretoolbox - restores toolbox to the house', '', function (_a, client) {
            if (!isValidMapForEditing(client.map, client, true, true))
                return;
            client.lastMapLoadOrSave = Date.now();
            houseMap_1.restoreToolbox(world, client.map);
            chat_1.saySystem(client, 'Toolbox restored');
            client.reporter.systemLog("Toolbox restored");
        }),
        // supporters
        command(['swap'], '/swap <name> - swap character', '', function (_a, client, message) {
            var world = _a.world;
            return __awaiter(_this, void 0, void 0, function () {
                var regex, query;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!message) {
                                return [2 /*return*/, chat_1.saySystem(client, "You need to provide name of the character")];
                            }
                            regex = new RegExp("^" + lodash_1.escapeRegExp(message) + "$", 'i');
                            query = { account: client.account._id, name: { $regex: regex } };
                            return [4 /*yield*/, characterUtils_1.swapCharacter(client, world, query)];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }),
        // mod
        adminModChat(['m'], '/m - mod text', 'mod', 3 /* Mod */),
        command(['emotetest'], '/emotetest - print all emotes', 'mod', function (_context, client) {
            var text = '';
            for (var i = 0; i < emoji_1.emojis.length;) {
                if (text) {
                    text += '\n';
                }
                for (var j = 0; i < emoji_1.emojis.length && j < 20; j++, i++) {
                    text += emoji_1.emojis[i].symbol;
                }
            }
            chat_1.sayTo(client, client.pony, text, 0 /* Chat */);
        }),
        command(['goto'], '/goto <id> [<instance>]', 'mod', function (_a, client, message) {
            var world = _a.world;
            var _b = message.split(' '), _c = _b[0], id = _c === void 0 ? '' : _c, instance = _b[1];
            var map = world.maps.find(function (map) { return map.id === id && map.instance === instance; });
            if (map) {
                var _d = utils_1.randomPoint(map.spawnArea), x = _d.x, y = _d.y;
                world.switchToMap(client, map, x, y);
            }
        }),
        command(['tp'], '/tp <location> | <x> <y> - teleport to location', 'mod', function (_context, client, message) {
            var _a = getSpawnTarget(client.map, message), x = _a.x, y = _a.y;
            playerUtils_1.teleportTo(client, x, y);
        }),
        // admin
        adminModChat(['a'], '/a - admin text', 'admin', 2 /* Admin */),
        command(['announce'], '/announce - global announcement', 'admin', function (_a, client, message, _, __, settings) {
            serverMap_1.findEntities(client.map, function (e) { return e.type === entities_1.butterfly.type || e.type === entities_1.bat.type || e.type === entities_1.firefly.type; })
                .forEach(function (e) { return chat_1.sayToAll(e, message, swears_1.filterBadWords(message), 2 /* Admin */, settings); });
        }),
        command(['time'], '/time <hour> - change server time', DEVELOPMENT ? '' : 'admin', function (_a, _client, message) {
            var world = _a.world;
            if (!/^\d+$/.test(message)) {
                throw new userError_1.UserError('invalid parameter');
            }
            world.setTime(parseInt(message, 10) % 24);
        }),
        command(['togglerestore'], '/togglerestore - toggle terrain restoration', 'admin', function (_a, client) {
            var options = _a.world.options;
            options.restoreTerrain = !options.restoreTerrain;
            chat_1.saySystem(client, "restoration is " + (options.restoreTerrain ? 'on' : 'off'));
        }),
        command(['resettiles'], '/resettiles - reset tiles to original state', 'admin', function (_a, client) {
            for (var _i = 0, _b = client.map.regions; _i < _b.length; _i++) {
                var region = _b[_i];
                serverRegion_1.resetTiles(client.map, region);
            }
        }),
        BETA && command(['season'], '/season <season> [<holiday>]', 'admin', function (_a, _client, message) {
            var world = _a.world;
            var _b = message.split(' '), _c = _b[0], s = _c === void 0 ? '' : _c, _d = _b[1], h = _d === void 0 ? '' : _d;
            var season = utils_1.parseSeason(s);
            var holiday = utils_1.parseHoliday(h);
            if (season === undefined) {
                throw new userError_1.UserError('invalid season');
            }
            else {
                world.setSeason(season, holiday === undefined ? world.holiday : holiday);
            }
        }),
        BETA && command(['weather'], '/weather <none|rain>', 'admin', function (_a, client, message) {
            var weather = parseWeather(message);
            if (weather === undefined) {
                throw new userError_1.UserError('invalid weather');
            }
            else {
                serverMap_1.updateMapState(client.map, { weather: weather });
            }
        }),
        // superadmin
        command(['update'], '/update - prepare server for update', 'superadmin', function (_a) {
            var world = _a.world, liveSettings = _a.liveSettings;
            internal_1.createNotifyUpdate(world, liveSettings)();
        }),
        command(['shutdown'], '/shutdown - shutdown server for update', 'superadmin', function (_a) {
            var world = _a.world, liveSettings = _a.liveSettings;
            internal_1.createShutdownServer(world, liveSettings)(true);
        }),
        // debug
        DEVELOPMENT && command(['map'], '/map - show map info', '', function (_a, client) {
            var world = _a.world;
            var map = client.map;
            var _b = serverMap_1.getSizeOfMap(map), memory = _b.memory, entities = _b.entities;
            var message = "[" + map.id + ":" + (map.instance || '-') + "] " + world.maps.indexOf(map) + "/" + world.maps.length + " " +
                ((memory / 1024).toFixed(2) + " kb " + entities + " entities");
            chat_1.saySystem(client, message);
        }),
        command(['loadmap'], '/loadmap <file name> - load map from file', 'superadmin', function (_a, client, message) {
            var world = _a.world;
            execWithFileName(client, message, function (fileName) {
                return serverMap_1.loadMapFromFile(world, client.map, paths_1.pathTo('store', fileName + ".json"), { loadOnlyTiles: true });
            });
        }),
        command(['savemap'], '/savemap <file name> - save map to file', 'superadmin', function (_, client, message) {
            execWithFileName(client, message, function (fileName) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, serverMap_1.saveMapToFile(client.map, paths_1.pathTo('store', fileName + ".json"), { saveTiles: true })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        }),
        command(['savemapbin'], '/savemapbin <file name> - save map to file', 'superadmin', function (_, client, message) {
            execWithFileName(client, message, function (fileName) { return serverMap_1.saveMapToFileBinaryAlt(client.map, paths_1.pathTo('store', fileName + ".json")); });
        }),
        command(['saveentities'], '/saveentities <file name> - save entities to file', 'superadmin', function (_, client, message) {
            execWithFileName(client, message, function (fileName) { return serverMap_1.saveEntitiesToFile(client.map, paths_1.pathTo('store', fileName + ".txt")); });
        }),
        command(['savehides'], '/savehides - save hides to file', 'superadmin', function (_a, client) {
            var world = _a.world;
            return __awaiter(_this, void 0, void 0, function () {
                var json;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            json = world.hidingService.serialize();
                            return [4 /*yield*/, fs_1.writeFileAsync(paths_1.pathTo('store', 'hides.json'), json, 'utf8')];
                        case 1:
                            _b.sent();
                            chat_1.saySystem(client, 'saved');
                            return [2 /*return*/];
                    }
                });
            });
        }),
        command(['throwerror'], '/throwerror <message> - throw test error', 'superadmin', function (_, _client, message) {
            throw new Error(message || 'test');
        }),
        BETA && command(['test'], '', 'superadmin', function (_a, client) {
            client.map.regions.forEach(function (region) {
                console.log(region.x, region.y, region.colliders.length);
            });
        }),
        BETA && command(['spamchat'], '/spamchat - spam chat messages', 'superadmin', function (_a, client, _, __, ___, settings) {
            var world = _a.world, random = _a.random;
            if (interval) {
                clearInterval(interval);
                interval = undefined;
            }
            else {
                interval = setInterval(function () {
                    if (utils_1.includes(world.clients, client)) {
                        var message = lodash_1.range(random(1, 10)).map(function () { return stringUtils_1.randomString(random(1, 10)); }).join(' ');
                        chat_1.sayToEveryone(client, message, message, 0 /* Chat */, settings);
                    }
                    else {
                        clearInterval(interval);
                    }
                }, 100);
            }
        }),
        BETA && command(['noclouds'], '/noclouds - remove clouds', 'superadmin', function (_a, client) {
            var world = _a.world;
            serverMap_1.findEntities(client.map, function (e) { return e.type === entities_1.cloud.type; }).forEach(function (e) { return world.removeEntity(e, client.map); });
        }),
        BETA && command(['msg'], '/msg - say random stuff', 'superadmin', function (_a, client, _, __, ___, settings) {
            serverMap_1.findEntities(client.map, function (e) { return !!e.options && e.name === 'debug 2'; })
                .forEach(function (e) { return chat_1.sayToAll(e, 'Hello there!', 'Hello there!', 0 /* Chat */, settings); });
        }),
        BETA && command(['hold'], '/hold <name> - hold item', 'superadmin', function (_a, client, message) {
            playerUtils_1.holdItem(client.pony, entities_1.getEntityType(message));
        }),
        BETA && command(['toy'], '/toy <number> - hold toy', 'superadmin', function (_a, client, message) {
            playerUtils_1.holdToy(client.pony, parseInt(message, 10) | 0);
        }),
        BETA && command(['dc'], '/dc', 'superadmin', function (_a, client) {
            client.disconnect(true, false);
        }),
        BETA && command(['disconnect'], '/disconnect', 'superadmin', function (_a, client) {
            client.disconnect(true, true);
        }),
        BETA && command(['info'], '/info <id>', 'superadmin', function (_a, client, message) {
            var world = _a.world;
            var id = parseInt(message, 10) | 0;
            var entity = world.getEntityById(id);
            if (entity) {
                var id_1 = entity.id, type = entity.type, x = entity.x, y = entity.y, options = entity.options;
                var info = { id: id_1, type: entities_1.getEntityTypeName(type), x: x, y: y, options: options };
                chat_1.saySystem(client, JSON.stringify(info, null, 2));
            }
            else {
                chat_1.saySystem(client, 'undefined');
            }
        }),
        BETA && command(['collider'], '/collider', 'superadmin', function (_a, client) {
            var region = worldMap_1.getRegionGlobal(client.map, client.pony.x, client.pony.y);
            if (region) {
                serverMap_1.saveRegionCollider(region);
                chat_1.saySystem(client, 'saved');
                // console.log(region.tileIndices);
            }
        }),
        DEVELOPMENT && command(['testparty'], '', 'superadmin', function (_a, client) {
            var party = _a.party;
            var entities = serverMap_1.findEntities(client.map, function (e) { return !!e.client && /^debug/.test(e.name || ''); });
            for (var _i = 0, _b = entities.slice(0, constants_1.PARTY_LIMIT - 1); _i < _b.length; _i++) {
                var e = _b[_i];
                party.invite(client, e.client);
            }
        }),
    ]);
    return commands;
}
exports.createCommands = createCommands;
function getSpamCommandNames(commands) {
    return utils_1.flatten(commands.filter(function (c) { return c.spam; }).map(function (c) { return c.names; }));
}
exports.getSpamCommandNames = getSpamCommandNames;
var createRunCommand = function (context, commands) {
    return function (client, command, args, type, target, settings) {
        command = command.toLowerCase().trim();
        var func = commands.find(function (c) { return c.names.indexOf(command) !== -1; });
        try {
            if (func && hasRoleNull(client, func.role)) {
                func.handler(context, client, args, type, target, settings);
            }
            else {
                return false;
            }
        }
        catch (e) {
            if (userError_1.isUserError(e)) {
                chat_1.saySystem(client, e.message);
            }
            else {
                throw e;
            }
        }
        return true;
    };
};
exports.createRunCommand = createRunCommand;
var chatTypes = new Map();
chatTypes.set('p', 1 /* Party */);
chatTypes.set('party', 1 /* Party */);
chatTypes.set('s', 0 /* Say */);
chatTypes.set('say', 0 /* Say */);
chatTypes.set('t', 2 /* Think */);
chatTypes.set('think', 2 /* Think */);
chatTypes.set('ss', 4 /* Supporter */);
chatTypes.set('s1', 5 /* Supporter1 */);
chatTypes.set('s2', 6 /* Supporter2 */);
chatTypes.set('s3', 7 /* Supporter3 */);
chatTypes.set('r', 9 /* Whisper */);
chatTypes.set('reply', 9 /* Whisper */);
chatTypes.set('w', 9 /* Whisper */);
chatTypes.set('whisper', 9 /* Whisper */);
function parseCommand(text, type) {
    if (!utils_1.isCommand(text) || text.toLowerCase().startsWith('/shrug')) {
        return { args: text, type: type };
    }
    var _a = utils_1.processCommand(text), command = _a.command, args = _a.args;
    if (command) {
        var chatType = chatTypes.get(command.toLowerCase());
        if (chatType !== undefined) {
            if (chatType === 2 /* Think */) {
                type = type === 1 /* Party */ ? 3 /* PartyThink */ : 2 /* Think */;
            }
            else {
                type = chatType;
            }
            return { args: args, type: type };
        }
    }
    return { command: command, args: args, type: type };
}
exports.parseCommand = parseCommand;
function getChatPrefix(type) {
    switch (type) {
        case 1 /* Party */:
        case 3 /* PartyThink */:
            return '/p ';
        case 4 /* Supporter */:
            return '/ss ';
        case 8 /* Dismiss */:
            return '/dismiss ';
        case 9 /* Whisper */:
            return '/w ';
        default:
            return '';
    }
}
exports.getChatPrefix = getChatPrefix;
//# sourceMappingURL=commands.js.map