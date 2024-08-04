"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTreehidingEntities = exports.findTrees = exports.findClosestTree = exports.FlyingCritterController = void 0;
var lodash_1 = require("lodash");
var serverMap_1 = require("../serverMap");
var timing_1 = require("../timing");
var utils_1 = require("../../common/utils");
var entityUtils_1 = require("../entityUtils");
var collectableController_1 = require("./collectableController");
var FlyingCritterController = /** @class */ (function () {
    function FlyingCritterController(world, map, critter, speed, limit, isActive, spawnOnStart) {
        if (spawnOnStart === void 0) { spawnOnStart = false; }
        this.world = world;
        this.map = map;
        this.critter = critter;
        this.speed = speed;
        this.limit = limit;
        this.isActive = isActive;
        this.spawnOnStart = spawnOnStart;
        this.entities = [];
    }
    FlyingCritterController.prototype.initialize = function () {
        if (this.spawnOnStart) {
            for (var i = 0; i < this.limit; i++) {
                var _a = collectableController_1.randomPosition(this.map), x = _a.x, y = _a.y;
                this.entities.push(this.world.addEntity(this.critter(x, y), this.map));
            }
        }
    };
    FlyingCritterController.prototype.update = function (_, now) {
        timing_1.timingStart('FlyingCritterController.update()');
        updateTreehidingEntities(this.entities, this.world, this.map, this.limit, this.speed, now, this.critter, this.isActive);
        timing_1.timingEnd();
    };
    return FlyingCritterController;
}());
exports.FlyingCritterController = FlyingCritterController;
function isTreeCrown(entity) {
    return utils_1.hasFlag(entity.serverFlags || 0, 1 /* TreeCrown */);
}
function findClosestTree(map, x, y) {
    return serverMap_1.findClosestEntity(map, x, y, isTreeCrown);
}
exports.findClosestTree = findClosestTree;
function findTrees(map) {
    return serverMap_1.findEntities(map, isTreeCrown);
}
exports.findTrees = findTrees;
function updateTreehidingEntities(entities, world, map, limit, speed, timestamp, create, isActive) {
    var offsetY = -2;
    if (isActive()) {
        // release new critter
        if (entities.length < limit && Math.random() < 0.1) {
            var trees = findTrees(map);
            var tree = lodash_1.sample(trees);
            if (tree) {
                var entity = create(tree.x, tree.y + offsetY);
                entities.push(world.addEntity(entity, map));
                entityUtils_1.moveRandomly(map, entity, speed, 1, timestamp);
            }
        }
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var entity = entities_1[_i];
            entityUtils_1.moveRandomly(map, entity, speed, 0.02, timestamp);
        }
    }
    else if (entities.length) {
        // head to tree and disappear
        var trees = findTrees(map);
        for (var i = entities.length - 1; i >= 0; i--) {
            var e = entities[i];
            e.targetTree = e.targetTree || entityUtils_1.findClosest(e.x, e.y, trees);
            if (utils_1.distanceXY(e.x, e.y, e.targetTree.x, e.targetTree.y + offsetY) < 0.1) {
                entities.splice(i, 1);
                world.removeEntity(e, map);
            }
            else {
                entityUtils_1.moveTowards(e, e.targetTree.x, e.targetTree.y + offsetY, speed, timestamp);
            }
        }
    }
}
exports.updateTreehidingEntities = updateTreehidingEntities;
//# sourceMappingURL=flyingCritterController.js.map