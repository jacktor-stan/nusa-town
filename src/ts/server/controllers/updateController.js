"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateController = void 0;
var timing_1 = require("../timing");
var UpdateController = /** @class */ (function () {
    function UpdateController(map) {
        this.map = map;
        this.updatables = [];
    }
    UpdateController.prototype.initialize = function () {
        this.updatables = [];
        for (var _i = 0, _a = this.map.regions; _i < _a.length; _i++) {
            var region = _a[_i];
            for (var _b = 0, _c = region.entities; _b < _c.length; _b++) {
                var entity = _c[_b];
                if (entity.serverUpdate) {
                    this.updatables.push(entity);
                }
            }
        }
    };
    UpdateController.prototype.update = function (delta, now) {
        timing_1.timingStart('TorchController.update()');
        for (var _i = 0, _a = this.updatables; _i < _a.length; _i++) {
            var entity = _a[_i];
            entity.serverUpdate(delta, now);
        }
        timing_1.timingEnd();
    };
    return UpdateController;
}());
exports.UpdateController = UpdateController;
//# sourceMappingURL=updateController.js.map