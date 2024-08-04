"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMove = void 0;
var moment = require("moment");
var chalk_1 = require("chalk");
var movementUtils_1 = require("../common/movementUtils");
var entityUtils_1 = require("../common/entityUtils");
var camera_1 = require("../common/camera");
var logger_1 = require("./logger");
var utils_1 = require("../common/utils");
var playerUtils_1 = require("./playerUtils");
var positionUtils_1 = require("../common/positionUtils");
var constants_1 = require("../common/constants");
var entityUtils_2 = require("./entityUtils");
var collision_1 = require("../common/collision");
var teleportReportLimit = 10;
var maxLagLimitSeconds = 15;
var maxLagLimit = maxLagLimitSeconds * constants_1.SECOND;
var createMove = function (teleportCounter) {
    return function (client, now, a, b, c, d, e, settings) {
        if (client.loading || client.fixingPosition || client.isSwitchingMap)
            return;
        var connectionDuration = (now - client.connectedTime) >>> 0;
        var pony = client.pony;
        var _a = movementUtils_1.decodeMovement(a, b, c, d, e), x = _a.x, y = _a.y, dir = _a.dir, flags = _a.flags, time = _a.time, camera = _a.camera;
        var v = movementUtils_1.dirToVector(dir);
        var speed = movementUtils_1.flagsToSpeed(flags);
        if (checkOutsideMap(client, x, y))
            return;
        camera_1.setupCamera(client.camera, camera.x, camera.y, camera.w, camera.h, client.map);
        if (checkLagging(client, time, connectionDuration, settings))
            return;
        if (checkTeleporting(client, x, y, time, settings, teleportCounter))
            return;
        if (!collision_1.isStaticCollision(pony, client.map, true)) {
            client.safeX = pony.x;
            client.safeY = pony.y;
        }
        pony.x = x;
        pony.y = y;
        if (collision_1.isStaticCollision(pony, client.map)) {
            pony.x = client.safeX;
            pony.y = client.safeY;
            if (!collision_1.isStaticCollision(pony, client.map)) {
                if (settings.logFixingPosition) {
                    client.reporter.systemLog("Fixed colliding (" + x + " " + y + ") -> (" + pony.x + " " + pony.y + ")");
                }
                DEVELOPMENT && !TESTS && logger_1.logger.warn("Fixing position due to collision");
                entityUtils_2.fixPosition(pony, client.map, client.safeX, client.safeY, false);
            }
            else {
                pony.x = x;
                pony.y = y;
            }
        }
        pony.vx = v.x * speed;
        pony.vy = v.y * speed;
        var ponyState = pony.state || 0;
        var facingRight = utils_1.hasFlag(ponyState, 2 /* FacingRight */);
        var right = movementUtils_1.isMovingRight(pony.vx, facingRight);
        if (facingRight !== right) {
            ponyState = utils_1.setFlag(ponyState, 2 /* FacingRight */, right);
            ponyState = utils_1.setFlag(ponyState, 4 /* HeadTurned */, false);
        }
        if ((pony.vx || pony.vy) && (entityUtils_1.isSittingState(ponyState) || entityUtils_1.isLyingState(ponyState))) {
            ponyState = entityUtils_1.setPonyState(ponyState, 0 /* PonyStanding */);
        }
        pony.state = ponyState;
        entityUtils_2.updateEntity(pony, false);
        if (pony.exprCancellable) {
            playerUtils_1.setEntityExpression(pony, undefined);
        }
        pony.timestamp = now / 1000;
        client.lastX = pony.x;
        client.lastY = pony.y;
        client.lastTime = time;
        client.lastVX = pony.vx;
        client.lastVY = pony.vy;
    };
};
exports.createMove = createMove;
function checkOutsideMap(client, x, y) {
    if (collision_1.isOutsideMap(x, y, client.map)) {
        var message = "map: [" + (client.map.id || 'main') + "] coords: [" + x.toFixed(2) + ", " + y.toFixed(2) + "]";
        if (!client.shadowed) {
            client.reporter.warn("Outside map", message);
        }
        playerUtils_1.kickClient(client, "outside " + message);
        return true;
    }
    return false;
}
function checkLagging(client, time, connectionTime, settings) {
    var dt = time - connectionTime;
    var lagging = (dt > maxLagLimit) || (dt < -maxLagLimit);
    if (lagging) {
        if (settings.logLagging) {
            // logger.warn(`Time delta > ${maxLagLimitSeconds}s (${dt}) account: ${client.account.name} [${client.accountId}]`);
            client.reporter.systemLog("Time delta > " + maxLagLimitSeconds + "s (" + dt + ")");
            client.logDisconnect = true;
        }
        if (settings.kickLagging) {
            client.reporter.systemLog("Lagging (dt: " + dt + " time: " + time + " connectionTime: " + connectionTime + ")");
            playerUtils_1.kickClient(client, 'lagging');
            return true;
        }
    }
    return false;
}
function checkTeleporting(client, x, y, time, settings, counter) {
    if (!client.lastTime)
        return false;
    var pony = client.pony;
    var borderX = 0.5;
    var borderY = 0.5;
    var delta = ((time - client.lastTime) / 1000) * 1;
    var afterX = positionUtils_1.roundPositionX(client.lastX + client.lastVX * delta);
    var afterY = positionUtils_1.roundPositionY(client.lastY + client.lastVY * delta);
    var afterMinX = client.lastVX === 0 ? afterX - Math.abs(client.lastVY) : afterX;
    var afterMaxX = client.lastVX === 0 ? afterX + Math.abs(client.lastVY) : afterX;
    var afterMinY = client.lastVY === 0 ? afterY - Math.abs(client.lastVX) : afterY;
    var afterMaxY = client.lastVY === 0 ? afterY + Math.abs(client.lastVX) : afterY;
    var minX = Math.floor((Math.min(client.lastX, afterMinX) - borderX) * constants_1.tileWidth) / constants_1.tileWidth;
    var maxX = Math.ceil((Math.max(client.lastX, afterMaxX) + borderX) * constants_1.tileWidth) / constants_1.tileWidth;
    var minY = Math.floor((Math.min(client.lastY, afterMinY) - borderY) * constants_1.tileHeight) / constants_1.tileHeight;
    var maxY = Math.ceil((Math.max(client.lastY, afterMaxY) + borderY) * constants_1.tileHeight) / constants_1.tileHeight;
    var outX = x < minX || x > maxX;
    var outY = y < minY || y > maxY;
    if (outX || outY) {
        if (settings.logTeleporting) {
            var colX = outX ? chalk_1.default.red : chalk_1.default.reset;
            var colY = outY ? chalk_1.default.red : chalk_1.default.reset;
            logger_1.logger.log("[" + chalk_1.default.gray(moment().format('MMM DD HH:mm:ss')) + "] [" + chalk_1.default.yellow('teleport') + "] " +
                ("[" + chalk_1.default.gray(client.accountId) + "] (" + client.account.name + ")\n") +
                ("\tdx: " + client.lastX.toFixed(5) + " -> " + colX(x.toFixed(5)) + " [" + minX.toFixed(5) + "-" + maxX.toFixed(5) + "]\n") +
                ("\tdy: " + client.lastY.toFixed(5) + " -> " + colY(y.toFixed(5)) + " [" + minY.toFixed(5) + "-" + maxY.toFixed(5) + "]\n") +
                ("\tdt: " + delta.toFixed(5)));
        }
        if (settings.reportTeleporting) {
            var count = counter.add(client.accountId).count;
            if (count > teleportReportLimit) {
                counter.remove(client.accountId);
                client.reporter.warn("Teleporting (x" + teleportReportLimit + ")");
            }
        }
        if (settings.kickTeleporting) {
            playerUtils_1.kickClient(client, 'teleporting');
            return true;
        }
        if (settings.fixTeleporting) {
            pony.vx = 0;
            pony.vy = 0;
            client.reporter.systemLog("Fixed teleporting (" + x + " " + y + ") -> (" + pony.x + " " + pony.y + ")");
            entityUtils_2.fixPosition(client.pony, client.map, pony.x, pony.y, false);
            return true;
        }
    }
    var dx = Math.abs(x - pony.x);
    var dy = Math.abs(y - pony.y);
    if (dx > 8 || dy > 8) {
        if (settings.fixTeleporting) {
            pony.vx = 0;
            pony.vy = 0;
            client.reporter.systemLog("Fixed teleporting (too far) (" + x + " " + y + ") -> (" + pony.x + " " + pony.y + ")");
            entityUtils_2.fixPosition(client.pony, client.map, pony.x, pony.y, false);
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=move.js.map