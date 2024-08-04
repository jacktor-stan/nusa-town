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
require("../lib");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var liveList_1 = require("../../server/services/liveList");
describe('LiveList', function () {
    var model;
    var liveList;
    var config;
    var logger;
    beforeEach(function () {
        model = {
            find: sinon_1.stub(),
            findById: sinon_1.stub(),
            update: sinon_1.stub(),
            deleteOne: sinon_1.stub(),
        };
        config = { fields: ['foo', 'bar'], clean: function (item) { return item; } };
        logger = {};
        liveList = new liveList_1.LiveList(model, config, undefined, logger);
    });
    it('returns loaded state', function () {
        liveList.finished = true;
        chai_1.expect(liveList.loaded).true;
        liveList.finished = false;
        chai_1.expect(liveList.loaded).false;
    });
    describe('for()', function () {
        it('calls callback for item', function () {
            var callback = sinon_1.stub();
            var item = { _id: 'foo' };
            liveList.add(item);
            liveList.for('foo', callback);
            sinon_1.assert.calledWith(callback, item);
        });
        it('does nothing if item is not found', function () {
            var callback = sinon_1.stub();
            liveList.for('foo', callback);
            sinon_1.assert.notCalled(callback);
        });
        it('does nothing for undefined id', function () {
            var callback = sinon_1.stub();
            liveList.for(undefined, callback);
            sinon_1.assert.notCalled(callback);
        });
    });
    describe('add()', function () {
        it('adds item to items', function () {
            var item = { _id: 'foo' };
            liveList.add(item);
            chai_1.expect(liveList.items).contain(item);
        });
        it('adds item to item map', function () {
            var item = { _id: 'foo' };
            liveList.add(item);
            chai_1.expect(liveList.get('foo')).equal(item);
        });
        it('triggers event listeners', function () {
            var item = { _id: 'foo' };
            var listener = sinon_1.stub();
            liveList.subscribe('foo', listener);
            liveList.add(item);
            sinon_1.assert.calledWith(listener, 'foo', item);
        });
        it('returns item', function () {
            var item = { _id: 'foo' };
            chai_1.expect(liveList.add(item)).equal(item);
        });
    });
    describe('remove()', function () {
        it('removes item from database', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model.deleteOne.returns({ exec: sinon_1.stub().resolves() });
                        return [4 /*yield*/, liveList.remove('foo')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(model.deleteOne, { _id: 'foo' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('notifies removal of item', function () { return __awaiter(void 0, void 0, void 0, function () {
            var removed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model.deleteOne.returns({ exec: sinon_1.stub().resolves() });
                        removed = sinon_1.stub(liveList, 'removed');
                        return [4 /*yield*/, liveList.remove('foo')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(removed, 'foo');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('removed()', function () {
        it('removed item from items', function () {
            var item = { _id: 'foo' };
            liveList.add(item);
            liveList.removed('foo');
            chai_1.expect(liveList.items).not.contain(item);
        });
        it('removed item from items map', function () {
            var item = { _id: 'foo' };
            liveList.add(item);
            liveList.removed('foo');
            chai_1.expect(liveList.get('foo')).undefined;
        });
        it('triggers event listeners', function () {
            var item = { _id: 'foo' };
            liveList.add(item);
            var trigger = sinon_1.stub(liveList, 'trigger');
            liveList.removed('foo');
            sinon_1.assert.calledWith(trigger, 'foo', undefined);
        });
        it('calls onDelete event handler', function () {
            var item = { _id: 'foo' };
            liveList.add(item);
            var onDelete = sinon_1.stub();
            config.onDelete = onDelete;
            liveList.removed('foo');
            sinon_1.assert.calledWith(onDelete, item);
        });
        it('does nothing if item is not found', function () {
            var trigger = sinon_1.stub(liveList, 'trigger');
            liveList.removed('foo');
            sinon_1.assert.notCalled(trigger);
        });
    });
    describe('trigger() / subscribe()', function () {
        it('calls all listeners', function () {
            var item = { _id: 'foo' };
            var listener1 = sinon_1.stub();
            var listener2 = sinon_1.stub();
            liveList.subscribe('foo', listener1);
            liveList.subscribe('foo', listener2);
            liveList.trigger('foo', item);
            sinon_1.assert.calledWith(listener1, 'foo', item);
            sinon_1.assert.calledWith(listener2, 'foo', item);
        });
        it('does nothing for no listeners', function () {
            var item = { _id: 'foo' };
            liveList.trigger('foo', item);
        });
        it('lets unsubscribe listeners', function () {
            var item = { _id: 'foo' };
            var listener1 = sinon_1.stub();
            var listener2 = sinon_1.stub();
            var subscription = liveList.subscribe('foo', listener1);
            liveList.subscribe('foo', listener2);
            subscription.unsubscribe();
            liveList.trigger('foo', item);
            sinon_1.assert.notCalled(listener1);
            sinon_1.assert.calledWith(listener2, 'foo', item);
        });
        it('does nothing if unsubscribed twice', function () {
            var item = { _id: 'foo' };
            var listener = sinon_1.stub();
            var subscription = liveList.subscribe('foo', listener);
            subscription.unsubscribe();
            subscription.unsubscribe();
            liveList.trigger('foo', item);
            sinon_1.assert.notCalled(listener);
        });
        it('cleans document before sending', function () {
            var item = { _id: 'foo' };
            var listener = sinon_1.stub();
            liveList.subscribe('foo', listener);
            config.clean = function (item) { return (__assign(__assign({}, item), { bar: 5 })); };
            liveList.trigger('foo', item);
            sinon_1.assert.calledWithMatch(listener, 'foo', { _id: 'foo', bar: 5 });
        });
        it('skips cleanig if document is undefined', function () {
            var listener = sinon_1.stub();
            liveList.subscribe('foo', listener);
            config.clean = function (item) { return item.error; };
            liveList.trigger('foo', undefined);
            sinon_1.assert.calledWithMatch(listener, 'foo', undefined);
        });
        it('calls listener on subscribe if found document', function () {
            var item = { _id: 'foo' };
            liveList.add(item);
            var listener = sinon_1.stub();
            liveList.subscribe('foo', listener);
            sinon_1.assert.calledWith(listener, 'foo', item);
        });
        it('cleans document when sending it on subscribe', function () {
            var item = { _id: 'foo' };
            liveList.add(item);
            var listener = sinon_1.stub();
            config.clean = function (item) { return (__assign(__assign({}, item), { bar: 5 })); };
            liveList.subscribe('foo', listener);
            sinon_1.assert.calledWithMatch(listener, 'foo', { _id: 'foo', bar: 5 });
        });
    });
    describe('start()', function () {
        it('starts first tick', function () {
            var tick = sinon_1.stub(liveList, 'tick');
            liveList.start();
            sinon_1.assert.calledOnce(tick);
        });
    });
    describe('tick()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () {
            clock.restore();
        });
        it('does nothing if not running', function () { return __awaiter(void 0, void 0, void 0, function () {
            var update;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        update = sinon_1.stub(liveList, 'update').resolves();
                        return [4 /*yield*/, liveList.tick()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(update);
                        return [2 /*return*/];
                }
            });
        }); });
        it('calls update', function () { return __awaiter(void 0, void 0, void 0, function () {
            var update;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        update = sinon_1.stub(liveList, 'update').resolves();
                        liveList.running = true;
                        return [4 /*yield*/, liveList.tick()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(update);
                        return [2 /*return*/];
                }
            });
        }); });
        it('schedules next tick with new timestamp', function () { return __awaiter(void 0, void 0, void 0, function () {
            var update;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        update = sinon_1.stub(liveList, 'update').resolves();
                        liveList.running = true;
                        return [4 /*yield*/, liveList.tick()];
                    case 1:
                        _a.sent();
                        clock.tick(2000);
                        sinon_1.assert.calledTwice(update);
                        return [2 /*return*/];
                }
            });
        }); });
        it('stop() prevents further ticks', function () { return __awaiter(void 0, void 0, void 0, function () {
            var update;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        update = sinon_1.stub(liveList, 'update').resolves();
                        liveList.running = true;
                        return [4 /*yield*/, liveList.tick()];
                    case 1:
                        _a.sent();
                        liveList.stop();
                        clock.tick(2000);
                        sinon_1.assert.calledOnce(update);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('update()', function () {
        function createQuery(items) {
            return {
                cursor: function () {
                    return {
                        on: function (event, callback) {
                            if (event === 'data') {
                                items.forEach(callback);
                            }
                            else if (event === 'end') {
                                callback();
                            }
                            return this;
                        }
                    };
                }
            };
        }
        function setupFind(items) {
            model.find.returns({ lean: sinon_1.stub().returns(createQuery(items)) });
        }
        it('queried database with current timestamp', function () { return __awaiter(void 0, void 0, void 0, function () {
            var timestamp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timestamp = new Date(12345);
                        liveList.timestamp = timestamp;
                        setupFind([]);
                        return [4 /*yield*/, liveList.update()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(model.find, { updatedAt: { $gt: timestamp } }, 'foo bar');
                        return [2 /*return*/];
                }
            });
        }); });
        it('adds new item', function () { return __awaiter(void 0, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = { _id: 'foo' };
                        setupFind([item]);
                        return [4 /*yield*/, liveList.update()];
                    case 1:
                        _a.sent();
                        chai_1.expect(liveList.items).contain(item);
                        return [2 /*return*/];
                }
            });
        }); });
        it('calls onAddedOrUpdated event handler', function () { return __awaiter(void 0, void 0, void 0, function () {
            var onAddedOrUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onAddedOrUpdated = sinon_1.stub();
                        config.onAddedOrUpdated = onAddedOrUpdated;
                        setupFind([{ _id: 'foo' }]);
                        return [4 /*yield*/, liveList.update()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(onAddedOrUpdated);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not call onAddedOrUpdated event handler if did not fetch any items', function () { return __awaiter(void 0, void 0, void 0, function () {
            var onAddedOrUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onAddedOrUpdated = sinon_1.stub();
                        config.onAddedOrUpdated = onAddedOrUpdated;
                        setupFind([]);
                        return [4 /*yield*/, liveList.update()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(onAddedOrUpdated);
                        return [2 /*return*/];
                }
            });
        }); });
        it('calls onAdd event when adding', function () {
            var item = { _id: 'foo' };
            var onAdd = sinon_1.stub();
            config.onAdd = onAdd;
            setupFind([item]);
            liveList.update();
            sinon_1.assert.calledWith(onAdd, item);
        });
        it('updates existing item', function () {
            var item = { _id: 'foo', value: 1 };
            liveList.add(item);
            setupFind([{ _id: 'foo', value: 2 }]);
            liveList.update();
            chai_1.expect(item.value).equal(2);
        });
        it('fixes documents before updating', function () {
            var item = { _id: 'foo', value: 1 };
            config.fix = function (item) { return item.field = 'bar'; };
            liveList.add(item);
            setupFind([{ _id: 'foo', value: 2 }]);
            liveList.update();
            chai_1.expect(item).eql({ _id: 'foo', value: 2, field: 'bar' });
        });
        it('triggers listeners updates existing item', function () {
            var trigger = sinon_1.stub(liveList, 'trigger');
            var item = { _id: 'foo', value: 1 };
            liveList.add(item);
            setupFind([{ _id: 'foo', value: 2 }]);
            liveList.update();
            sinon_1.assert.calledWith(trigger, 'foo', item);
        });
        it('calls onUpdate event when updating', function () {
            var item = { _id: 'foo', value: 1 };
            var update = { _id: 'foo', value: 2 };
            var onUpdate = sinon_1.stub();
            config.onUpdate = onUpdate;
            liveList.add(item);
            setupFind([update]);
            liveList.update();
            sinon_1.assert.calledWith(onUpdate, item, update);
        });
        it('sets loaded to true ', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setupFind([]);
                        return [4 /*yield*/, liveList.update()];
                    case 1:
                        _a.sent();
                        chai_1.expect(liveList.loaded).true;
                        return [2 /*return*/];
                }
            });
        }); });
        it('calls onFinished event handler', function () { return __awaiter(void 0, void 0, void 0, function () {
            var onFinished;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onFinished = sinon_1.stub();
                        config.onFinished = onFinished;
                        setupFind([]);
                        return [4 /*yield*/, liveList.update()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(onFinished);
                        return [2 /*return*/];
                }
            });
        }); });
        it('calls onFinished event handler only on first finish', function () { return __awaiter(void 0, void 0, void 0, function () {
            var onFinished;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onFinished = sinon_1.stub();
                        config.onFinished = onFinished;
                        setupFind([]);
                        return [4 /*yield*/, liveList.update()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, liveList.update()];
                    case 2:
                        _a.sent();
                        sinon_1.assert.calledOnce(onFinished);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=liveList.spec.js.map