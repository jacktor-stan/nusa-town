"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreToolbox = exports.removeToolbox = exports.resetHouseMap = exports.createHouseMap = exports.defaultHouseSave = void 0;
var entities = require("../../common/entities");
var rect_1 = require("../../common/rect");
var world_1 = require("../world");
var mapUtils_1 = require("../mapUtils");
var serverMap_1 = require("../serverMap");
var controllers_1 = require("../controllers");
var serverRegion_1 = require("../serverRegion");
var worldMap_1 = require("../../common/worldMap");
var constants_1 = require("../../common/constants");
exports.defaultHouseSave = undefined;
var toolboxX = 2.125;
var toolboxY = 15.41;
function createHouseMap(world, instanced, _template) {
    if (_template === void 0) { _template = false; }
    var map = serverMap_1.createServerMap('house', 2 /* House */, 2, 2, 4 /* Wood */, instanced ? 1 /* Party */ : 0 /* Public */);
    if (worldMap_1.getTile(map, 0, 0) !== 0 /* None */) {
        for (var x = 0; x < map.width; x++) {
            serverMap_1.setTile(map, x, 0, 0 /* None */);
            serverMap_1.setTile(map, x, 1, 0 /* None */);
            serverMap_1.setTile(map, x, 2, 0 /* None */);
        }
    }
    serverMap_1.setTile(map, 4, map.height - 1, 10 /* Stone */);
    serverMap_1.setTile(map, 5, map.height - 1, 10 /* Stone */);
    map.usage = instanced ? 1 /* Party */ : 0 /* Public */;
    map.spawnArea = rect_1.rect(4, 8 + 6, 2, 1);
    map.defaultTile = 0 /* None */;
    map.flags |= 1 /* EditableWalls */ | 2 /* EditableEntities */ | 4 /* EditableTiles */;
    map.editableEntityLimit = constants_1.HOUSE_ENTITY_LIMIT;
    map.editableArea = rect_1.rect(0, 76 / constants_1.tileHeight, map.width, map.height);
    var topWall = 3;
    var windowY = 76 / constants_1.tileHeight;
    var add = function (entity) { return world.addEntity(entity, map); };
    var addEditable = function (entity) { return (entity.state |= 8 /* Editable */, add(entity)); };
    add(entities.triggerDoor(5, map.height))
        .trigger = function (_, client) { return world_1.goToMap(world, client, instanced ? 'island' : 'public-island', 'house'); };
    addEditable(entities.window1(2, windowY));
    addEditable(entities.window1(5, windowY));
    addEditable(entities.window1(8, windowY));
    addEditable(entities.window1(12, windowY));
    addEditable(entities.window1(14, windowY));
    addEditable(entities.picture1(3.53, windowY));
    addEditable(entities.picture2(10.09, windowY));
    addEditable(entities.table1(13.50, 13.20));
    addEditable(entities.table1(2.69, 5.63));
    addEditable(entities.table2(8.69, 11.60));
    addEditable(entities.lanternOn(3.53, 15.13));
    addEditable(entities.lanternOn(6.56, 15.13));
    addEditable(entities.lanternOn(1.43, 14.04));
    addEditable(entities.lanternOn(9.97, 6.67));
    addEditable(entities.lanternOn(13.50, 6.54));
    addEditable(entities.lanternOn(10.09, 15.13));
    addEditable(entities.lanternOn(14.09, 15.04));
    addEditable(entities.lanternOn(9.44, 4.67));
    addEditable(entities.lanternOn(14.43, 8.54));
    addEditable(entities.lanternOnWall(8.375, 12.70));
    addEditable(entities.lanternOnWall(9.09, 12.08));
    addEditable(entities.lanternOnWall(13.50, 13.33));
    addEditable(entities.lanternOnWall(2.69, 5.71));
    addEditable(entities.cushion1(3.94, 4.83));
    addEditable(entities.cushion1(1.56, 4.63));
    addEditable(entities.cushion1(6.91, 10.54));
    addEditable(entities.cushion1(10.38, 11.96));
    addEditable(entities.cushion1(10.56, 10.54));
    addEditable(entities.cushion1(6.91, 12.17));
    addEditable(entities.cushion1(8.88, 13.08));
    addEditable(entities.cushion1(8.84, 9.67));
    addEditable(entities.cushion1(13.25, 4.75));
    addEditable(entities.cushion1(14.50, 3.67));
    addEditable(entities.cushion1(15.38, 5.00));
    addEditable(entities.cushion1(14.13, 6.17));
    addEditable(entities.cushion1(14.69, 12.25));
    addEditable(entities.cushion1(12.31, 12.29));
    addEditable(entities.cushion1(9.94, 5.00));
    addEditable(entities.cushion1(8.03, 5.00));
    addEditable(entities.boxLanterns(0.72, 15.58));
    addEditable(entities.toolboxFull(toolboxX, toolboxY));
    var wallController = new controllers_1.WallController(world, map, entities.woodenWalls);
    map.controllers.push(wallController);
    wallController.top = 3;
    if (wallController.toggleWall) {
        for (var x = 0; x < map.width; x++) {
            wallController.toggleWall(x, topWall, 100 /* WallH */);
            if (x !== 4 && x !== 5) {
                wallController.toggleWall(x, map.height, 100 /* WallH */);
            }
            if (x !== 5 && x !== 8 && x !== 12) {
                wallController.toggleWall(x, 8, 100 /* WallH */);
            }
        }
        for (var x = 0; x < 3; x++) {
            wallController.toggleWall(x, 13, 100 /* WallH */);
        }
        for (var y = topWall; y < 8; y++) {
            wallController.toggleWall(7, y, 101 /* WallV */);
            wallController.toggleWall(11, y, 101 /* WallV */);
        }
        for (var y = 8; y < map.height; y++) {
            if (y !== 11 && y !== 14) {
                wallController.toggleWall(3, y, 101 /* WallV */);
            }
        }
        for (var y = topWall; y < map.height; y++) {
            wallController.toggleWall(0, y, 101 /* WallV */);
            wallController.toggleWall(map.width, y, 101 /* WallV */);
        }
    }
    wallController.lockOuterWalls = true;
    if (DEVELOPMENT) {
        mapUtils_1.addSpawnPointIndicators(world, map);
    }
    for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
        var region = _a[_i];
        serverRegion_1.resetRegionUpdates(region);
    }
    if (!exports.defaultHouseSave) {
        exports.defaultHouseSave = serverMap_1.saveMap(map, {
            saveTiles: true, saveEntities: true, saveOnlyEditableEntities: true, saveWalls: true
        });
    }
    return map;
}
exports.createHouseMap = createHouseMap;
function resetHouseMap(map) {
    for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
        var tiles = _a[_i].tiles;
        for (var i = 0; i < tiles.length; i++) {
            tiles[i] = 4 /* Wood */;
        }
    }
}
exports.resetHouseMap = resetHouseMap;
function findEntityByType(map, type) {
    for (var _i = 0, _a = map.regions; _i < _a.length; _i++) {
        var region = _a[_i];
        for (var _b = 0, _c = region.entities; _b < _c.length; _b++) {
            var entity = _c[_b];
            if (entity.type === type) {
                return entity;
            }
        }
    }
    return undefined;
}
function removeToolbox(world, map) {
    var toolbox = findEntityByType(map, entities.toolboxFull.type);
    if (toolbox) {
        world.removeEntity(toolbox, map);
    }
}
exports.removeToolbox = removeToolbox;
function restoreToolbox(world, map) {
    var toolbox = findEntityByType(map, entities.toolboxFull.type);
    if (!toolbox) {
        var entity = entities.toolboxFull(toolboxX, toolboxY);
        entity.state |= 8 /* Editable */;
        world.addEntity(entity, map);
    }
}
exports.restoreToolbox = restoreToolbox;
//# sourceMappingURL=houseMap.js.map