"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStoneWallFenceMaker = exports.createWoodenFenceMaker = exports.createFenceMaker = exports.updateLights = exports.turnOn = exports.turnOff = exports.createAddLight = exports.boopLight = exports.createSignWithText = exports.createSign = exports.createBoxOfLanterns = exports.give = void 0;
var lodash_1 = require("lodash");
var playerUtils_1 = require("./playerUtils");
var chat_1 = require("./chat");
var interfaces_1 = require("../common/interfaces");
var entities = require("../common/entities");
var entityUtils_1 = require("./entityUtils");
var utils_1 = require("../common/utils");
function give(type, message) {
    return function (e, client) {
        if (client.pony.options && client.pony.options.hold === type) {
            playerUtils_1.unholdItem(client.pony);
        }
        else {
            if (message) {
                chat_1.sayTo(client, e, message, 7 /* Announcement */);
            }
            playerUtils_1.holdItem(client.pony, type);
        }
    };
}
exports.give = give;
function createBoxOfLanterns(x, y) {
    var boxOfLanterns = entities.boxLanterns(x, y);
    boxOfLanterns.interact = give(entities.lanternOn.type);
    entityUtils_1.setEntityName(boxOfLanterns, 'Box of lanterns');
    return boxOfLanterns;
}
exports.createBoxOfLanterns = createBoxOfLanterns;
function createSign(x, y, name, interact, create) {
    if (create === void 0) { create = entities.sign; }
    var entity = create(x, y);
    entityUtils_1.setEntityName(entity, name);
    entity.interact = interact;
    return entity;
}
exports.createSign = createSign;
function createSignWithText(x, y, name, text, create) {
    if (create === void 0) { create = entities.sign; }
    return createSign(x, y, name, function (entity, client) { return chat_1.sayTo(client, entity, text, 1 /* System */); }, create);
}
exports.createSignWithText = createSignWithText;
function boopLight() {
    var _this = this;
    setTimeout(function () {
        if (utils_1.hasFlag(_this.state, 4 /* On */)) {
            turnOff(_this);
            _this.lightDelay = Date.now() + 3000;
        }
    }, 300);
}
exports.boopLight = boopLight;
function createAddLight(world, map, createEntity) {
    return function (x, y) {
        var entity = world.addEntity(createEntity(x, y), map);
        entity.boop = boopLight;
        return entity;
    };
}
exports.createAddLight = createAddLight;
function turnOff(entity) {
    entityUtils_1.updateEntityState(entity, 0 /* None */);
}
exports.turnOff = turnOff;
function turnOn(entity) {
    entityUtils_1.updateEntityState(entity, interfaces_1.setAnimationToEntityState(4 /* On */, 1));
}
exports.turnOn = turnOn;
function updateLights(entities, on) {
    for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
        var entity = entities_1[_i];
        if (utils_1.hasFlag(entity.state, 4 /* On */) !== on && Math.random() < 0.2) {
            if (entity.lightDelay === undefined || entity.lightDelay < Date.now()) {
                if (on) {
                    turnOn(entity);
                }
                else {
                    turnOff(entity);
                }
            }
        }
    }
}
exports.updateLights = updateLights;
function createFenceMaker(world, map, size, poles, beamsH, beamsV) {
    var add = function (entity) { return world.addEntity(entity, map); };
    return function (x, y, length, horizontal, skipStart, skipEnd) {
        if (horizontal === void 0) { horizontal = true; }
        if (skipStart === void 0) { skipStart = false; }
        if (skipEnd === void 0) { skipEnd = false; }
        var dx = horizontal ? size : 0;
        var dy = horizontal ? 0 : size;
        for (var i = 0; i < length; i++) {
            if (i || !skipStart) {
                add(lodash_1.sample(poles)(x + dx * i, y + dy * i));
            }
            if (horizontal) {
                add(lodash_1.sample(beamsH)(x + dx * i + (size / 2), y));
            }
            else {
                add(lodash_1.sample(beamsV)(x, y + dy * i));
            }
        }
        if (!skipEnd) {
            add(lodash_1.sample(poles)(x + dx * length, y + dy * length));
        }
    };
}
exports.createFenceMaker = createFenceMaker;
function createWoodenFenceMaker(world, map) {
    return createFenceMaker(world, map, 1, __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], utils_1.repeat(2, entities.woodenFencePole1)), utils_1.repeat(2, entities.woodenFencePole2)), utils_1.repeat(2, entities.woodenFencePole3)), utils_1.repeat(2, entities.woodenFencePole4)), [
        entities.woodenFencePole5,
    ]), __spreadArray(__spreadArray(__spreadArray(__spreadArray([], utils_1.repeat(5, entities.woodenFenceBeamH1)), utils_1.repeat(5, entities.woodenFenceBeamH2)), utils_1.repeat(5, entities.woodenFenceBeamH3)), [
        entities.woodenFenceBeamH4,
        entities.woodenFenceBeamH5,
        entities.woodenFenceBeamH6,
    ]), [
        entities.woodenFenceBeamV1,
        entities.woodenFenceBeamV2,
        entities.woodenFenceBeamV3,
    ]);
}
exports.createWoodenFenceMaker = createWoodenFenceMaker;
function createStoneWallFenceMaker(world, map) {
    return createFenceMaker(world, map, 2, [
        entities.stoneWallPole1,
    ], [
        entities.stoneWallBeamH1,
    ], [
        entities.stoneWallBeamV1,
    ]);
}
exports.createStoneWallFenceMaker = createStoneWallFenceMaker;
//# sourceMappingURL=controllerUtils.js.map