"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastPacket = exports.FakeClientsController = void 0;
var lodash_1 = require("lodash");
var ag_sockets_1 = require("ag-sockets");
var db_1 = require("../db");
var playerUtils_1 = require("../playerUtils");
var counter_1 = require("../services/counter");
var utils_1 = require("../../common/utils");
var timing_1 = require("../timing");
var mockCharacterStates = new counter_1.CounterService(0);
var FakeClientsController = /** @class */ (function () {
    function FakeClientsController(world, server, options) {
        this.world = world;
        this.server = server;
        this.options = options;
        this.clients = [];
        this.tokens = [];
        this.initialized = false;
    }
    FakeClientsController.prototype.initialize = function () {
        var _this = this;
        if (this.initialized)
            return;
        utils_1.times(1000, function (i) { return __awaiter(_this, void 0, void 0, function () {
            var name_1, account, character, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        name_1 = "perf-" + i;
                        return [4 /*yield*/, db_1.Account.findOne({ name: name_1 }).exec()];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error("Missing debug account (" + name_1 + ")");
                        return [4 /*yield*/, db_1.Character.findOne({ account: account._id }).exec()];
                    case 2:
                        character = _a.sent();
                        if (!character)
                            throw new Error("Missing debug character (" + name_1 + ")");
                        this.tokens.push({ id: name_1, account: account, character: character });
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        this.initialized = true;
    };
    FakeClientsController.prototype.update = function () {
    };
    FakeClientsController.prototype.sparseUpdate = function () {
        timing_1.timingStart('FakeClientController.sparseUpdate()');
        if (this.tokens.length) {
            for (var i = this.clients.length - 1; i >= 0; i--) {
                if (Math.random() < (10 / this.options.count)) {
                    this.leave(this.clients[i]);
                }
            }
            if (this.clients.length < this.options.count) {
                for (var i = 0; i < 10; i++) {
                    this.join();
                }
            }
        }
        timing_1.timingEnd();
    };
    FakeClientsController.prototype.join = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token_1, client, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        token_1 = lodash_1.sample(this.tokens);
                        if (!!this.clients.some(function (c) { return c.tokenId === token_1.id; })) return [3 /*break*/, 2];
                        return [4 /*yield*/, joinFakeClient(token_1, this.server, this.world)];
                    case 1:
                        client = _a.sent();
                        this.clients.push(client);
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FakeClientsController.prototype.leave = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.world.leaveClient(client);
                utils_1.removeItem(this.clients, client);
                return [2 /*return*/];
            });
        });
    };
    return FakeClientsController;
}());
exports.FakeClientsController = FakeClientsController;
var packetWriter = ag_sockets_1.createBinaryWriter();
function joinFakeClient(token, server, world) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            client = {
                tokenId: token.id,
                tokenData: token,
                disconnect: function () {
                    world.leaveClient(client);
                },
                queue: function () { },
                left: function () { },
                worldState: function () { },
                mapState: function () { },
                myEntity: function () { },
                mapTest: function () { },
                updateFriends: function () { },
                actionParam: function () { },
                update: function (_, subscribes, adds, datas) {
                    do {
                        try {
                            ag_sockets_1.resetWriter(packetWriter);
                            ag_sockets_1.writeUint8(packetWriter, 123);
                            if (ag_sockets_1.writeArrayHeader(packetWriter, subscribes)) {
                                for (var i = 0; i < subscribes.length; i++) {
                                    ag_sockets_1.writeUint8Array(packetWriter, subscribes[i]);
                                }
                            }
                            ag_sockets_1.writeUint8Array(packetWriter, adds);
                            if (ag_sockets_1.writeArrayHeader(packetWriter, datas)) {
                                for (var i = 0; i < datas.length; i++) {
                                    ag_sockets_1.writeUint8Array(packetWriter, datas[i]);
                                }
                            }
                            break;
                        }
                        catch (e) {
                            if (e instanceof RangeError || /DataView/.test(e.message)) {
                                ag_sockets_1.resizeWriter(packetWriter);
                            }
                            else {
                                throw e;
                            }
                        }
                    } while (true);
                    exports.lastPacket = ag_sockets_1.getWriterBuffer(packetWriter);
                },
                addNotification: function () { },
                removeNotification: function () { },
            };
            playerUtils_1.createClientAndPony(client, [], [], server, world, mockCharacterStates);
            world.joinClientToQueue(client);
            return [2 /*return*/, client];
        });
    });
}
//# sourceMappingURL=fakeClientController.js.map