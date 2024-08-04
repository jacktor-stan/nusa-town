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
exports.createMinimap = exports.hasAnyClients = exports.updateMapState = exports.findEntitiesInBounds = exports.findEntities = exports.findClosestEntity = exports.saveRegionCollider = exports.loadMapFromFile = exports.loadMap = exports.saveEntitiesToFile = exports.saveMapToFileBinaryAlt = exports.saveMapToFileBinary = exports.saveMapToFile = exports.saveMap = exports.deserializeMap = exports.serializeMap = exports.serializeTiles = exports.isTileLocked = exports.lockTiles = exports.lockTile = exports.snapshotTiles = exports.setTile = exports.getSizeOfMap = exports.getMapInfo = exports.copyMapTiles = exports.serverMapInstanceFromTemplate = exports.createServerMap = void 0;
var fs_1 = require("fs");
var base64_js_1 = require("base64-js");
var interfaces_1 = require("../common/interfaces");
var worldMap_1 = require("../common/worldMap");
var utils_1 = require("../common/utils");
var movementUtils_1 = require("../common/movementUtils");
var entities_1 = require("../common/entities");
var compress_1 = require("../common/compress");
var rect_1 = require("../common/rect");
var serverRegion_1 = require("./serverRegion");
var colors_1 = require("../common/colors");
var constants_1 = require("../common/constants");
var paths_1 = require("./paths");
var canvasUtilsNode_1 = require("./canvasUtilsNode");
var ponyInfo_1 = require("../common/ponyInfo");
var entityUtils_1 = require("./entityUtils");
function createServerMap(id, type, regionsX, regionsY, defaultTile, usage, initRegions) {
    if (defaultTile === void 0) { defaultTile = 0 /* None */; }
    if (usage === void 0) { usage = 0 /* Public */; }
    if (initRegions === void 0) { initRegions = true; }
    var width = regionsX * constants_1.REGION_SIZE;
    var height = regionsY * constants_1.REGION_SIZE;
    var regions = [];
    var state = __assign({}, interfaces_1.defaultMapState);
    var spawnArea = rect_1.rect(0, 0, 1, 1);
    var lockedTiles = new Set();
    if (regionsX <= 0 || regionsY <= 0 || width > movementUtils_1.POSITION_MAX || height > movementUtils_1.POSITION_MAX) {
        throw new Error('Invalid map parameters');
    }
    if (initRegions) {
        for (var ry = 0; ry < regionsY; ry++) {
            for (var rx = 0; rx < regionsX; rx++) {
                regions.push(serverRegion_1.createServerRegion(rx, ry, defaultTile));
            }
        }
    }
    return {
        id: id,
        usage: usage,
        type: type,
        flags: 0 /* None */,
        width: width,
        height: height,
        state: state,
        regions: regions,
        regionsX: regionsX,
        regionsY: regionsY,
        defaultTile: defaultTile,
        spawnArea: spawnArea,
        lockedTiles: lockedTiles,
        spawns: new Map(), instance: undefined, lastUsed: Date.now(), controllers: [],
        dontUpdateTilesAndColliders: false, tilesLocked: false, editableEntityLimit: 0, editingLocked: false,
    };
}
exports.createServerMap = createServerMap;
function serverMapInstanceFromTemplate(map) {
    var id = map.id, usage = map.usage, type = map.type, flags = map.flags, width = map.width, height = map.height, state = map.state, regionsX = map.regionsX, regionsY = map.regionsY, defaultTile = map.defaultTile, spawnArea = map.spawnArea, lockedTiles = map.lockedTiles, editableEntityLimit = map.editableEntityLimit;
    return {
        id: id,
        usage: usage,
        type: type,
        flags: flags,
        width: width,
        height: height,
        state: __assign({}, state),
        regions: map.regions.map(serverRegion_1.cloneServerRegion),
        regionsX: regionsX,
        regionsY: regionsY,
        defaultTile: defaultTile,
        spawnArea: spawnArea,
        lockedTiles: lockedTiles,
        spawns: new Map(), instance: undefined, lastUsed: Date.now(), controllers: [],
        dontUpdateTilesAndColliders: true, tilesLocked: map.tilesLocked,
        editableEntityLimit: editableEntityLimit,
        editingLocked: false,
    };
}
exports.serverMapInstanceFromTemplate = serverMapInstanceFromTemplate;
function copyMapTiles(target, source) {
    for (var i = 0; i < target.regions.length; i++) {
        var srcRegion = source.regions[i];
        var tgtRegion = target.regions[i];
        tgtRegion.tiles.set(srcRegion.tiles);
        tgtRegion.tileIndices.set(srcRegion.tileIndices);
        tgtRegion.encodedTiles = srcRegion.encodedTiles;
        tgtRegion.colliderDirty = true;
    }
}
exports.copyMapTiles = copyMapTiles;
function getMapInfo(map) {
    return {
        type: map.type,
        flags: map.flags,
        regionsX: map.regionsX,
        regionsY: map.regionsY,
        defaultTile: map.defaultTile,
        editableArea: map.editableArea,
    };
}
exports.getMapInfo = getMapInfo;
function getSizeOfMap(map) {
    var memory = map.regions.reduce(function (sum, r) { return sum + serverRegion_1.getSizeOfRegion(r); }, 0);
    var entities = map.regions.reduce(function (sum, r) { return sum + r.entities.length; }, 0);
    return { memory: memory, entities: entities };
}
exports.getSizeOfMap = getSizeOfMap;
function setTile(map, x, y, type) {
    var region = worldMap_1.getRegionGlobal(map, x, y);
    if (region) {
        var regionX = Math.floor(x) - region.x * constants_1.REGION_SIZE;
        var regionY = Math.floor(y) - region.y * constants_1.REGION_SIZE;
        serverRegion_1.setRegionTile(map, region, regionX, regionY, type);
    }
}
exports.setTile = setTile;
function snapshotTiles(map) {
    for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
        var region = _a[_i];
        serverRegion_1.snapshotRegionTiles(region);
    }
}
exports.snapshotTiles = snapshotTiles;
function lockTile(map, x, y) {
    var index = ((x | 0) + (y | 0) * map.width) | 0;
    map.lockedTiles.add(index);
}
exports.lockTile = lockTile;
function lockTiles(map, x, y, w, h) {
    for (var iy = 0; iy < h; iy++) {
        for (var ix = 0; ix < w; ix++) {
            lockTile(map, x + ix, y + iy);
        }
    }
}
exports.lockTiles = lockTiles;
function isTileLocked(map, x, y) {
    var index = ((x | 0) + (y | 0) * map.width) | 0;
    return map.lockedTiles.has(index);
}
exports.isTileLocked = isTileLocked;
function serializeTiles(map) {
    var tilesData = [];
    var data = [];
    var width = map.width, height = map.height;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            tilesData.push(worldMap_1.getTile(map, x, y));
        }
    }
    for (var i = 0; i < tilesData.length; i++) {
        var tile = tilesData[i];
        var count = 1;
        while (tilesData.length > (i + 1) && tilesData[i + 1] === tile && count < 255) {
            count++;
            i++;
        }
        data.push(count, tile);
    }
    return new Uint8Array(data);
}
exports.serializeTiles = serializeTiles;
function serializeMap(map) {
    var width = map.width, height = map.height;
    var tiles = base64_js_1.fromByteArray(serializeTiles(map));
    return { width: width, height: height, tiles: tiles };
}
exports.serializeMap = serializeMap;
function deserializeMap(map, _a, _b) {
    var tiles = _a.tiles, width = _a.width;
    var _c = _b === void 0 ? {} : _b, _d = _c.offsetX, offsetX = _d === void 0 ? 0 : _d, _e = _c.offsetY, offsetY = _e === void 0 ? 0 : _e;
    var decodedTiles = compress_1.deserializeTiles(tiles);
    for (var i = 0; i < decodedTiles.length; i++) {
        var x = i % width;
        var y = Math.floor(i / width);
        setTile(map, x + offsetX, y + offsetY, decodedTiles[i]);
    }
}
exports.deserializeMap = deserializeMap;
function saveMap(map, saveOptions) {
    var data = { width: map.width, height: map.height };
    if (saveOptions.saveTiles) {
        data.tiles = serializeMap(map).tiles;
    }
    if (saveOptions.saveEntities) {
        data.entities = [];
        for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
            var region = _a[_i];
            for (var _b = 0, _c = region.entities; _b < _c.length; _b++) {
                var entity = _c[_b];
                if (!utils_1.hasFlag(entity.serverFlags, 2 /* DoNotSave */) && !utils_1.hasFlag(entity.flags, 16 /* Debug */)) {
                    if (saveOptions.saveOnlyEditableEntities && !utils_1.hasFlag(entity.state, 8 /* Editable */))
                        continue;
                    var options = entity.options && Object.keys(entity.options).length > 0 ? entity.options : undefined;
                    var name_1 = entity.name;
                    data.entities.push({ type: entities_1.getEntityTypeName(entity.type), x: entity.x, y: entity.y, options: options, name: name_1 });
                }
            }
        }
    }
    if (saveOptions.saveWalls) {
        var controller = map.controllers.find(function (c) { return c.toggleWall; });
        if (controller) {
            data.walls = controller.serialize();
        }
    }
    return data;
}
exports.saveMap = saveMap;
function saveMapToFile(map, fileName, options) {
    return __awaiter(this, void 0, void 0, function () {
        var data, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = saveMap(map, options);
                    json = JSON.stringify(data, null, 2);
                    return [4 /*yield*/, fs_1.writeFileAsync(fileName, json, 'utf8')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.saveMapToFile = saveMapToFile;
function saveMapToFileBinary(map, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var tiles, buffer, view;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tiles = serializeTiles(map);
                    buffer = new Uint8Array(4 + 4 + tiles.byteLength);
                    view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                    view.setInt32(0, map.width, true);
                    view.setInt32(4, map.height, true);
                    buffer.set(tiles, 8);
                    return [4 /*yield*/, fs_1.writeFileAsync(fileName, Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.saveMapToFileBinary = saveMapToFileBinary;
function saveMapToFileBinaryAlt(map, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, y, i, x;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    buffer = Buffer.alloc(4 + 4 + map.width * map.height);
                    buffer.writeUInt32LE(map.width, 0);
                    buffer.writeUInt32LE(map.height, 4);
                    for (y = 0, i = 8; y < map.height; y++) {
                        for (x = 0; x < map.width; x++, i++) {
                            buffer.writeUInt8(worldMap_1.getTile(map, x, y), i);
                        }
                    }
                    return [4 /*yield*/, fs_1.writeFileAsync(fileName, buffer)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.saveMapToFileBinaryAlt = saveMapToFileBinaryAlt;
function saveEntitiesToFile(map, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var lines, _i, _a, region, _b, _c, entity;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    lines = [];
                    for (_i = 0, _a = map.regions; _i < _a.length; _i++) {
                        region = _a[_i];
                        for (_b = 0, _c = region.entities; _b < _c.length; _b++) {
                            entity = _c[_b];
                            lines.push(entities_1.getEntityTypeName(entity.type) + " " + entity.x + " " + entity.y);
                        }
                    }
                    return [4 /*yield*/, fs_1.writeFileAsync(fileName, lines.join('\n'), 'utf8')];
                case 1:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.saveEntitiesToFile = saveEntitiesToFile;
function loadMap(world, map, data, loadOptions) {
    if (data.tiles) {
        deserializeMap(map, data, loadOptions);
    }
    if (loadOptions.loadOnlyTiles)
        return;
    if (loadOptions.loadEntitiesAsEditable) {
        var entitiesToRemove = [];
        for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
            var region = _a[_i];
            for (var _b = 0, _c = region.entities; _b < _c.length; _b++) {
                var entity = _c[_b];
                if (utils_1.hasFlag(entity.state, 8 /* Editable */)) {
                    entitiesToRemove.push(entity);
                }
            }
        }
        for (var _d = 0, entitiesToRemove_1 = entitiesToRemove; _d < entitiesToRemove_1.length; _d++) {
            var entity = entitiesToRemove_1[_d];
            world.removeEntity(entity, map);
        }
    }
    if (loadOptions.loadEntities && data.entities) {
        for (var _e = 0, _f = data.entities; _e < _f.length; _e++) {
            var _g = _f[_e], x = _g.x, y = _g.y, type = _g.type, name_2 = _g.name, options = _g.options;
            var typeNumber = entities_1.getEntityType(type);
            var entity = entities_1.createAnEntity(typeNumber, 0, x, y, options, ponyInfo_1.mockPaletteManager, world);
            if (name_2) {
                entityUtils_1.setEntityName(entity, name_2);
            }
            if (loadOptions.loadEntitiesAsEditable) {
                entity.state |= 8 /* Editable */;
            }
            world.addEntity(entity, map);
        }
    }
    if (loadOptions.loadWalls && data.walls) {
        var controller = map.controllers.find(function (c) { return c.toggleWall; });
        if (controller) {
            controller.deserialize(data.width, data.height, data.walls);
        }
    }
}
exports.loadMap = loadMap;
function loadMapFromFile(world, map, fileName, options) {
    return __awaiter(this, void 0, void 0, function () {
        var json, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.readFileAsync(fileName, 'utf8')];
                case 1:
                    json = _a.sent();
                    data = JSON.parse(json);
                    loadMap(world, map, data, options);
                    return [2 /*return*/];
            }
        });
    });
}
exports.loadMapFromFile = loadMapFromFile;
function saveRegionCollider(region) {
    var canvas = canvasUtilsNode_1.createCanvas(constants_1.REGION_WIDTH, constants_1.REGION_HEIGHT);
    var context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#eee';
    for (var y = 0, i = 0; y < constants_1.REGION_SIZE; y++, i++) {
        for (var x = 0; x < constants_1.REGION_SIZE; x++, i++) {
            if ((i % 2) === 0) {
                context.fillRect(x * constants_1.tileWidth, y * constants_1.tileHeight, constants_1.tileWidth, constants_1.tileHeight);
            }
        }
    }
    context.globalAlpha = 0.8;
    context.fillStyle = 'red';
    for (var y = 0; y < constants_1.REGION_HEIGHT; y++) {
        for (var x = 0; x < constants_1.REGION_WIDTH; x++) {
            if (region.collider[x + y * constants_1.REGION_WIDTH]) {
                context.fillRect(x, y, 1, 1);
            }
        }
    }
    fs_1.writeFileSync(paths_1.pathTo('store', 'collider.png'), canvas.toBuffer());
}
exports.saveRegionCollider = saveRegionCollider;
function distanceSquaredToRegion(x, y, region) {
    var left = region.x * constants_1.REGION_SIZE;
    var top = region.y * constants_1.REGION_SIZE;
    var right = left + constants_1.REGION_SIZE;
    var bottom = top + constants_1.REGION_SIZE;
    var dx = x < left ? (left - x) : (x > right ? (x - right) : 0);
    var dy = y < left ? (top - y) : (y > bottom ? (y - bottom) : 0);
    return dx * dx + dy * dy;
}
function findClosestEntity(map, originX, originY, predicate) {
    var minX = Math.floor(originX / constants_1.REGION_SIZE);
    var minY = Math.floor(originY / constants_1.REGION_SIZE);
    var maxX = minX;
    var maxY = minY;
    var closest = undefined;
    var closestDist = Number.MAX_VALUE;
    while (minX >= 0 || minY >= 0 || maxX < map.regionsX || maxY < map.regionsY) {
        var regionsChecked = 0;
        for (var y = minY; y <= maxY; y++) {
            for (var x = minX; x <= maxX; x = (x === maxX || y === minY || y === maxY) ? x + 1 : maxX) {
                if (x >= 0 && y >= 0 && x < map.regionsX && y < map.regionsY) {
                    var region = worldMap_1.getRegion(map, x, y);
                    if (distanceSquaredToRegion(originX, originY, region) < closestDist) {
                        regionsChecked++;
                        for (var _i = 0, _a = region.entities; _i < _a.length; _i++) {
                            var entity = _a[_i];
                            if (predicate(entity)) {
                                var dist = utils_1.distanceSquaredXY(originX, originY, entity.x, entity.y);
                                if (dist < closestDist) {
                                    closest = entity;
                                    closestDist = dist;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (!regionsChecked) {
            break;
        }
        minX -= 1;
        minY -= 1;
        maxX += 1;
        maxY += 1;
    }
    return closest;
}
exports.findClosestEntity = findClosestEntity;
function findEntities(map, predicate) {
    var entities = [];
    for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
        var region = _a[_i];
        for (var _b = 0, _c = region.entities; _b < _c.length; _b++) {
            var entity = _c[_b];
            if (predicate(entity)) {
                entities.push(entity);
            }
        }
    }
    return entities;
}
exports.findEntities = findEntities;
// TODO: maybe only regions in bounds, instead of adding 1 region border ?
function forEachRegionInBounds(map, bounds, callback) {
    var minX = Math.max(0, Math.floor(bounds.x / constants_1.REGION_SIZE) - 1) | 0;
    var minY = Math.max(0, Math.floor(bounds.y / constants_1.REGION_SIZE) - 1) | 0;
    var maxX = Math.min(Math.floor((bounds.x + bounds.w) / constants_1.REGION_SIZE) + 1, map.regionsX - 1) | 0;
    var maxY = Math.min(Math.floor((bounds.y + bounds.h) / constants_1.REGION_SIZE) + 1, map.regionsY - 1) | 0;
    for (var ry = minY; ry <= maxY; ry++) {
        for (var rx = minX; rx <= maxX; rx++) {
            var region = worldMap_1.getRegion(map, rx, ry);
            callback(region);
        }
    }
}
function findEntitiesInBounds(map, bounds) {
    var result = [];
    forEachRegionInBounds(map, bounds, function (region) {
        for (var _i = 0, _a = region.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (utils_1.containsPoint(0, 0, bounds, entity.x, entity.y)) {
                result.push(entity);
            }
        }
    });
    return result;
}
exports.findEntitiesInBounds = findEntitiesInBounds;
function updateMapState(map, update) {
    Object.assign(map.state, update);
    for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
        var region = _a[_i];
        for (var _b = 0, _c = region.clients; _b < _c.length; _b++) {
            var client = _c[_b];
            client.mapUpdate(map.state);
        }
    }
}
exports.updateMapState = updateMapState;
function hasAnyClients(map) {
    for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
        var region = _a[_i];
        if (region.clients.length > 0) {
            return true;
        }
    }
    return false;
}
exports.hasAnyClients = hasAnyClients;
function createMinimap(world, map) {
    var width = map.width, height = map.height;
    var buffer = new Uint32Array(width * height);
    for (var y = 0; y < map.height; y++) {
        for (var x = 0; x < map.width; x++) {
            var tile = worldMap_1.getTile(map, x, y);
            buffer[x + y * width] = colors_1.getTileColor(tile, world.season);
        }
    }
    // map.entities = info.entities
    // 	.map(({ type, id, x, y }) => createAnEntity(type, id, x, y, {}, mockPaletteManager));
    // for (let i = 1; i <= 2; i++) {
    // 	for (const e of map.entities) {
    // 		if (e.minimap && e.minimap.order === i) {
    // 			const { color, rect } = e.minimap;
    // 			mapContext.fillStyle = colorToCSS(color);
    // 			mapContext.fillRect(Math.round(e.x + rect.x), Math.round(e.y + rect.y), rect.w, rect.h);
    // 		}
    // 	}
    // }
    // canvas.width = mapCanvas.width * scale;
    // canvas.height = mapCanvas.height * scale;
    // const context = canvas.getContext('2d')!;
    // context.save();
    // if (scale >= 1) {
    // 	disableImageSmoothing(context);
    // }
    // context.scale(scale, scale);
    // context.drawImage(mapCanvas, 0, 0);
    // context.restore();
    return new Uint8Array(buffer.buffer);
}
exports.createMinimap = createMinimap;
//# sourceMappingURL=serverMap.js.map