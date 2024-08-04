"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantController = void 0;
var lodash_1 = require("lodash");
var timing_1 = require("../timing");
var utils_1 = require("../../common/utils");
var worldMap_1 = require("../../common/worldMap");
var PlantController = /** @class */ (function () {
    function PlantController(world, map, config) {
        var _this = this;
        this.world = world;
        this.map = map;
        this.config = config;
        this.plants = [];
        this.interact = function (entity, client) {
            _this.world.removeEntity(entity, _this.map);
            utils_1.removeItem(_this.plants, entity);
            _this.config.onPick && _this.config.onPick(entity, client);
        };
        this.nextSpawn = 0;
    }
    PlantController.prototype.initialize = function () {
    };
    PlantController.prototype.update = function () {
    };
    PlantController.prototype.sparseUpdate = function () {
        timing_1.timingStart('PlantController.sparseUpdate()');
        var now = Date.now();
        var maxStage = this.config.stages.length - 1;
        if (this.nextSpawn < now &&
            (this.config.isActive === undefined || this.config.isActive()) &&
            this.plants.length < this.config.count) {
            var _a = utils_1.randomPoint(this.config.area), x = _a.x, y = _a.y;
            if (this.config.growOnlyOn === undefined || worldMap_1.getTile(this.map, x, y) === this.config.growOnlyOn) {
                this.addPlant(x, y, 0);
                this.nextSpawn = now + lodash_1.random(10000, 20000);
            }
        }
        var plantsToRemove = [];
        for (var _i = 0, _b = this.plants; _i < _b.length; _i++) {
            var plant = _b[_i];
            if (plant.plantStage < maxStage && plant.plantStageNext < now) {
                plantsToRemove.push(plant);
                this.addPlant(plant.x, plant.y, plant.plantStage + 1);
            }
        }
        for (var _c = 0, plantsToRemove_1 = plantsToRemove; _c < plantsToRemove_1.length; _c++) {
            var plant = plantsToRemove_1[_c];
            this.removePlant(plant);
        }
        timing_1.timingEnd();
    };
    PlantController.prototype.removePlant = function (plant) {
        utils_1.removeItem(this.plants, plant);
        this.world.removeEntity(plant, this.map);
    };
    PlantController.prototype.addPlant = function (x, y, stage) {
        var create = lodash_1.sample(this.config.stages[stage]);
        var plant = create(x, y);
        plant.plantStage = stage;
        plant.plantStageNext = Date.now() + lodash_1.random(15000, 40000);
        plant.serverFlags = 2 /* DoNotSave */;
        if (stage === (this.config.stages.length - 1)) {
            plant.interact = this.interact;
        }
        this.plants.push(plant);
        this.world.addEntity(plant, this.map);
    };
    return PlantController;
}());
exports.PlantController = PlantController;
//# sourceMappingURL=plantController.js.map