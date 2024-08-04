"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTiming = exports.setupTiming = exports.sparseRegionUpdate = exports.isSubscribedToRegion = exports.removeFromRegion = exports.addToRegion = exports.transferToRegion = exports.commitRegionUpdates = exports.updateRegions = exports.updateRegion = exports.getExpectedRegion = exports.unsubscribeFromAllRegions = exports.unsubscribeFromOutOfRangeRegions = exports.subscribeToRegionsInRange = exports.resetEncodeUpdate = void 0;
var ag_sockets_1 = require("ag-sockets");
var utils_1 = require("../common/utils");
var serverRegion_1 = require("./serverRegion");
var entityUtils_1 = require("./entityUtils");
var updateEncoder_1 = require("../common/encoders/updateEncoder");
var positionUtils_1 = require("../common/positionUtils");
var camera_1 = require("../common/camera");
var timing_1 = require("./timing");
var worldMap_1 = require("../common/worldMap");
var logger_1 = require("./logger");
var constants_1 = require("../common/constants");
var updatesBuffer = new ArrayBuffer(4096);
var updatesBufferOffset = 0;
function resetEncodeUpdate() {
    updatesBufferOffset = 0;
}
exports.resetEncodeUpdate = resetEncodeUpdate;
function resizeUpdatesBuffer(e) {
    if (entityUtils_1.isOverflowError(e)) {
        updatesBuffer = new ArrayBuffer(updatesBuffer.byteLength * 2);
        updatesBufferOffset = 0;
        DEVELOPMENT && logger_1.logger.debug("resize buffer to " + updatesBuffer.byteLength + " (" + e.message + ")");
    }
    else {
        throw e;
    }
}
function createUpdatesWriter() {
    var buffer = new Uint8Array(updatesBuffer, updatesBufferOffset, updatesBuffer.byteLength - updatesBufferOffset);
    return ag_sockets_1.createBinaryWriter(buffer);
}
function commitUpdatesWriter(writer) {
    var result = ag_sockets_1.getWriterBuffer(writer);
    updatesBufferOffset += result.byteLength;
    return result;
}
function encodeUpdate(region) {
    timing_1.timingStart('encodeUpdate()');
    var result;
    while (true) {
        try {
            var writer = createUpdatesWriter();
            updateEncoder_1.writeUpdate(writer, region);
            result = commitUpdatesWriter(writer);
            break;
        }
        catch (e) {
            resizeUpdatesBuffer(e);
        }
    }
    timing_1.timingEnd();
    return result;
}
function encodeRegion(region, client) {
    timing_1.timingStart('encodeRegion()');
    var result;
    while (true) {
        try {
            var writer = createUpdatesWriter();
            updateEncoder_1.writeRegion(writer, region, client);
            result = commitUpdatesWriter(writer);
            break;
        }
        catch (e) {
            resizeUpdatesBuffer(e);
        }
    }
    timing_1.timingEnd();
    return result;
}
function subscribeToRegionsInRange(client) {
    timing_1.timingStart('subscribeToRegionsInRange()');
    var map = client.map, camera = client.camera;
    var maxX = utils_1.clamp(Math.floor(positionUtils_1.toWorldX(camera.x + camera.w) / constants_1.REGION_SIZE) + 1, 0, map.regionsX - 1);
    var maxY = utils_1.clamp(Math.floor(positionUtils_1.toWorldY(camera.y + camera.h) / constants_1.REGION_SIZE) + 1, 0, map.regionsY - 1);
    var minX = utils_1.clamp(Math.floor(positionUtils_1.toWorldX(camera.x) / constants_1.REGION_SIZE) - 1, 0, maxX);
    var minY = utils_1.clamp(Math.floor(positionUtils_1.toWorldY(camera.y) / constants_1.REGION_SIZE) - 1, 0, maxY);
    for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
            var region = worldMap_1.getRegion(map, x, y);
            if (camera_1.isRectVisible(camera, region.subscribeBounds)) {
                if (!isSubscribedToRegion(client, region)) {
                    timing_1.timingStart('subscribeToRegion()');
                    region.clients.push(client);
                    client.regions.push(region);
                    client.subscribes.push(encodeRegion(region, client));
                    timing_1.timingEnd();
                }
            }
        }
    }
    timing_1.timingEnd();
}
exports.subscribeToRegionsInRange = subscribeToRegionsInRange;
function unsubscribeFromOutOfRangeRegions(client) {
    timing_1.timingStart('unsubscribeFromOutOfRangeRegions()');
    var regions = client.regions;
    for (var i = regions.length - 1; i >= 0; i--) {
        var region = regions[i];
        if (!camera_1.isRectVisible(client.camera, region.unsubscribeBounds)) {
            if (utils_1.includes(region.entities, client.pony)) {
                DEVELOPMENT && logger_1.logger.warn("Trying to unsubscribe client from region they are in");
            }
            else {
                utils_1.removeItem(region.clients, client);
                regions.splice(i, 1);
                client.unsubscribes.push(region.x, region.y);
            }
        }
    }
    timing_1.timingEnd();
}
exports.unsubscribeFromOutOfRangeRegions = unsubscribeFromOutOfRangeRegions;
function unsubscribeFromAllRegions(client, silent) {
    for (var _i = 0, _a = client.regions; _i < _a.length; _i++) {
        var region = _a[_i];
        utils_1.removeItem(region.clients, client);
        if (!silent) {
            client.unsubscribes.push(region.x, region.y);
        }
    }
    client.regions = [];
}
exports.unsubscribeFromAllRegions = unsubscribeFromAllRegions;
function getExpectedRegion(_a, map) {
    var x = _a.x, y = _a.y, flags = _a.flags, region = _a.region;
    if (region !== undefined && (flags & 1 /* Movable */) !== 0 && utils_1.pointInRect(x, y, region.boundsWithBorder)) {
        return region;
    }
    else {
        var rx = utils_1.clamp(Math.floor(x / constants_1.REGION_SIZE), 0, map.regionsX - 1) | 0;
        var ry = utils_1.clamp(Math.floor(y / constants_1.REGION_SIZE), 0, map.regionsY - 1) | 0;
        return map.regions[(rx + ((ry * map.regionsX) | 0)) | 0];
    }
}
exports.getExpectedRegion = getExpectedRegion;
function updateRegion(entity, map) {
    var expectedRegion = getExpectedRegion(entity, map);
    if (expectedRegion !== entity.region) {
        transferToRegion(entity, expectedRegion, map);
    }
}
exports.updateRegion = updateRegion;
var moves = [];
function updateRegions(maps) {
    timing_1.timingStart('updateRegions()');
    moves.length = 0;
    // TODO: only update changed entities
    timing_1.timingStart('getExpectedRegion');
    for (var _i = 0, maps_1 = maps; _i < maps_1.length; _i++) {
        var map = maps_1[_i];
        for (var _a = 0, _b = map.regions; _a < _b.length; _a++) {
            var region = _b[_a];
            for (var _c = 0, _d = region.movables; _c < _d.length; _c++) {
                var entity = _d[_c];
                var expectedRegion = getExpectedRegion(entity, map);
                if (expectedRegion !== entity.region) {
                    moves.push({ entity: entity, region: expectedRegion, map: map });
                }
            }
        }
    }
    timing_1.timingEnd();
    timing_1.timingStart('transferToRegion');
    for (var _e = 0, moves_1 = moves; _e < moves_1.length; _e++) {
        var _f = moves_1[_e], entity = _f.entity, region = _f.region, map = _f.map;
        transferToRegion(entity, region, map);
    }
    timing_1.timingEnd();
    moves.length = 0;
    timing_1.timingEnd();
}
exports.updateRegions = updateRegions;
function commitRegionUpdates(regions) {
    timing_1.timingStart('commitRegionUpdates()');
    for (var _i = 0, regions_1 = regions; _i < regions_1.length; _i++) {
        var region = regions_1[_i];
        if (region.entityUpdates.length || region.entityRemoves.length || region.tileUpdates.length) {
            if (region.clients.length) {
                var data = encodeUpdate(region);
                for (var _a = 0, _b = region.clients; _a < _b.length; _a++) {
                    var client = _b[_a];
                    client.regionUpdates.push(data);
                }
            }
            serverRegion_1.resetRegionUpdates(region);
        }
    }
    timing_1.timingEnd();
}
exports.commitRegionUpdates = commitRegionUpdates;
function transferToRegion(entity, region, map) {
    var oldRegion = entity.region;
    if (oldRegion) {
        serverRegion_1.removeEntityFromRegion(oldRegion, entity, map);
        entityUtils_1.updateEntity(entity, true);
    }
    entity.region = region;
    serverRegion_1.addEntityToRegion(region, entity, map);
    if (!entityUtils_1.isEntityShadowed(entity)) {
        for (var _i = 0, _a = region.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            if (!oldRegion || !isSubscribedToRegion(client, oldRegion)) {
                entityUtils_1.pushAddEntityToClient(client, entity);
            }
        }
    }
}
exports.transferToRegion = transferToRegion;
function addToRegion(entity, region, map) {
    entity.region = region;
    serverRegion_1.addEntityToRegion(region, entity, map);
    if (entityUtils_1.isEntityShadowed(entity)) {
        entityUtils_1.pushAddEntityToClient(entity.client, entity);
    }
    else {
        for (var _i = 0, _a = region.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            entityUtils_1.pushAddEntityToClient(client, entity);
        }
    }
}
exports.addToRegion = addToRegion;
function removeFromRegion(entity, region, map) {
    var removed = serverRegion_1.removeEntityFromRegion(region, entity, map);
    serverRegion_1.pushRemoveEntityToRegion(region, entity);
    return removed;
}
exports.removeFromRegion = removeFromRegion;
function isSubscribedToRegion(client, region) {
    return utils_1.includes(client.regions, region);
}
exports.isSubscribedToRegion = isSubscribedToRegion;
function sparseRegionUpdate(map, region, options) {
    if (options.restoreTerrain) {
        serverRegion_1.tickTilesRestoration(map, region);
    }
}
exports.sparseRegionUpdate = sparseRegionUpdate;
// timing helpers
function writingTiming() {
    timing_1.timingStart('write');
}
function sendingTiming() {
    timing_1.timingEnd();
    timing_1.timingStart('send');
}
function doneTiming() {
    timing_1.timingEnd();
}
function noop() {
}
function setupTiming(client) {
    if (client.__internalHooks) {
        client.__internalHooks.writing = writingTiming;
        client.__internalHooks.sending = sendingTiming;
        client.__internalHooks.done = doneTiming;
    }
}
exports.setupTiming = setupTiming;
function clearTiming(client) {
    if (client.__internalHooks) {
        client.__internalHooks.writing = noop;
        client.__internalHooks.sending = noop;
        client.__internalHooks.done = noop;
    }
}
exports.clearTiming = clearTiming;
//# sourceMappingURL=regionUtils.js.map