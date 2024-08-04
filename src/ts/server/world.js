"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findClientsAroundAccountId = exports.findClientByCharacterId = exports.findClientByAccountId = exports.findAllOnlineFriends = exports.goToMap = exports.refreshMap = exports.World = void 0;
var ag_sockets_1 = require("ag-sockets");
var lodash_1 = require("lodash");
var interfaces_1 = require("../common/interfaces");
var utils_1 = require("../common/utils");
var timeUtils_1 = require("../common/timeUtils");
var constants_1 = require("../common/constants");
var serverMap_1 = require("./serverMap");
var accountUtils_1 = require("./accountUtils");
var entityUtils_1 = require("./entityUtils");
var adminUtils_1 = require("../common/adminUtils");
var playerUtils_1 = require("./playerUtils");
var regionUtils_1 = require("./regionUtils");
var positionUtils_1 = require("../common/positionUtils");
var logger_1 = require("./logger");
var camera_1 = require("../common/camera");
var timing_1 = require("./timing");
var worldMap_1 = require("../common/worldMap");
var entities_1 = require("../common/entities");
var friends_1 = require("./services/friends");
// import { Pool, createPool } from './pool';
var collision_1 = require("../common/collision");
var region_1 = require("../common/region");
var tileUtils_1 = require("../client/tileUtils");
var serverRegion_1 = require("./serverRegion");
var islandMap_1 = require("./maps/islandMap");
var houseMap_1 = require("./maps/houseMap");
var mainMap_1 = require("./maps/mainMap");
var worldPerfStats_1 = require("./worldPerfStats");
var MAP_SOFT_LIMIT = 10000;
var World = /** @class */ (function () {
    function World(server, partyService, friendsService, hidingService, notifications, getSettings, liveSettings, socketStats) {
        // this.mapPools.set('island', createPool(10, () => createIslandMap(this, true), resetIslandMap));
        // this.mapPools.set('house', createPool(10, () => createHouseMap(this, true), resetHouseMap));
        var _this = this;
        this.server = server;
        this.partyService = partyService;
        this.friendsService = friendsService;
        this.hidingService = hidingService;
        this.notifications = notifications;
        this.getSettings = getSettings;
        this.liveSettings = liveSettings;
        this.socketStats = socketStats;
        this.season = 1 /* Summer */;
        this.holiday = 0 /* None */;
        this.maps = [];
        this.controllers = [];
        this.options = {
            restoreTerrain: !DEVELOPMENT,
        };
        this.clients = [];
        this.clientsByAccount = new Map();
        this.joinQueue = [];
        this.mapSwitchQueue = [];
        this.now = 0;
        this.start = 0;
        // mapPools = new Map<string, Pool<ServerMap>>();
        this.maxId = 0 >>> 0;
        this.offlineClients = [];
        this.baseTime = 0;
        this.entityById = new Map();
        this.reservedIds = new Map();
        this.reservedIdsByKey = new Map();
        // clients
        this.lastCleanup = 0;
        partyService.partyChanged.subscribe(function (client) {
            if (client.isConnected && client.map.usage === 1 /* Party */) {
                if (client.party && client.party.leader === client && client.map.instance === client.accountId &&
                    !_this.maps.some(function (m) { return m.id === client.map.id && m.instance === client.party.id; })) {
                    client.map.instance = client.party.id;
                }
                else {
                    refreshMap(_this, client);
                }
            }
        });
    }
    Object.defineProperty(World.prototype, "featureFlags", {
        get: function () {
            return this.server.flags;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(World.prototype, "time", {
        // entities
        get: function () {
            return this.baseTime + Date.now();
        },
        enumerable: false,
        configurable: true
    });
    World.prototype.setTime = function (hour) {
        var newBaseTime = hour * timeUtils_1.HOUR_LENGTH - (Date.now() % timeUtils_1.DAY_LENGTH);
        while (newBaseTime < 0) {
            newBaseTime += timeUtils_1.DAY_LENGTH;
        }
        this.baseTime = newBaseTime;
        this.updateWorldState();
    };
    World.prototype.setTile = function (map, x, y, type) {
        if (!BETA && map.tilesLocked)
            return;
        if (x >= 0 && y >= 0 && x < map.width && y < map.height && !serverMap_1.isTileLocked(map, x, y) && type !== worldMap_1.getTile(map, x, y)) {
            serverMap_1.setTile(map, x, y, type);
        }
    };
    World.prototype.toggleWall = function (map, x, y, type) {
        for (var _i = 0, _a = map.controllers; _i < _a.length; _i++) {
            var controller = _a[_i];
            if (controller.toggleWall) {
                controller.toggleWall(x, y, type);
            }
        }
    };
    World.prototype.removeWalls = function (map) {
        for (var _i = 0, _a = map.controllers; _i < _a.length; _i++) {
            var controller = _a[_i];
            if (controller.removeWalls) {
                controller.removeWalls();
            }
        }
    };
    World.prototype.getState = function () {
        return {
            time: this.time,
            season: this.season,
            holiday: this.holiday,
            flags: this.getSettings().filterSwears ? 1 /* Safe */ : 0 /* None */,
            featureFlags: this.featureFlags,
        };
    };
    World.prototype.setSeason = function (season, holiday) {
        this.season = season;
        this.holiday = holiday;
        this.updateWorldState();
        mainMap_1.updateMainMapSeason(this, this.getMainMap(), season, holiday);
    };
    World.prototype.updateWorldState = function () {
        var state = this.getState();
        for (var _i = 0, _a = this.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            client.worldState(state, false);
        }
    };
    World.prototype.getEntityById = function (id) {
        return this.entityById.get(id);
    };
    World.prototype.getNewEntityId = function () {
        do {
            this.maxId = (this.maxId + 1) >>> 0;
        } while (this.maxId === 0 || this.entityById.has(this.maxId) || this.reservedIds.has(this.maxId));
        return this.maxId;
    };
    World.prototype.addEntity = function (entity, map) {
        if (DEVELOPMENT) {
            if (entity.update) {
                console.error('Entity update() method is only for client-side use');
            }
            if (entity.id && this.entityById.has(entity.id)) {
                console.error("Entity already added to the world " + entities_1.getEntityTypeName(entity.type) + " [" + entity.id + "]");
            }
        }
        entity.id = entity.id || this.getNewEntityId();
        entity.timestamp = this.now / 1000;
        this.entityById.set(entity.id, entity);
        positionUtils_1.roundPosition(entity);
        var region = worldMap_1.getRegionGlobal(map, entity.x, entity.y);
        regionUtils_1.addToRegion(entity, region, map);
        return entity;
    };
    World.prototype.removeEntity = function (entity, map) {
        var removed = false;
        if (entity.region) {
            removed = regionUtils_1.removeFromRegion(entity, entity.region, map);
        }
        this.entityById.delete(entity.id);
        return removed;
    };
    World.prototype.removeEntityFromSomeMap = function (entity) {
        var map = this.maps.find(function (m) { return m.regions.some(function (r) { return utils_1.includes(r.entities, entity); }); });
        if (map) {
            this.removeEntity(entity, map);
        }
        else {
            DEVELOPMENT && logger_1.logger.error("Missing map for entity");
        }
    };
    // map
    World.prototype.getMainMap = function () {
        return this.maps[0];
    };
    World.prototype.switchToMap = function (client, map, x, y) {
        if (client.map === map) {
            DEVELOPMENT && logger_1.logger.error("Switching to the same map");
            return;
        }
        if (this.mapSwitchQueue.some(function (x) { return x.client === client; })) {
            DEVELOPMENT && logger_1.logger.error("Already in map switch queue");
            return;
        }
        this.mapSwitchQueue.push({ client: client, map: map, x: x, y: y });
        client.isSwitchingMap = true;
        client.pony.vx = 0;
        client.pony.vy = 0;
        entityUtils_1.updateEntity(client.pony, false);
        client.mapSwitching();
    };
    World.prototype.actualSwitchToMap = function (client, map, x, y) {
        regionUtils_1.unsubscribeFromAllRegions(client, false);
        if (client.pony.region) {
            regionUtils_1.removeFromRegion(client.pony, client.pony.region, client.map);
        }
        x = utils_1.clamp(x, 0, map.width);
        y = utils_1.clamp(y, 0, map.height);
        playerUtils_1.resetClientUpdates(client);
        client.mapState(serverMap_1.getMapInfo(map), map.state);
        client.map = map;
        client.pony.x = x;
        client.pony.y = y;
        client.safeX = x;
        client.safeY = y;
        client.lastTime = 0;
        client.lastMapSwitch = Date.now();
        client.loading = true;
        client.lastCameraX = 0;
        client.lastCameraY = 0;
        client.lastCameraW = 0;
        client.lastCameraH = 0;
        client.isSwitchingMap = false;
        regionUtils_1.addToRegion(client.pony, worldMap_1.getRegionGlobal(map, x, y), map);
        entityUtils_1.fixPosition(client.pony, map, x, y, true);
        client.reporter.systemLog("Switched map to [" + (client.map.id || 'main') + "]");
    };
    // main
    World.prototype.initialize = function (now) {
        this.start = now;
        this.now = now;
        var nowSeconds = now / 1000;
        for (var _i = 0, _a = this.controllers; _i < _a.length; _i++) {
            var controller = _a[_i];
            controller.initialize(nowSeconds);
        }
        for (var _b = 0, _c = this.maps; _b < _c.length; _b++) {
            var map = _c[_b];
            for (var _d = 0, _e = map.controllers; _d < _e.length; _d++) {
                var controller = _e[_d];
                controller.initialize(nowSeconds);
            }
        }
    };
    World.prototype.update = function (delta, now) {
        var statsStart = interfaces_1.counterNow();
        var movingEntities = 0;
        var regionsCount = 0;
        var mapsCount = 0;
        var controllersCount = 0;
        var started = Date.now();
        timing_1.timingUpdate();
        timing_1.timingStart('world.update()');
        regionUtils_1.resetEncodeUpdate();
        this.now = now;
        var nowSeconds = now / 1000;
        var deltaSeconds = delta / 1000;
        timing_1.timingStart('update tiles and colliders');
        for (var _i = 0, _a = this.maps; _i < _a.length; _i++) {
            var map = _a[_i];
            if (!map.dontUpdateTilesAndColliders) {
                for (var _b = 0, _c = map.regions; _b < _c.length; _b++) {
                    var region = _c[_b];
                    if (region.tilesDirty) {
                        tileUtils_1.updateTileIndices(region, map);
                    }
                    if (region.colliderDirty) {
                        region_1.generateRegionCollider(region, map);
                    }
                }
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('update positions');
        for (var _d = 0, _e = this.maps; _d < _e.length; _d++) {
            var map = _e[_d];
            ++mapsCount;
            for (var _f = 0, _g = map.regions; _f < _g.length; _f++) {
                var region = _g[_f];
                ++regionsCount;
                // TODO: update only moving entities, separate list of movingEntities
                for (var _h = 0, _j = region.movables; _h < _j.length; _h++) {
                    var entity = _j[_h];
                    // TODO: make sure timestamp is initialized if entity is moving
                    var delta_1 = nowSeconds - entity.timestamp;
                    if (delta_1 > 0) {
                        if (entity.vx !== 0 || entity.vy !== 0) {
                            ++movingEntities;
                            collision_1.updatePosition(entity, delta_1, map);
                        }
                        entity.timestamp = nowSeconds;
                    }
                }
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('updateCamera + updateSubscriptions');
        for (var _k = 0, _l = this.clients; _k < _l.length; _k++) {
            var client = _l[_k];
            if (updateClientCamera(client)) {
                regionUtils_1.unsubscribeFromOutOfRangeRegions(client);
                regionUtils_1.subscribeToRegionsInRange(client);
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('update controllers');
        for (var _m = 0, _o = this.controllers; _m < _o.length; _m++) {
            var controller = _o[_m];
            controller.update(deltaSeconds, nowSeconds);
        }
        for (var _p = 0, _q = this.maps; _p < _q.length; _p++) {
            var map = _q[_p];
            for (var _r = 0, _s = map.controllers; _r < _s.length; _r++) {
                var controller = _s[_r];
                ++controllersCount;
                controller.update(deltaSeconds, nowSeconds);
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('actualSwitchToMap');
        for (var i = 0; i < constants_1.MAP_SWITCHES_PER_UPDATE && this.mapSwitchQueue.length; i++) {
            var _t = this.mapSwitchQueue.shift(), client = _t.client, map = _t.map, x = _t.x, y = _t.y;
            this.actualSwitchToMap(client, map, x, y);
        }
        timing_1.timingEnd();
        timing_1.timingStart('updateRegions');
        regionUtils_1.updateRegions(this.maps); // NOTE: creates transfers
        timing_1.timingEnd();
        timing_1.timingStart('timeoutEntityExpression + inTheAirDelay');
        for (var _u = 0, _v = this.clients; _u < _v.length; _u++) {
            var client = _v[_u];
            // timeout expressions
            if (client.pony.exprTimeout && client.pony.exprTimeout < now) {
                playerUtils_1.setEntityExpression(client.pony, undefined); // NOTE: creates updates
            }
            // count down in-the-air delay
            if (client.pony.inTheAirDelay !== undefined && client.pony.inTheAirDelay > 0) {
                client.pony.inTheAirDelay -= deltaSeconds;
            }
        }
        timing_1.timingEnd();
        // const { totalUpdates, reusedUpdates } = this.updatesStats();
        timing_1.timingStart("commitRegionUpdates"); // [${totalUpdates} / ${reusedUpdates}]`);
        for (var _w = 0, _x = this.maps; _w < _x.length; _w++) {
            var map = _x[_w];
            regionUtils_1.commitRegionUpdates(map.regions);
        }
        timing_1.timingEnd();
        var clientsWithAdds = 0;
        var clientsWithUpdates = 0;
        var clientsWithSays = 0;
        var totalSays = 0;
        timing_1.timingStart("send updates");
        for (var _y = 0, _z = this.clients; _y < _z.length; _y++) {
            var client = _z[_y];
            var updateQueue = client.updateQueue, regionUpdates = client.regionUpdates, saysQueue = client.saysQueue, unsubscribes = client.unsubscribes, subscribes = client.subscribes;
            var updateBuffer = updateQueue.offset ? ag_sockets_1.getWriterBuffer(updateQueue) : null;
            var total = updateQueue.offset + regionUpdates.length + saysQueue.length + unsubscribes.length + subscribes.length;
            if (total !== 0) {
                if (updateQueue.offset > 0)
                    clientsWithAdds++;
                if (regionUpdates.length > 0)
                    clientsWithUpdates++;
                if (saysQueue.length > 0)
                    clientsWithSays++;
                totalSays += saysQueue.length;
                regionUtils_1.setupTiming(client);
                client.update(unsubscribes, subscribes, updateBuffer, regionUpdates, saysQueue);
                regionUtils_1.clearTiming(client);
                playerUtils_1.resetClientUpdates(client);
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('joinQueuedClients');
        if (Date.now() < (started + (1000 / constants_1.SERVER_FPS))) {
            for (var i = 0; i < constants_1.JOINS_PER_UPDATE && this.joinQueue.length > 0; i++) {
                this.joinClientToWorld(this.joinQueue.shift()); // NOTE: creates adds
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart("cleanupOfflineClients");
        this.cleanupOfflineClients();
        timing_1.timingEnd();
        timing_1.timingEnd();
        var _0 = this.socketStats.stats(), sent = _0.sent, received = _0.received, sentPackets = _0.sentPackets, receivedPackets = _0.receivedPackets;
        worldPerfStats_1.updateWorldPerfStats(statsStart, this.clients.length, movingEntities, regionsCount, mapsCount, this.joinQueue.length, controllersCount, clientsWithAdds, clientsWithUpdates, clientsWithSays, totalSays, sent, received, sentPackets, receivedPackets);
    };
    World.prototype.sparseUpdate = function (now) {
        timing_1.timingStart('world.sparseUpdate()');
        timing_1.timingStart('sparse update controllers');
        for (var _i = 0, _a = this.controllers; _i < _a.length; _i++) {
            var controller = _a[_i];
            if (controller.sparseUpdate !== undefined) {
                controller.sparseUpdate();
            }
        }
        for (var _b = 0, _c = this.maps; _b < _c.length; _b++) {
            var map = _c[_b];
            for (var _d = 0, _e = map.controllers; _d < _e.length; _d++) {
                var controller = _e[_d];
                if (controller.sparseUpdate !== undefined) {
                    controller.sparseUpdate();
                }
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('sparseRegionUpdate');
        for (var _f = 0, _g = this.maps; _f < _g.length; _f++) {
            var map = _g[_f];
            for (var _h = 0, _j = map.regions; _h < _j.length; _h++) {
                var region = _j[_h];
                regionUtils_1.sparseRegionUpdate(map, region, this.options);
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('kick afk clients');
        for (var _k = 0, _l = this.clients; _k < _l.length; _k++) {
            var client = _l[_k];
            if ((now - client.lastPacket) > constants_1.AFK_TIMEOUT) {
                this.kick(client, 'afk');
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('send queue status (join)');
        for (var i = 0; i < this.joinQueue.length; i++) {
            this.joinQueue[i].queue(i + 1);
        }
        timing_1.timingEnd();
        timing_1.timingStart('send queue status (map)');
        for (var i = 0; i < this.mapSwitchQueue.length; i++) {
            this.mapSwitchQueue[i].client.queue(i + 1);
        }
        timing_1.timingEnd();
        timing_1.timingStart('cleanup unused maps');
        var discardTimeout = this.maps.length > MAP_SOFT_LIMIT ? 5 * constants_1.MINUTE : constants_1.MAP_DISCARD_TIMEOUT;
        var mapDiscardThreshold = now - discardTimeout;
        var _loop_1 = function (map) {
            if (map.instance && (serverMap_1.hasAnyClients(map) || this_1.mapSwitchQueue.some(function (q) { return q.map === map; }))) {
                map.lastUsed = now;
            }
        };
        var this_1 = this;
        for (var _m = 0, _o = this.maps; _m < _o.length; _m++) {
            var map = _o[_m];
            _loop_1(map);
        }
        for (var i = this.maps.length - 1; i > 0; i--) {
            var map = this.maps[i];
            if (map.instance && map.lastUsed < mapDiscardThreshold) {
                this.maps.splice(i, 1);
                // const pool = this.mapPools.get(map.id);
                // if (pool && pool.dispose(map)) {
                // 	for (const region of map.regions) {
                // 		resetRegionUpdates(region);
                // 	}
                // } else {
                for (var _p = 0, _q = map.regions; _p < _q.length; _p++) {
                    var region = _q[_p];
                    for (var _r = 0, _s = region.entities; _r < _s.length; _r++) {
                        var entity = _s[_r];
                        this.entityById.delete(entity.id);
                    }
                }
                // }
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('cleanup reserved ids');
        var threshold = Date.now() - 5 * constants_1.MINUTE;
        for (var _t = 0, _u = Array.from(this.reservedIdsByKey.keys()); _t < _u.length; _t++) { // TODO: avoid doing this to save gc
            var key = _u[_t];
            var _v = this.reservedIdsByKey.get(key), id = _v.id, time = _v.time;
            if (time < threshold) {
                this.reservedIdsByKey.delete(key);
                this.reservedIds.delete(id);
            }
        }
        timing_1.timingEnd();
        timing_1.timingStart('cleanup parties');
        this.partyService.cleanupParties();
        timing_1.timingEnd();
        timing_1.timingEnd();
    };
    World.prototype.updatesStats = function () {
        timing_1.timingStart('updatesStats()');
        var totalUpdates = 0, reusedUpdates = 0;
        for (var _i = 0, _a = this.maps; _i < _a.length; _i++) {
            var map = _a[_i];
            for (var _b = 0, _c = map.regions; _b < _c.length; _b++) {
                var region = _c[_b];
                totalUpdates += region.entityUpdates.length;
                reusedUpdates += region.reusedUpdates;
            }
        }
        timing_1.timingEnd();
        return { totalUpdates: totalUpdates, reusedUpdates: reusedUpdates };
    };
    World.prototype.cleanupOfflineClients = function () {
        var now = Date.now();
        if ((now - this.lastCleanup) > constants_1.REMOVE_INTERVAL) {
            this.lastCleanup = now;
            var removeFrom_1 = now - constants_1.REMOVE_TIMEOUT;
            lodash_1.remove(this.offlineClients, function (c) { return c.offline && !c.party && c.offlineAt && c.offlineAt.getTime() < removeFrom_1; });
        }
    };
    World.prototype.joinClientToQueue = function (client) {
        if (this.liveSettings.shutdown) {
            client.leaveReason = 'shutdown';
            client.disconnect(false, true);
            return;
        }
        var tokenId = client.tokenId;
        function findClientsToKick(clients) {
            return clients.filter(function (c) { return c.tokenId === tokenId; });
        }
        var clientsToKick = __spreadArray(__spreadArray([], findClientsToKick(this.clients)), findClientsToKick(this.joinQueue));
        for (var _i = 0, clientsToKick_1 = clientsToKick; _i < clientsToKick_1.length; _i++) {
            var client_1 = clientsToKick_1[_i];
            var reason = client_1.tokenId === tokenId ? 'kicked [joining again]' : 'kicked [alone on ip]';
            this.kick(client_1, reason, 0 /* None */, true);
        }
        // TODO: wait for all clients to be kicked before adding to the queue
        //       another queue before joinQueue
        this.joinQueue.push(client);
    };
    World.prototype.joinClientToWorld = function (client) {
        timing_1.timingStart('joinClientToWorld()');
        var key = client.accountId + ":" + client.characterId;
        var reserved = this.reservedIdsByKey.get(key);
        if (reserved) {
            client.pony.id = reserved.id;
            this.reservedIdsByKey.delete(client.accountId);
            this.reservedIds.delete(reserved.id);
        }
        else {
            client.pony.id = this.getNewEntityId();
        }
        client.myEntity(client.pony.id, client.characterName, client.character.info, client.characterId, client.pony.crc || 0);
        this.clients.push(client);
        this.clientsByAccount.set(client.accountId, client);
        this.partyService.clientConnected(client);
        this.hidingService.connected(client);
        var map = findOrCreateMapForClient(this, client.characterState.map || '', client);
        if (!map) {
            map = this.getMainMap();
            var _a = utils_1.randomPoint(map.spawnArea), x = _a.x, y = _a.y;
            client.pony.x = x;
            client.pony.y = y;
        }
        if (collision_1.isStaticCollision(client.pony, map)) {
            if (!collision_1.fixCollision(client.pony, map)) {
                var _b = utils_1.randomPoint(map.spawnArea), x = _b.x, y = _b.y;
                client.pony.x = x;
                client.pony.y = y;
            }
        }
        client.pony.x = positionUtils_1.roundPositionXMidPixel(client.pony.x);
        client.pony.y = positionUtils_1.roundPositionYMidPixel(client.pony.y);
        client.map = map;
        camera_1.centerCameraOn(client.camera, client.pony);
        client.worldState(this.getState(), true);
        client.mapState(serverMap_1.getMapInfo(client.map), client.map.state);
        if (BETA) {
            timing_1.timingStart('minimap');
            client.mapTest(client.map.width, client.map.height, serverMap_1.createMinimap(this, client.map));
            timing_1.timingEnd();
        }
        camera_1.updateCamera(client.camera, client.pony, map);
        this.addEntity(client.pony, client.map);
        var visibleOnlineFriends = [];
        for (var _i = 0, _c = this.clients; _i < _c.length; _i++) {
            var c = _c[_i];
            if (c.selected && c.selected.client && c.selected.client.accountId === client.accountId) {
                c.updateSelection(c.selected.id, client.pony.id);
            }
            if (client.friends.has(c.accountId)) {
                if (!c.accountSettings.hidden && !c.shadowed) {
                    visibleOnlineFriends.push(c);
                }
                if (!client.accountSettings.hidden) {
                    c.updateFriends([friends_1.toFriendOnline(client)], false);
                }
                if (!c.friends.has(client.accountId)) {
                    playerUtils_1.reloadFriends(c).catch(function (e) { return logger_1.logger.error(e); });
                }
            }
            else if (c.friends.has(client.accountId)) {
                playerUtils_1.reloadFriends(c).catch(function (e) { return logger_1.logger.error(e); });
            }
        }
        if (visibleOnlineFriends.length) {
            client.updateFriends(visibleOnlineFriends.map(friends_1.toFriendOnline), false);
        }
        if (this.liveSettings.updating) {
            this.notifications.addNotification(client, updateNotification());
        }
        // TEMP: duplicate pony bug
        if (client.map.instance) {
            for (var _d = 0, _e = client.map.regions; _d < _e.length; _d++) {
                var region = _e[_d];
                for (var _f = 0, _g = region.entities; _f < _g.length; _f++) {
                    var entity = _g[_f];
                    if (entity.client !== undefined && entity !== client.pony && entity.client.accountId === client.accountId) {
                        var sameClients = this.clients.filter(function (c) { return c.accountId === client.accountId; }).length;
                        client.reporter.systemLog("Client pony already on map " +
                            ("(old: " + entity.id + ", new: " + client.pony.id + ", sameClients: " + sameClients + ")"));
                    }
                }
            }
        }
        timing_1.timingEnd();
    };
    World.prototype.getClientByEntityId = function (entityId) {
        if (entityId === 0) {
            return undefined;
        }
        else {
            var byPonyId = function (c) { return c.pony.id === entityId; };
            return this.clients.find(byPonyId) || this.offlineClients.find(byPonyId);
        }
    };
    World.prototype.removeEntityFromAnyMap = function (entity) {
        for (var _i = 0, _a = this.maps; _i < _a.length; _i++) {
            var map = _a[_i];
            for (var _b = 0, _c = map.regions; _b < _c.length; _b++) {
                var region = _c[_b];
                var index = region.entities.indexOf(entity);
                if (index !== -1) {
                    serverRegion_1.removeEntityFromRegion(region, entity, map);
                    return map;
                }
            }
        }
        return undefined;
    };
    World.prototype.leaveClient = function (client) {
        var friends = findAllOnlineFriends(this, client);
        if (!client.accountSettings.hidden) {
            for (var _i = 0, friends_2 = friends; _i < friends_2.length; _i++) {
                var friend = friends_2[_i];
                friend.updateFriends([friends_1.toFriendOffline(client)], false);
            }
        }
        this.reservedIds.set(client.pony.id, client.accountId);
        this.reservedIdsByKey.set(client.accountId + ":" + client.characterId, { id: client.pony.id, time: Date.now() });
        if (!this.removeEntity(client.pony, client.map)) {
            var map = this.removeEntityFromAnyMap(client.pony);
            client.reporter.systemLog("Removing from any map (" +
                ("expected: " + (client.map && client.map.id) + " [" + (client.map && client.map.instance) + "], ") +
                ("actual: " + (map && map.id) + " [" + (map && map.instance) + "])"));
        }
        regionUtils_1.unsubscribeFromAllRegions(client, true);
        utils_1.removeItem(this.joinQueue, client);
        utils_1.removeItem(this.clients, client);
        this.clientsByAccount.delete(client.accountId);
        this.offlineClients.push(client);
        var index = this.mapSwitchQueue.findIndex(function (x) { return x.client === client; });
        if (index !== -1) {
            this.mapSwitchQueue.splice(index, 1);
        }
    };
    World.prototype.notifyHidden = function (by, who) {
        var byClient = findClientByAccountId(this, by);
        var whoClient = findClientByAccountId(this, who);
        if (byClient && whoClient) {
            playerUtils_1.updateEntityPlayerState(byClient, whoClient.pony);
            playerUtils_1.updateEntityPlayerState(whoClient, byClient.pony);
        }
    };
    World.prototype.resetToSpawn = function (client) {
        Object.assign(client.pony, utils_1.randomPoint(client.map.spawnArea));
    };
    World.prototype.kick = function (client, leaveReason, reason, force) {
        if (leaveReason === void 0) { leaveReason = 'kicked'; }
        if (reason === void 0) { reason = 0 /* None */; }
        if (force === void 0) { force = false; }
        if (client) {
            utils_1.removeItem(this.joinQueue, client);
            this.notifications.rejectAll(client);
            this.leaveClient(client);
            client.leaveReason = leaveReason;
            client.left(reason);
            if (force) {
                client.disconnect(true);
            }
            else {
                setTimeout(function () {
                    if (client.isConnected) {
                        client.disconnect(true);
                    }
                }, 200);
            }
        }
        return !!client;
    };
    World.prototype.kickAll = function () {
        var _this = this;
        this.clients.slice().forEach(function (c) { return _this.kick(c, 'kickAll'); });
        this.joinQueue.slice().forEach(function (c) { return c.disconnect(); });
        this.joinQueue = [];
    };
    World.prototype.kickByAccount = function (accountId) {
        return this.kick(findClientByAccountId(this, accountId), 'kickByAccount');
    };
    World.prototype.kickByCharacter = function (characterId) {
        return this.kick(findClientByCharacterId(this, characterId), 'kickByCharacter');
    };
    World.prototype.accountUpdated = function (account) {
        var accountId = account._id.toString();
        var client = findClientByAccountId(this, accountId);
        if (client) {
            this.updateClientAccount(client, account);
            for (var _i = 0, _a = this.clients; _i < _a.length; _i++) {
                var c = _a[_i];
                if (c.isMod && c.selected === client.pony) {
                    entityUtils_1.pushUpdateEntityToClient(c, { entity: client.pony, flags: 32 /* Options */, options: { modInfo: accountUtils_1.getModInfo(client) } });
                }
            }
        }
    };
    World.prototype.updateClientAccount = function (client, newAccount) {
        var oldAccount = client.account;
        client.account = newAccount;
        if (oldAccount.ban !== newAccount.ban && adminUtils_1.isBanned(newAccount)) {
            sendAcl(client);
            this.kick(client, 'kick (ban)');
            return;
        }
        if (oldAccount.shadow !== newAccount.shadow) {
            if (adminUtils_1.isShadowed(newAccount)) {
                this.shadow(client);
            }
            else if (adminUtils_1.isShadowed(oldAccount)) {
                sendAcl(client);
                this.kick(client, 'kick (unshadow)');
                return;
            }
        }
        var shouldSendAcl = oldAccount.mute !== newAccount.mute
            || oldAccount.ban !== newAccount.ban
            || oldAccount.shadow !== newAccount.shadow;
        if (shouldSendAcl) {
            sendAcl(client);
        }
    };
    World.prototype.shadow = function (client) {
        client.shadowed = true;
        this.partyService.clientDisconnected(client);
        this.friendsService.clientDisconnected(client);
        this.notifications.dismissAll(client);
        if (client.pony.region) {
            for (var _i = 0, _a = client.pony.region.clients; _i < _a.length; _i++) {
                var c = _a[_i];
                if (c !== client) {
                    entityUtils_1.pushRemoveEntityToClient(c, client.pony);
                }
            }
        }
    };
    // update notification
    World.prototype.notifyUpdate = function () {
        for (var _i = 0, _a = this.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            this.notifications.addNotification(client, updateNotification());
        }
    };
    World.prototype.saveClientStates = function () {
        for (var _i = 0, _a = this.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            playerUtils_1.createAndUpdateCharacterState(client, this.server);
        }
    };
    return World;
}());
exports.World = World;
// account creation lock
function sendAcl(client) {
    var acl = playerUtils_1.isMutedOrShadowed(client) ? utils_1.fromNow(12 * constants_1.HOUR) : new Date(0);
    client.actionParam(client.pony.id, 25 /* ACL */, acl.toISOString());
}
function updateNotification() {
    return {
        id: 0,
        name: '',
        message: 'Server will restart shortly for updates and maintenance',
        flags: 1 /* Ok */,
    };
}
function refreshMap(world, client) {
    var map = findOrCreateMapForClient(world, client.map.id, client);
    if (map) {
        world.switchToMap(client, map, client.pony.x, client.pony.y);
    }
    else {
        logger_1.logger.warn("Missing map: " + client.map.id);
    }
}
exports.refreshMap = refreshMap;
function goToMap(world, client, id, spawn) {
    var map = findOrCreateMapForClient(world, id, client);
    if (map) {
        var area = spawn && map.spawns.get(spawn) || map.spawnArea;
        var _a = utils_1.randomPoint(area), x = _a.x, y = _a.y;
        world.switchToMap(client, map, x, y);
    }
    else {
        logger_1.logger.warn("Missing map: " + id);
    }
}
exports.goToMap = goToMap;
function findOrCreateMapInstance(world, id, instance) {
    var map = world.maps.find(function (m) { return m.id === id && m.instance === instance; });
    if (!map) {
        // const pool = world.mapPools.get(id);
        // if (!pool) {
        // 	throw new Error(`Invalid map id: ${id}`);
        // }
        switch (id) {
            case 'house':
                map = houseMap_1.createHouseMap(world, true);
                break;
            case 'island':
                map = islandMap_1.createIslandMap(world, true);
                break;
            default:
                throw new Error("Invalid map id: " + id);
        }
        // map = pool.create();
        map.instance = instance;
        map.lastUsed = Date.now();
        map.controllers.forEach(function (c) { return c.initialize(world.now / 1000); });
        world.maps.push(map);
    }
    return map;
}
function findOrCreateMapForClient(world, id, client) {
    var map = world.maps.find(function (m) { return !m.instance && m.id === id; });
    if (map) {
        return map;
    }
    else {
        if (client.party) {
            return findOrCreateMapInstance(world, id, client.party.id);
        }
        else {
            return findOrCreateMapInstance(world, id, client.accountId);
        }
    }
}
function updateClientCamera(client) {
    var camera = client.camera;
    camera_1.updateCamera(camera, client.pony, client.map);
    if (client.lastCameraX !== camera.x || client.lastCameraY !== camera.y ||
        client.lastCameraW !== camera.w || client.lastCameraH !== camera.h) {
        client.lastCameraX = camera.x;
        client.lastCameraY = camera.y;
        client.lastCameraW = camera.w;
        client.lastCameraH = camera.h;
        return true;
    }
    else {
        return false;
    }
}
function findAllOnlineFriends(world, client) {
    return lodash_1.compact(Array.from(client.friends.keys())
        .map(function (account) { return findClientByAccountId(world, account); }));
}
exports.findAllOnlineFriends = findAllOnlineFriends;
function findClientByAccountId(world, accountId) {
    return world.clientsByAccount.get(accountId);
}
exports.findClientByAccountId = findClientByAccountId;
function findClientByCharacterId(world, characterId) {
    return world.clients.find(function (c) { return c.characterId === characterId; });
}
exports.findClientByCharacterId = findClientByCharacterId;
function findClientsAroundAccountId(world, accountId) {
    var client = findClientByAccountId(world, accountId);
    return client ? world.clients
        .filter(function (c) { return c !== client && c.map === client.map; })
        .map(function (c) { return ({
        account: c.accountId,
        distance: utils_1.distance(client.pony, c.pony),
        party: !!(c.party && c.party === client.party),
    }); })
        .filter(function (x) { return x.distance < 5 || x.party; })
        .sort(function (a, b) { return a.distance - b.distance; })
        .slice(0, 12) : [];
}
exports.findClientsAroundAccountId = findClientsAroundAccountId;
//# sourceMappingURL=world.js.map