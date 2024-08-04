"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaletteMap = void 0;
var entities = require("../../common/entities");
var rect_1 = require("../../common/rect");
var serverMap_1 = require("../serverMap");
var world_1 = require("../world");
var account_1 = require("../api/account");
var controllerUtils_1 = require("../controllerUtils");
var entityUtils_1 = require("../entityUtils");
function createPaletteMap(world) {
    var map = serverMap_1.createServerMap('palette', 0 /* None */, 10, 10, 2 /* Grass */);
    map.spawnArea = rect_1.rect(map.width / 2, map.height / 2, 0, 0);
    function add(entity) {
        world.addEntity(entity, map);
    }
    add(controllerUtils_1.createSign(map.width / 2, map.height / 2, 'Go back', function (_, client) { return world_1.goToMap(world, client, '', 'center'); }));
    var pad = 5;
    var x = pad;
    var y = pad;
    for (var _i = 0, allEntities_1 = account_1.allEntities; _i < allEntities_1.length; _i++) {
        var name_1 = allEntities_1[_i];
        var entityOrEntities = entities[name_1](x, y);
        var ents = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];
        for (var _a = 0, ents_1 = ents; _a < ents_1.length; _a++) {
            var entity = ents_1[_a];
            add(entity);
            entityUtils_1.setEntityName(entity, name_1);
        }
        x += 3;
        if (x > (map.width - pad)) {
            x = pad;
            y += 3;
        }
    }
    return map;
}
exports.createPaletteMap = createPaletteMap;
//# sourceMappingURL=paletteMap.js.map