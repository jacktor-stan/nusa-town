"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCollider = exports.createStubFromInstance = exports.mockSubject = exports.mockReporter = exports.mockClient = exports.genObjectId = exports.genId = exports.clientPony = exports.serverEntity = exports.entity = exports.mock = exports.character = exports.account = exports.auth = void 0;
var lodash_1 = require("lodash");
var mongoose_1 = require("mongoose");
var sinon_1 = require("sinon");
var clientActions_1 = require("../client/clientActions");
var interfaces_1 = require("../common/interfaces");
var serverMap_1 = require("../server/serverMap");
var camera_1 = require("../common/camera");
var worldMap_1 = require("../common/worldMap");
var mixins_1 = require("../common/mixins");
var ag_sockets_1 = require("ag-sockets");
var constants_1 = require("../common/constants");
function auth(item) {
    return item;
}
exports.auth = auth;
function account(item) {
    return item;
}
exports.account = account;
function character(item) {
    return item;
}
exports.character = character;
function mock(ctor, fields) {
    if (fields === void 0) { fields = {}; }
    var object = {};
    var prototype = ctor.prototype;
    Object.getOwnPropertyNames(prototype)
        .filter(function (key) { return !Object.getOwnPropertyDescriptor(prototype, key).get && typeof prototype[key] === 'function'; })
        .forEach(function (key) { return object[key] = function () { }; });
    return Object.assign(object, fields);
}
exports.mock = mock;
function entity(id, x, y, type, more) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (type === void 0) { type = 0; }
    if (more === void 0) { more = {}; }
    return __assign({ id: id, x: x, y: y, z: 0, vx: 0, vy: 0, depth: 0, type: type, order: 0, state: 0, playerState: 0, flags: 0, timestamp: 0, options: {} }, more);
}
exports.entity = entity;
function serverEntity(id, x, y, type, more) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (type === void 0) { type = 0; }
    if (more === void 0) { more = {}; }
    return __assign({ id: id, x: x, y: y, z: 0, vx: 0, vy: 0, depth: 0, type: type, order: 0, state: 0, playerState: 0, flags: 0, timestamp: 0, options: {} }, more);
}
exports.serverEntity = serverEntity;
function clientPony() {
    return mockClient().pony;
}
exports.clientPony = clientPony;
var id = 1;
var ponyId = 1;
function genId() {
    return (++id).toString(16).padStart(24, '0');
}
exports.genId = genId;
function genObjectId() {
    return mongoose_1.Types.ObjectId(genId());
}
exports.genObjectId = genObjectId;
function mockClient(fields) {
    if (fields === void 0) { fields = {}; }
    var pony = entity(++ponyId, 0, 0, constants_1.PONY_TYPE);
    var accountId = genId();
    var characterId = genId();
    pony.options = {};
    var partial = __assign({ accountId: accountId, characterId: characterId, ignores: new Set(), hides: new Set(), permaHides: new Set(), friends: new Set(), accountSettings: {}, originalRequest: { headers: {} }, account: { id: accountId, _id: mongoose_1.Types.ObjectId(accountId), ignores: [] }, character: { id: characterId, _id: mongoose_1.Types.ObjectId(characterId) }, isMod: false, pony: pony, map: serverMap_1.createServerMap('', 0, 1, 1), notifications: [], regions: [], updateQueue: ag_sockets_1.createBinaryWriter(128), regionUpdates: [], unsubscribes: [], subscribes: [], saysQueue: [], lastSays: [], lastBoopAction: 0, lastExpressionAction: 0, viewWidth: 3, viewHeight: 3, screenSize: { width: 20, height: 20 }, reporter: mockReporter(), camera: camera_1.createCamera(), reportInviteLimit: function () { }, disconnect: function () { } }, fields);
    var client = mock(clientActions_1.ClientActions, partial);
    client.pony.client = client;
    return client;
}
exports.mockClient = mockClient;
function mockReporter() {
    return {
        info: function () { },
        warn: function () { },
        warnLog: function () { },
        danger: function () { },
        error: function () { },
        system: function () { },
        systemLog: function () { },
        setPony: function () { },
    };
}
exports.mockReporter = mockReporter;
function mockSubject() {
    var values = [];
    return {
        values: values,
        next: function (value) {
            values.push(value);
        },
    };
}
exports.mockSubject = mockSubject;
function createStubFromInstance(instance) {
    return lodash_1.mapValues(instance, function () { return sinon_1.stub(); });
}
exports.createStubFromInstance = createStubFromInstance;
function setupCollider(map, x, y) {
    var entity = serverEntity(0, x, y, 0);
    mixins_1.mixColliderRect(-16, -12, 32, 24)(entity, {}, interfaces_1.defaultWorldState);
    worldMap_1.getRegionGlobal(map, x, y).colliders.push(entity);
}
exports.setupCollider = setupCollider;
//# sourceMappingURL=mocks.js.map