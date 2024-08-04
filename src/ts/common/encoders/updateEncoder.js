"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRegionSimple = exports.encodeUpdateSimple = exports.writeRegion = exports.writeUpdate = exports.writeOneEntity = exports.writeOneUpdate = void 0;
var browser_1 = require("ag-sockets/dist/browser");
var binaryUtils_1 = require("../binaryUtils");
var entityUtils_1 = require("../../server/entityUtils");
var serverRegion_1 = require("../../server/serverRegion");
var updateDecoder_1 = require("./updateDecoder");
var playerUtils_1 = require("../../server/playerUtils");
var logger_1 = require("../../server/logger");
function getOptionsOrUndefined(entity) {
    return (entity.options !== undefined && Object.keys(entity.options).length > 0) ? entity.options : undefined;
}
function writeOneUpdate(writer, entity, flags, x, y, vx, vy, options, action, playerState) {
    if (DEVELOPMENT && flags === 0) {
        logger_1.logger.error("Writing empty update");
    }
    if ((flags & 1 /* Position */) !== 0) {
        flags |= 4 /* State */;
        if (vx || vy) {
            flags |= 2 /* Velocity */;
        }
    }
    if ((flags & 256 /* Name */) !== 0 && entity.nameBad === true) {
        flags |= 512 /* NameBad */;
    }
    browser_1.writeUint16(writer, flags);
    browser_1.writeUint32(writer, entity.id);
    if ((flags & 1 /* Position */) !== 0) {
        updateDecoder_1.writeCoordX(writer, x);
        updateDecoder_1.writeCoordY(writer, y);
    }
    if ((flags & 2 /* Velocity */) !== 0) {
        updateDecoder_1.writeVelocity(writer, vx);
        updateDecoder_1.writeVelocity(writer, vy);
    }
    if ((flags & 4 /* State */) !== 0) {
        browser_1.writeUint8(writer, entity.state);
    }
    if ((flags & 8 /* Expression */) !== 0) {
        browser_1.writeUint32(writer, entity.options.expr);
    }
    if ((flags & 16 /* Type */) !== 0) {
        browser_1.writeUint16(writer, entity.type);
    }
    if ((flags & 32 /* Options */) !== 0) {
        browser_1.writeObject(writer, options);
    }
    if ((flags & 64 /* Info */) !== 0) {
        browser_1.writeUint16(writer, entity.crc);
        browser_1.writeUint8Array(writer, entity.encryptedInfoSafe);
    }
    if ((flags & 128 /* Action */) !== 0) {
        browser_1.writeUint8(writer, action);
    }
    if ((flags & 256 /* Name */) !== 0) {
        browser_1.writeUint8Array(writer, entity.encodedName);
    }
    if ((flags & 1024 /* PlayerState */) !== 0) {
        browser_1.writeUint8(writer, playerState);
    }
}
exports.writeOneUpdate = writeOneUpdate;
function writeOneEntity(writer, entity, client) {
    var x = entity.x, y = entity.y, vx = entity.vx, vy = entity.vy;
    // TODO: const expression = !!entity.options && !!entity.options.expr; // instead of in options
    var options = getOptionsOrUndefined(entity);
    var playerState = playerUtils_1.getPlayerState(client, entity);
    var flags = 1 /* Position */ | 4 /* State */ | 16 /* Type */;
    if (entity.encryptedInfoSafe !== undefined) {
        flags |= 64 /* Info */;
    }
    if (entity.encodedName !== undefined) {
        flags |= 256 /* Name */;
    }
    if (playerState !== 0) {
        flags |= 1024 /* PlayerState */;
    }
    if (options !== undefined) {
        flags |= 32 /* Options */;
    }
    writeOneUpdate(writer, entity, flags, x, y, vx, vy, options, 0 /* None */, playerState);
}
exports.writeOneEntity = writeOneEntity;
function writeUpdate(writer, region) {
    var x = region.x, y = region.y, entityUpdates = region.entityUpdates, entityRemoves = region.entityRemoves, tileUpdates = region.tileUpdates;
    browser_1.writeUint16(writer, x);
    browser_1.writeUint16(writer, y);
    for (var _i = 0, entityUpdates_1 = entityUpdates; _i < entityUpdates_1.length; _i++) {
        var _a = entityUpdates_1[_i], entity = _a.entity, flags = _a.flags, x_1 = _a.x, y_1 = _a.y, vx = _a.vx, vy = _a.vy, options = _a.options, action = _a.action, playerState = _a.playerState;
        writeOneUpdate(writer, entity, flags, x_1, y_1, vx, vy, options, action, playerState);
    }
    browser_1.writeUint16(writer, 0); // end marker
    browser_1.writeLength(writer, entityRemoves.length);
    for (var _b = 0, entityRemoves_1 = entityRemoves; _b < entityRemoves_1.length; _b++) {
        var remove = entityRemoves_1[_b];
        browser_1.writeUint32(writer, remove);
    }
    browser_1.writeLength(writer, tileUpdates.length);
    for (var _c = 0, tileUpdates_1 = tileUpdates; _c < tileUpdates_1.length; _c++) {
        var _d = tileUpdates_1[_c], x_2 = _d.x, y_2 = _d.y, tile = _d.type;
        browser_1.writeUint8(writer, x_2);
        browser_1.writeUint8(writer, y_2);
        browser_1.writeUint8(writer, tile);
    }
    browser_1.writeUint8Array(writer, null); // tile data
}
exports.writeUpdate = writeUpdate;
function writeRegion(writer, region, client) {
    var x = region.x, y = region.y, entities = region.entities;
    browser_1.writeUint16(writer, x);
    browser_1.writeUint16(writer, y);
    for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
        var entity = entities_1[_i];
        if (!entityUtils_1.isEntityShadowed(entity) || entity === client.pony) {
            writeOneEntity(writer, entity, client);
        }
    }
    browser_1.writeUint16(writer, 0); // end marker
    browser_1.writeLength(writer, 0); // removes
    browser_1.writeLength(writer, 0); // tile updates
    browser_1.writeUint8Array(writer, serverRegion_1.getRegionTiles(region)); // tile data
}
exports.writeRegion = writeRegion;
// For testing
function encodeUpdateSimple(region) {
    return binaryUtils_1.writeBinary(function (writer) { return writeUpdate(writer, region); });
}
exports.encodeUpdateSimple = encodeUpdateSimple;
// For testing
function encodeRegionSimple(region, client) {
    return binaryUtils_1.writeBinary(function (writer) { return writeRegion(writer, region, client); });
}
exports.encodeRegionSimple = encodeRegionSimple;
//# sourceMappingURL=updateEncoder.js.map