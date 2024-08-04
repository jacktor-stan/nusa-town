"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudController = void 0;
var constants_1 = require("../../common/constants");
var utils_1 = require("../../common/utils");
var entities_1 = require("../../common/entities");
var sprites = require("../../generated/sprites");
var entityUtils_1 = require("../entityUtils");
var timing_1 = require("../timing");
var spriteWidth = sprites.cloud.shadow.w / constants_1.tileWidth;
var cloudVX = -0.5;
var CloudController = /** @class */ (function () {
    function CloudController(world, map, cloudCount) {
        this.world = world;
        this.map = map;
        this.cloudCount = cloudCount;
        this.clouds = [];
        this.initialized = false;
    }
    CloudController.prototype.initialize = function () {
        if (this.initialized)
            return;
        for (var i = 0; i < this.cloudCount; i++) {
            this.addCloud(false, this.world.now / 1000);
        }
        this.initialized = true;
    };
    CloudController.prototype.update = function (_, now) {
        timing_1.timingStart('CloudController.update()');
        for (var i = this.clouds.length - 1; i >= 0; i--) {
            var cloud_1 = this.clouds[i];
            if (cloud_1.x < -spriteWidth) {
                this.clouds.splice(i, 1);
                this.world.removeEntity(cloud_1, this.map);
            }
        }
        if (this.clouds.length < this.cloudCount) {
            this.addCloud(true, now);
        }
        timing_1.timingEnd();
    };
    CloudController.prototype.addCloud = function (end, timestamp) {
        var x = end ? this.map.width + spriteWidth : this.map.width * Math.random();
        var y = this.map.height * Math.random();
        var entity = entities_1.cloud(x, y);
        if (!this.clouds.some(function (c) { return utils_1.entitiesIntersect(c, entity); })) {
            this.clouds.push(this.world.addEntity(entity, this.map));
            entityUtils_1.updateEntityVelocity(entity, cloudVX, 0, timestamp);
        }
    };
    return CloudController;
}());
exports.CloudController = CloudController;
//# sourceMappingURL=cloudController.js.map