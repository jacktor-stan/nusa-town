"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WallController = void 0;
var base64_js_1 = require("base64-js");
var constants_1 = require("../../common/constants");
var utils_1 = require("../../common/utils");
var createGetAt = function (width, height) { return function (items, x, y) {
    return (x < 0 || y < 0 || x >= width || y >= height) ? undefined : items[x + y * width];
}; };
var createSetAt = function (width, height) { return function (items, x, y, value) {
    if (x >= 0 && y >= 0 && x < width && y < height) {
        items[x + y * width] = value;
    }
}; };
var WallController = /** @class */ (function () {
    function WallController(world, map, walls) {
        var _this = this;
        this.top = 0;
        this.isTall = function (_x, _y) { return false; };
        this.lockOuterWalls = false;
        this.lockedTiles = new Set();
        var width = map.width + 1;
        var height = map.height + 1;
        var getAt = createGetAt(width, height);
        var setAt = createSetAt(width, height);
        var hWalls = this.hWalls = utils_1.array(width * height, undefined);
        var vWalls = this.vWalls = utils_1.array(width * height, undefined);
        var cWalls = utils_1.array(width * height, undefined);
        var yOffset = 3 / constants_1.tileHeight;
        var wallHShort = walls.wallHShort, wallVShort = walls.wallVShort, wallH = walls.wallH, wallV = walls.wallV, wallCorners = walls.wallCorners, wallCornersShort = walls.wallCornersShort, wallCutR = walls.wallCutR, wallCutL = walls.wallCutL;
        var calcCorner = function (x, y) {
            // top right bottom left
            return (getAt(vWalls, x, y - 1) ? 8 : 0)
                + (getAt(hWalls, x, y) ? 4 : 0)
                + (getAt(vWalls, x, y) ? 2 : 0)
                + (getAt(hWalls, x - 1, y) ? 1 : 0);
        };
        var updateCorner = function (x, y) {
            if (x < 0 || y < 0 || x >= width || y >= height)
                return;
            var top = _this.top;
            var isOutside = x === 0 || y <= top || x === map.width || _this.isTall(x, y);
            var corners = isOutside ? wallCorners : wallCornersShort;
            var current = getAt(cWalls, x, y);
            var calc = calcCorner(x, y);
            if (!current || current.type !== corners[calc].type) {
                if (current) {
                    world.removeEntity(current, map);
                }
                setAt(cWalls, x, y, calc ? world.addEntity(corners[calc](x, y + yOffset), map) : undefined);
            }
        };
        this.toggleWall = function (x, y, type) {
            if (x < 0 || y < 0 || x >= width || y >= height)
                return;
            if (_this.lockedTiles.has(x + "," + y + ":" + type))
                return;
            var walls = type === 100 /* WallH */ ? hWalls : vWalls;
            var entity = getAt(walls, x, y);
            var top = _this.top;
            if (type === 100 /* WallH */ && x === (width - 1))
                return;
            if (type === 101 /* WallV */ && y === (height - 1))
                return;
            if (_this.lockOuterWalls) {
                if (type === 100 /* WallH */ && (y <= top || y === (width - 1)))
                    return;
                if (type === 101 /* WallV */ && (x === 0 || x === (height - 1) || y < top))
                    return;
            }
            if (entity) {
                world.removeEntity(entity, map);
                setAt(walls, x, y, undefined);
            }
            else {
                if (type === 100 /* WallH */) {
                    var ctor = (y <= top || _this.isTall(x, y)) ?
                        wallH : (x === 0 ? wallCutL : (x === (width - 2) ? wallCutR : wallHShort));
                    setAt(walls, x, y, world.addEntity(ctor(x + 0.5, y + yOffset), map));
                }
                else {
                    var ctor = (x === 0 || x === (width - 1) || _this.isTall(x, y)) ? wallV : wallVShort;
                    setAt(walls, x, y, world.addEntity(ctor(x, y + 0.5), map));
                }
            }
            updateCorner(x, y);
            updateCorner(x + 1, y);
            updateCorner(x, y + 1);
        };
    }
    WallController.prototype.initialize = function () {
    };
    WallController.prototype.update = function () {
    };
    WallController.prototype.lockWall = function (x, y, type) {
        this.lockedTiles.add(x + "," + y + ":" + type);
    };
    WallController.prototype.serialize = function () {
        var data = new Uint8Array(Math.ceil(this.vWalls.length / 8) + Math.ceil(this.hWalls.length / 8));
        var offset = 0;
        for (var i = 0; i < this.vWalls.length; i += 8, offset++) {
            var value = 0;
            for (var j = 0; j < 8; j++) {
                if (this.vWalls[i + j]) {
                    value |= (1 << j);
                }
            }
            data[offset] = value;
        }
        for (var i = 0; i < this.hWalls.length; i += 8, offset++) {
            var value = 0;
            for (var j = 0; j < 8; j++) {
                if (this.hWalls[i + j]) {
                    value |= (1 << j);
                }
            }
            data[offset] = value;
        }
        return base64_js_1.fromByteArray(data);
    };
    WallController.prototype.deserialize = function (width, height, serialized) {
        var data = base64_js_1.toByteArray(serialized);
        var size = (width + 1) * (height + 1);
        var offset = 0;
        for (var i = 0; i < size; i += 8, offset++) {
            var value = data[offset];
            for (var j = 0; j < 8; j++) {
                if ((!!this.vWalls[i + j]) !== ((value & (1 << j)) !== 0)) {
                    var x = (i + j) % (width + 1);
                    var y = Math.floor((i + j) / (width + 1));
                    this.toggleWall(x, y, 101 /* WallV */);
                }
            }
        }
        for (var i = 0; i < size; i += 8, offset++) {
            var value = data[offset];
            for (var j = 0; j < 8; j++) {
                if ((!!this.hWalls[i + j]) !== ((value & (1 << j)) !== 0)) {
                    var x = (i + j) % (width + 1);
                    var y = Math.floor((i + j) / (width + 1));
                    this.toggleWall(x, y, 100 /* WallH */);
                }
            }
        }
    };
    return WallController;
}());
exports.WallController = WallController;
//# sourceMappingURL=wallController.js.map