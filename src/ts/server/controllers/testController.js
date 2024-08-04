"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
var lodash_1 = require("lodash");
var entities = require("../../common/entities");
var db_1 = require("../db");
var entityUtils_1 = require("../entityUtils");
var utils_1 = require("../../common/utils");
var characterUtils_1 = require("../characterUtils");
var camera_1 = require("../../common/camera");
var timing_1 = require("../timing");
var ag_sockets_1 = require("ag-sockets");
var TestController = /** @class */ (function () {
    function TestController(world, map) {
        this.world = world;
        this.map = map;
        this.clients = [];
        this.initialized = false;
    }
    TestController.prototype.initialize = function () {
        var _this = this;
        if (this.initialized)
            return;
        var world = this.world;
        var map = this.map;
        if (DEVELOPMENT) {
            Promise.all(utils_1.times(10, function (i) { return "debug " + (i + 1); }).map(function (name) { return db_1.Character.findOne({ name: name }).exec(); }))
                .then(lodash_1.compact)
                .then(function (items) { return items.forEach(function (item, i) {
                var name = item.name;
                var tag = i === 0 ? 'mod' : (i === 2 ? 'sup2' : '');
                var extraOptions = i === 0 ? {
                    site: {
                        provider: 'github',
                        name: 'Test name',
                        url: 'https://github.com/Microsoft/TypeScript',
                    }
                } : undefined;
                var p = entities.pony(57 + 1 * i, 47 + 1 * i);
                p.options = { tag: tag };
                entityUtils_1.setEntityName(p, name);
                p.encryptedInfoSafe = characterUtils_1.encryptInfo(item.info || '');
                p.client = {
                    map: map,
                    accountSettings: {},
                    account: { id: 'foobar', name: 'Debug account' },
                    country: 'XY',
                    regions: [],
                    saysQueue: { push: function () { }, length: 0 },
                    notifications: [],
                    camera: camera_1.createCamera(),
                    accountId: 'foobar',
                    characterId: '',
                    ignores: new Set(),
                    hides: new Set(),
                    permaHides: new Set(),
                    updateQueue: ag_sockets_1.createBinaryWriter(1),
                    addEntity: function () { },
                    addNotification: function () { },
                    removeNotification: function () { },
                    updateParty: function () { },
                    mapUpdate: function () { },
                };
                p.client.pony = p;
                _this.clients.push(p.client);
                p.extraOptions = extraOptions;
                world.addEntity(p, map);
            }); });
        }
        this.initialized = true;
    };
    TestController.prototype.update = function () {
        timing_1.timingStart('TestController.update()');
        timing_1.timingEnd();
    };
    TestController.prototype.sparseUpdate = function () {
        timing_1.timingStart('TestController.sparseUpdate()');
        for (var _i = 0, _a = this.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            for (var _b = 0, _c = client.notifications; _b < _c.length; _b++) {
                var notification = _c[_b];
                notification.accept && notification.accept();
            }
        }
        timing_1.timingEnd();
    };
    return TestController;
}());
exports.TestController = TestController;
//# sourceMappingURL=testController.js.map