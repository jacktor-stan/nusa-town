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
exports.LiveList = void 0;
var utils_1 = require("../../common/utils");
var logger_1 = require("../logger");
var db_1 = require("../db");
var tickInterval = 1000;
function fixDocumentId(item) {
    item._id = item._id.toString();
    return item;
}
var LiveList = /** @class */ (function () {
    function LiveList(model, config, getId, logger) {
        if (getId === void 0) { getId = function (item) { return item._id; }; }
        if (logger === void 0) { logger = logger_1.logger; }
        this.model = model;
        this.config = config;
        this.getId = getId;
        this.logger = logger;
        this.items = [];
        this.itemsMap = new Map();
        this.listeners = new Map();
        this.timestamp = new Date(0);
        this.finished = false;
        this.running = false;
        this.fieldsString = config.fields.join(' ');
    }
    Object.defineProperty(LiveList.prototype, "loaded", {
        get: function () {
            return this.finished;
        },
        enumerable: false,
        configurable: true
    });
    LiveList.prototype.start = function () {
        if (this.config.noStore) {
            this.timestamp = new Date();
        }
        this.running = true;
        this.tick();
    };
    LiveList.prototype.stop = function () {
        this.running = false;
        clearTimeout(this.timeout);
    };
    LiveList.prototype.get = function (id) {
        return this.itemsMap.get(id);
    };
    LiveList.prototype.for = function (id, callback) {
        var item = id ? this.get(id) : undefined;
        item && callback(item);
    };
    LiveList.prototype.add = function (item) {
        var id = this.getId(item);
        this.items.push(item);
        this.itemsMap.set(id, item);
        if (this.config.onAdd) {
            this.config.onAdd(item);
        }
        this.trigger(id, item);
        return item;
    };
    // NOTE: only _id
    LiveList.prototype.remove = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.deleteOne({ _id: id }).exec()];
                    case 1:
                        _a.sent();
                        this.removed(id);
                        return [2 /*return*/];
                }
            });
        });
    };
    LiveList.prototype.removed = function (id) {
        var item = this.get(id);
        if (item) {
            this.trigger(id, undefined);
            this.itemsMap.delete(id);
            utils_1.removeItem(this.items, item);
            this.config.onDelete && this.config.onDelete(item);
        }
    };
    LiveList.prototype.discard = function (id) {
        var item = this.get(id);
        if (item) {
            this.itemsMap.delete(id);
            utils_1.removeItem(this.items, item);
        }
    };
    LiveList.prototype.trigger = function (id, item) {
        var listeners = this.listeners.get(id);
        if (listeners) {
            var cleaned_1 = item ? this.config.clean(item) : item;
            listeners.forEach(function (listener) { return listener(id, cleaned_1); });
        }
    };
    LiveList.prototype.subscribe = function (id, listener) {
        var _this = this;
        var listeners = this.listeners.get(id) || [];
        listeners.push(listener);
        this.listeners.set(id, listeners);
        var item = this.get(id);
        if (item) {
            listener(id, this.config.clean(item));
        }
        else if (this.config.onSubscribeToMissing) {
            this.add(this.config.onSubscribeToMissing(id));
        }
        return {
            unsubscribe: function () {
                var listeners = _this.listeners.get(id) || [];
                utils_1.removeItem(listeners, listener);
                if (listeners.length === 0) {
                    _this.listeners.delete(id);
                }
            }
        };
    };
    LiveList.prototype.hasSubscriptions = function (id) {
        return !!this.listeners.get(id);
    };
    LiveList.prototype.tick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.running) return [3 /*break*/, 5];
                        clearTimeout(this.timeout);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, this.update()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _a.sent();
                        this.logger.error(e_1);
                        return [3 /*break*/, 5];
                    case 4:
                        this.timeout = setTimeout(function () { return _this.tick(); }, tickInterval);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LiveList.prototype.fetch = function (search) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.internalUpdate(search, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LiveList.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.internalUpdate({ updatedAt: { $gt: this.timestamp } }, false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LiveList.prototype.internalUpdate = function (search, fetching) {
        return __awaiter(this, void 0, void 0, function () {
            var query, applyUpdate, addedOrUpdated;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = this.model.find(search, this.fieldsString);
                        applyUpdate = this.config.onUpdate || Object.assign;
                        addedOrUpdated = false;
                        return [4 /*yield*/, db_1.iterate(query.lean(), function (update) {
                                try {
                                    fixDocumentId(update);
                                    if (_this.config.fix) {
                                        _this.config.fix(update);
                                    }
                                    if (!fetching) {
                                        _this.timestamp = utils_1.maxDate(_this.timestamp, update.updatedAt);
                                    }
                                    var doc = _this.get(_this.getId(update));
                                    if (doc !== undefined) {
                                        applyUpdate(doc, update);
                                        _this.trigger(_this.getId(doc), doc);
                                    }
                                    else if (fetching || !(_this.config.ignore && _this.config.ignore(update))) {
                                        _this.add(update);
                                    }
                                    addedOrUpdated = true;
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            })];
                    case 1:
                        _a.sent();
                        if (addedOrUpdated && this.config.onAddedOrUpdated) {
                            this.config.onAddedOrUpdated();
                        }
                        if (!this.finished) {
                            this.finished = true;
                            this.config.onFinished && this.config.onFinished();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return LiveList;
}());
exports.LiveList = LiveList;
//# sourceMappingURL=liveList.js.map