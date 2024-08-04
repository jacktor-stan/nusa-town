"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectableController = exports.randomPosition = void 0;
var lodash_1 = require("lodash");
var timing_1 = require("../timing");
var entityUtils_1 = require("../entityUtils");
function randomPosition(map) {
    var x = Math.random() * map.width;
    var y = Math.random() * map.height;
    return { x: x, y: y };
}
exports.randomPosition = randomPosition;
var CollectableController = /** @class */ (function () {
    function CollectableController(world, map, ctors, limit, pick, check, tries, position, active) {
        var _this = this;
        if (check === void 0) { check = function () { return true; }; }
        if (tries === void 0) { tries = 1; }
        if (position === void 0) { position = randomPosition; }
        if (active === void 0) { active = function () { return true; }; }
        this.world = world;
        this.map = map;
        this.ctors = ctors;
        this.limit = limit;
        this.pick = pick;
        this.check = check;
        this.tries = tries;
        this.position = position;
        this.active = active;
        this.items = [];
        this.interact = function (entity, client) {
            if (_this.check(client)) {
                if (client.shadowed) {
                    entityUtils_1.pushRemoveEntityToClient(client, entity);
                }
                else {
                    lodash_1.remove(_this.items, function (e) { return e === entity; });
                    _this.world.removeEntity(entity, _this.map);
                    _this.generateItem();
                    _this.pick(client, entity);
                }
            }
        };
    }
    CollectableController.prototype.initialize = function () {
    };
    CollectableController.prototype.update = function () {
        timing_1.timingStart('CollectableController.update()');
        if (this.active()) {
            for (var i = 0; i < this.tries; i++) {
                if (this.items.length < this.limit) {
                    this.generateItem();
                }
            }
        }
        timing_1.timingEnd();
    };
    CollectableController.prototype.generateItem = function () {
        var _a = this, world = _a.world, map = _a.map;
        var _b = this.position(map), x = _b.x, y = _b.y;
        var ctor = lodash_1.sample(this.ctors);
        var entity = ctor(x, y);
        if (!entity.interactRange) {
            entity.interactRange = 1.5;
        }
        if (x > 0 && y > 0 && x < map.width && y < map.height && entityUtils_1.canPlaceItem(map, entity) && !entityUtils_1.canBePickedByPlayer(map, entity)) {
            entity.interact = this.interact;
            this.items.push(world.addEntity(entity, map));
        }
    };
    return CollectableController;
}());
exports.CollectableController = CollectableController;
//# sourceMappingURL=collectableController.js.map