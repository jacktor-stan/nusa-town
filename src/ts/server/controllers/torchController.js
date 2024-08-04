"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TorchController = void 0;
var timeUtils_1 = require("../../common/timeUtils");
var timing_1 = require("../timing");
var controllerUtils_1 = require("../controllerUtils");
var utils_1 = require("../../common/utils");
var TorchController = /** @class */ (function () {
    function TorchController(world, map) {
        this.world = world;
        this.map = map;
        this.lights = [];
    }
    TorchController.prototype.initialize = function () {
        this.lights = [];
        for (var _i = 0, _a = this.map.regions; _i < _a.length; _i++) {
            var region = _a[_i];
            for (var _b = 0, _c = region.entities; _b < _c.length; _b++) {
                var entity = _c[_b];
                if (utils_1.hasFlag(entity.flags, 1024 /* OnOff */)) {
                    this.lights.push(entity);
                }
            }
        }
    };
    TorchController.prototype.update = function () {
        timing_1.timingStart('TorchController.update()');
        timing_1.timingEnd();
    };
    TorchController.prototype.sparseUpdate = function () {
        timing_1.timingStart('TorchController.sparseUpdate()');
        controllerUtils_1.updateLights(this.lights, timeUtils_1.isNight(this.world.time));
        timing_1.timingEnd();
    };
    return TorchController;
}());
exports.TorchController = TorchController;
//# sourceMappingURL=torchController.js.map