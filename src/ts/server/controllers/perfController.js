"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfController = void 0;
var lodash_1 = require("lodash");
var entities_1 = require("../../common/entities");
var db_1 = require("../db");
var constants_1 = require("../../common/constants");
var entityUtils_1 = require("../entityUtils");
var characterUtils_1 = require("../characterUtils");
var camera_1 = require("../../common/camera");
var movementUtils_1 = require("../../common/movementUtils");
var timing_1 = require("../timing");
var chat_1 = require("../chat");
var PerfController = /** @class */ (function () {
    function PerfController(world, options) {
        this.world = world;
        this.options = options;
        this.entities = [];
        this.limitLeft = 11;
        this.limitWidth = 30;
        this.limitTop = 9;
        this.limitHeight = 25;
        this.initialized = false;
        if (options.spread) {
            this.limitWidth = 60;
            this.limitHeight = 60;
        }
        if (options.x !== undefined) {
            this.limitLeft = options.x;
        }
        if (options.y !== undefined) {
            this.limitTop = options.y;
        }
    }
    PerfController.prototype.initialize = function () {
        var _this = this;
        if (this.initialized)
            return;
        var world = this.world;
        var map = world.getMainMap();
        var names = [
            'performance',
            'performance 2',
        ];
        var query = this.options.unique ?
            Promise.resolve(db_1.Character.find({ account: '57ae2336a67f4dc52e123ed1' }).limit(this.options.count).exec()) :
            Promise.all(names.map(function (name) { return db_1.Character.findOne({ name: name }).exec(); })).then(lodash_1.compact);
        query
            .then(function (characters) {
            if (characters.length) {
                _this.entities = lodash_1.range(_this.options.count).map(function (i) {
                    var character = characters[i % characters.length];
                    var name = character._id.toString();
                    var x = _this.limitLeft + _this.limitWidth * Math.random();
                    var y = _this.limitTop + _this.limitHeight * Math.random();
                    var p = entities_1.pony(x, y);
                    entityUtils_1.setEntityName(p, name);
                    p.flags |= 64 /* CanCollide */;
                    p.encryptedInfoSafe = characterUtils_1.encryptInfo(character.info || '');
                    p.client = {
                        pony: p,
                        accountId: 'foobar',
                        characterId: character._id.toString(),
                        ignores: new Set(),
                        hides: new Set(),
                        permaHides: new Set(),
                        account: {},
                        regions: [],
                        camera: camera_1.createCamera(),
                        updateRegion: function () { },
                        addEntity: function () { },
                        mapTest: function () { },
                    };
                    p.client.camera.x = -10000;
                    p.vx = _this.options.moving ? randomVelocity() : 0;
                    p.vy = _this.options.moving ? randomVelocity() : 0;
                    p.state = movementUtils_1.shouldBeFacingRight(p) ? 2 /* FacingRight */ : 0 /* None */;
                    return world.addEntity(p, map);
                });
            }
        });
        this.initialized = true;
    };
    PerfController.prototype.update = function (_, now) {
        timing_1.timingStart('PerfController.update()');
        var limitBottom = this.limitTop + this.limitHeight;
        var limitRight = this.limitTop + this.limitHeight;
        if (this.options.moving) {
            for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                if ((entity.vy > 0 && entity.y > limitBottom) || (entity.vy < 0 && entity.y < this.limitTop)) {
                    entityUtils_1.updateEntityVelocity(entity, entity.vx, -entity.vy, now);
                }
                else if ((entity.vx > 0 && entity.x > limitRight) || (entity.vx < 0 && entity.x < this.limitLeft)) {
                    entityUtils_1.updateEntityVelocity(entity, -entity.vx, entity.vy, now);
                }
                else if (Math.random() < 0.1) {
                    entityUtils_1.updateEntityVelocity(entity, randomVelocity(), randomVelocity(), now);
                }
                if (this.options.saying && Math.random() < 0.01) {
                    chat_1.sayToAll(entity, 'Hello World', 'Hello World', 0 /* Chat */, {});
                }
            }
        }
        timing_1.timingEnd();
    };
    return PerfController;
}());
exports.PerfController = PerfController;
function randomVelocity() {
    var rand = Math.random();
    return rand < 0.333 ? 0 : (rand < 0.666 ? -constants_1.PONY_SPEED_TROT : +constants_1.PONY_SPEED_TROT);
}
//# sourceMappingURL=perfController.js.map