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
Object.defineProperty(exports, "__esModule", { value: true });
exports.tickTilesRestoration = exports.resetTiles = exports.getRegionTiles = exports.snapshotRegionTiles = exports.resetRegionUpdates = exports.setRegionTile = exports.pushRemoveEntityToRegion = exports.pushUpdateEntityToRegion = exports.removeEntityFromRegion = exports.addEntityToRegion = exports.getSizeOfRegion = exports.cloneServerRegion = exports.createServerRegion = void 0;
var lodash_1 = require("lodash");
var interfaces_1 = require("../common/interfaces");
var compress_1 = require("../common/compress");
var rect_1 = require("../common/rect");
var constants_1 = require("../common/constants");
var positionUtils_1 = require("../common/positionUtils");
var utils_1 = require("../common/utils");
var collision_1 = require("../common/collision");
var region_1 = require("../common/region");
var worldMap_1 = require("../common/worldMap");
var subscribeBoundsBottomPad = 3;
var randoms = new Uint8Array(constants_1.REGION_SIZE * constants_1.REGION_SIZE);
function createServerRegion(x, y, defaultTile) {
    if (defaultTile === void 0) { defaultTile = 1 /* Dirt */; }
    var bounds = rect_1.rect(x * constants_1.REGION_SIZE, y * constants_1.REGION_SIZE, constants_1.REGION_SIZE, constants_1.REGION_SIZE);
    var tiles = new Uint8Array(constants_1.REGION_SIZE * constants_1.REGION_SIZE);
    var tileIndices = new Int16Array(constants_1.REGION_SIZE * constants_1.REGION_SIZE);
    var collider = new Uint8Array(constants_1.REGION_SIZE * constants_1.REGION_SIZE * constants_1.tileWidth * constants_1.tileHeight);
    tileIndices.fill(-1);
    if (defaultTile !== 0) {
        for (var i = 0; i < tiles.length; i++) {
            tiles[i] = defaultTile;
        }
    }
    return {
        x: x,
        y: y,
        entityUpdates: [],
        entityRemoves: [],
        tileUpdates: [],
        clients: [],
        entities: [],
        movables: [],
        colliders: [],
        collider: collider,
        colliderDirty: true,
        randoms: randoms,
        tiles: tiles,
        tileIndices: tileIndices,
        tilesDirty: true,
        tilesSnapshot: undefined,
        tilesTimeouts: undefined,
        encodedTiles: undefined,
        reusedUpdates: 0,
        bounds: bounds,
        boundsWithBorder: rect_1.withBorder(bounds, constants_1.REGION_BORDER),
        subscribeBounds: positionUtils_1.rectToScreen(rect_1.withPadding(bounds, constants_1.REGION_SIZE, constants_1.REGION_SIZE, constants_1.REGION_SIZE + subscribeBoundsBottomPad, constants_1.REGION_SIZE)),
        unsubscribeBounds: positionUtils_1.rectToScreen(rect_1.withPadding(bounds, constants_1.REGION_SIZE + 1, constants_1.REGION_SIZE + 1, constants_1.REGION_SIZE + subscribeBoundsBottomPad + 1, constants_1.REGION_SIZE + 1)),
    };
}
exports.createServerRegion = createServerRegion;
function cloneServerRegion(region) {
    var tiles = new Uint8Array(constants_1.REGION_SIZE * constants_1.REGION_SIZE);
    tiles.set(region.tiles);
    return {
        x: region.x,
        y: region.y,
        entityUpdates: [],
        entityRemoves: [],
        tileUpdates: [],
        clients: [],
        entities: [],
        movables: [],
        colliders: [],
        collider: region.collider,
        colliderDirty: false,
        randoms: randoms,
        tiles: tiles,
        tileIndices: region.tileIndices,
        tilesDirty: false,
        tilesSnapshot: undefined,
        tilesTimeouts: undefined,
        encodedTiles: region.encodedTiles,
        reusedUpdates: 0,
        bounds: region.bounds,
        boundsWithBorder: region.boundsWithBorder,
        subscribeBounds: region.subscribeBounds,
        unsubscribeBounds: region.unsubscribeBounds,
    };
}
exports.cloneServerRegion = cloneServerRegion;
function getSizeOfRegion(region) {
    var size = region.tiles.byteLength;
    size += region.tileIndices.byteLength;
    size += region.tilesSnapshot ? region.tilesSnapshot.byteLength : 0;
    size += region.tilesTimeouts ? region.tilesTimeouts.byteLength : 0;
    size += region.encodedTiles ? region.encodedTiles.byteLength : 0;
    size += region.collider ? region.collider.byteLength : 0;
    return size;
}
exports.getSizeOfRegion = getSizeOfRegion;
function addEntityToRegion(region, entity, map) {
    region.entities.push(entity);
    if (collision_1.canCollideWith(entity)) {
        region.colliders.push(entity);
        region_1.invalidateRegionsCollider(region, map);
    }
    if (utils_1.hasFlag(entity.flags, 1 /* Movable */)) {
        region.movables.push(entity);
    }
}
exports.addEntityToRegion = addEntityToRegion;
function removeEntityFromRegion(region, entity, map) {
    var removed = utils_1.removeItem(region.entities, entity);
    if (collision_1.canCollideWith(entity)) {
        utils_1.removeItem(region.colliders, entity);
        region_1.invalidateRegionsCollider(region, map);
    }
    utils_1.removeItem(region.movables, entity);
    return removed;
}
exports.removeEntityFromRegion = removeEntityFromRegion;
function pushUpdateEntityToRegion(region, update) {
    var index = findUpdate(region, update.entity);
    if (index === -1) {
        region.entityUpdates.push(__assign({ x: 0, y: 0, vx: 0, vy: 0, action: 0, playerState: 0, options: undefined }, update));
    }
    else {
        region.reusedUpdates++;
        var existing = region.entityUpdates[index];
        existing.flags |= update.flags;
        if (utils_1.hasFlag(update.flags, 1 /* Position */)) {
            var _a = update.x, x = _a === void 0 ? 0 : _a, _b = update.y, y = _b === void 0 ? 0 : _b, _c = update.vx, vx = _c === void 0 ? 0 : _c, _d = update.vy, vy = _d === void 0 ? 0 : _d;
            existing.x = x;
            existing.y = y;
            existing.vx = vx;
            existing.vy = vy;
        }
        if (utils_1.hasFlag(update.flags, 32 /* Options */)) {
            existing.options = __assign(__assign({}, existing.options), update.options);
        }
        if (utils_1.hasFlag(update.flags, 1024 /* PlayerState */)) {
            existing.playerState = update.playerState;
        }
        if (utils_1.hasFlag(update.flags, 128 /* Action */)) {
            existing.action = update.action;
        }
    }
}
exports.pushUpdateEntityToRegion = pushUpdateEntityToRegion;
function pushRemoveEntityToRegion(region, entity) {
    region.entityRemoves.push(entity.id);
}
exports.pushRemoveEntityToRegion = pushRemoveEntityToRegion;
function setRegionTile(map, region, x, y, type, skipRestore) {
    if (skipRestore === void 0) { skipRestore = false; }
    var old = region_1.getRegionTile(region, x, y);
    if (type === old)
        return;
    var index = x | (y << 3);
    region.tiles[index] = type;
    region.tileUpdates.push({ x: x, y: y, type: type });
    region.encodedTiles = undefined;
    if (region.tilesTimeouts && !skipRestore) {
        region.tilesTimeouts[index] = lodash_1.random(constants_1.TILES_RESTORE_MIN_SEC, constants_1.TILES_RESTORE_MAX_SEC);
    }
    if (interfaces_1.canWalk(old) !== interfaces_1.canWalk(type)) {
        worldMap_1.setTilesDirty(map, region.x * constants_1.REGION_SIZE + x - 1, region.y * constants_1.REGION_SIZE + y - 1, 3, 3);
        worldMap_1.setColliderDirty(map, region, x, y);
    }
}
exports.setRegionTile = setRegionTile;
function resetRegionUpdates(region) {
    region.entityUpdates.length = 0;
    region.entityRemoves.length = 0;
    region.tileUpdates.length = 0;
    region.reusedUpdates = 0;
}
exports.resetRegionUpdates = resetRegionUpdates;
function snapshotRegionTiles(region) {
    region.tilesSnapshot = region.tiles.slice();
    region.tilesTimeouts = new Uint8Array(region.tiles.length);
}
exports.snapshotRegionTiles = snapshotRegionTiles;
function getRegionTiles(region) {
    if (region.encodedTiles === undefined) {
        region.encodedTiles = compress_1.compressTiles(region.tiles);
    }
    return region.encodedTiles;
}
exports.getRegionTiles = getRegionTiles;
function resetTiles(map, region) {
    if (region.tilesSnapshot && region.tilesTimeouts) {
        for (var i = 0; i < region.tilesTimeouts.length; i++) {
            region.tilesTimeouts[i] = 0;
            if (region.tiles[i] !== region.tilesSnapshot[i]) {
                var x = i % constants_1.REGION_SIZE;
                var y = Math.floor(i / constants_1.REGION_SIZE);
                setRegionTile(map, region, x, y, region.tilesSnapshot[i], true);
            }
        }
    }
}
exports.resetTiles = resetTiles;
function tickTilesRestoration(map, region) {
    if (region.tilesSnapshot && region.tilesTimeouts) {
        for (var i = 0; i < region.tilesTimeouts.length; i++) {
            if (region.tilesTimeouts[i] > 0) {
                region.tilesTimeouts[i]--;
                if (region.tilesTimeouts[i] === 0 && region.tiles[i] !== region.tilesSnapshot[i]) {
                    var x = i % constants_1.REGION_SIZE;
                    var y = Math.floor(i / constants_1.REGION_SIZE);
                    setRegionTile(map, region, x, y, region.tilesSnapshot[i], true);
                }
            }
        }
    }
}
exports.tickTilesRestoration = tickTilesRestoration;
function findUpdate(_a, entity) {
    var entityUpdates = _a.entityUpdates;
    for (var i = 0; i < entityUpdates.length; i++) {
        if (entityUpdates[i].entity === entity) {
            return i;
        }
    }
    return -1;
}
//# sourceMappingURL=serverRegion.js.map