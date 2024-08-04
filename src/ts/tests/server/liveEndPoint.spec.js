"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var liveEndPoint_1 = require("../../server/liveEndPoint");
var adminInterfaces_1 = require("../../common/adminInterfaces");
var constants_1 = require("../../common/constants");
var utils_1 = require("../../common/utils");
describe('liveEndPoint', function () {
    var clock;
    var model;
    var encode;
    var beforeDelete;
    var afterDelete;
    var afterAssign;
    var liveEndPoint;
    function stubFind(items) {
        return sinon_1.stub(model, 'find').returns({
            sort: sinon_1.stub().withArgs(sinon_1.match({ updatedAt: 1 })).returns({
                limit: sinon_1.stub().withArgs(adminInterfaces_1.ITEM_LIMIT + 1).returns({
                    lean: sinon_1.stub().returns({
                        exec: function () { return Promise.resolve(items); }
                    })
                })
            })
        });
    }
    beforeEach(function () {
        clock = sinon_1.useFakeTimers();
        model = {
            findByIdAndUpdate: function () { },
            findById: function () { },
            find: function () { },
        };
        encode = sinon_1.stub();
        beforeDelete = sinon_1.stub();
        afterDelete = sinon_1.stub();
        afterAssign = sinon_1.stub();
        liveEndPoint = liveEndPoint_1.createLiveEndPoint({
            model: model,
            fields: ['_id', 'name', 'desc'],
            encode: encode,
            beforeDelete: beforeDelete,
            afterDelete: afterDelete,
            afterAssign: afterAssign
        });
    });
    afterEach(function () {
        clock.restore();
        liveEndPoint.destroy();
    });
    it('clears removed items after 10 minutes', function () {
        var item = { _id: 'foo', remove: sinon_1.stub() };
        sinon_1.stub(model, 'findById').withArgs('foo').returns({ exec: function () { return Promise.resolve(item); } });
        clock.setSystemTime(10000);
        stubFind([]);
        return liveEndPoint.removeItem('foo')
            .then(function () { return clock.tick(1 * constants_1.MINUTE + 100); })
            .then(function () { return liveEndPoint.getAll(); })
            .then(function (result) { return chai_1.expect(result.deletes).eql(['foo']); });
    });
    describe('get()', function () {
        it('finds item by id', function () {
            var item = {};
            sinon_1.stub(model, 'findById').withArgs('foo').returns({
                lean: sinon_1.stub().returns({
                    exec: sinon_1.stub().resolves(item)
                })
            });
            return liveEndPoint.get('foo')
                .then(function (result) { return chai_1.expect(result).equal(item); });
        });
    });
    describe('getAll()', function () {
        it('returns encoded items', function () {
            stubFind([{ _id: 'aaa' }, { _id: 'bbb' }]);
            encode.returns('encoded');
            return liveEndPoint.getAll()
                .then(function (result) { return chai_1.expect(result).eql({
                base: {},
                deletes: [],
                updates: 'encoded',
                more: false,
            }); });
        });
        it('passes 0 timestamp to find method by default', function () {
            var find = stubFind([{ _id: 'aaa' }, { _id: 'bbb' }]);
            return liveEndPoint.getAll()
                .then(function () { return sinon_1.assert.calledWithMatch(find, { updatedAt: { $gt: new Date(0) } }, '_id name desc'); });
        });
        it('passes given timestamp to find method', function () {
            var timestamp = '2017-09-09T16:39:54.199Z';
            var find = stubFind([{ _id: 'aaa' }, { _id: 'bbb' }]);
            return liveEndPoint.getAll(timestamp)
                .then(function () { return sinon_1.assert.calledWithMatch(find, { updatedAt: { $gt: new Date(timestamp) } }, '_id name desc'); });
        });
        describe('if items exceed limit', function () {
            describe('if last 2 items have different updatedAt', function () {
                beforeEach(function () {
                    var items = utils_1.times(adminInterfaces_1.ITEM_LIMIT + 1, function (i) { return ({ _id: "foo_" + i, updatedAt: new Date(i) }); });
                    stubFind(items);
                });
                it('removes last item', function () {
                    return liveEndPoint.getAll()
                        .then(function () { return chai_1.expect(encode.args[0][0].length).equal(adminInterfaces_1.ITEM_LIMIT); });
                });
                it('returns more flag', function () {
                    return liveEndPoint.getAll()
                        .then(function (_a) {
                        var more = _a.more;
                        return chai_1.expect(more).true;
                    });
                });
            });
            describe('if last 2 items have the same updatedAt', function () {
                var items;
                var restItems;
                var find;
                beforeEach(function () {
                    items = utils_1.times(adminInterfaces_1.ITEM_LIMIT, function (i) { return ({ _id: "foo_" + i, updatedAt: new Date(i) }); });
                    items.push({ _id: 'bar', updatedAt: items[items.length - 1].updatedAt });
                    restItems = [{ _id: 'bar1' }, { _id: 'bar2' }];
                    find = stubFind(items).onSecondCall().returns({
                        lean: sinon_1.stub().returns({
                            exec: sinon_1.stub().resolves(restItems)
                        })
                    });
                });
                it('fetches additional items if last items have the same date', function () {
                    return liveEndPoint.getAll()
                        .then(function () { return chai_1.expect(encode.args[0][0].length).equal(adminInterfaces_1.ITEM_LIMIT + 1 + 2); });
                });
                it('filters out duplicate items', function () {
                    restItems.push(items[items.length - 1]);
                    return liveEndPoint.getAll()
                        .then(function () { return chai_1.expect(encode.args[0][0].length).equal(adminInterfaces_1.ITEM_LIMIT + 1 + 2); });
                });
                it('fetches more items using timestamp of last element', function () {
                    var timestamp = items[items.length - 1].updatedAt;
                    return liveEndPoint.getAll()
                        .then(function () { return sinon_1.assert.calledWithMatch(find, { updatedAt: timestamp }, '_id name desc'); });
                });
                it('returns more flag', function () {
                    return liveEndPoint.getAll()
                        .then(function (_a) {
                        var more = _a.more;
                        return chai_1.expect(more).true;
                    });
                });
            });
        });
    });
    describe('removeItem()', function () {
        describe('if item exists', function () {
            var item;
            beforeEach(function () {
                item = { _id: 'foo', remove: sinon_1.stub() };
                sinon_1.stub(model, 'findById').withArgs('foo').returns({ exec: sinon_1.stub().resolves(item) });
            });
            it('removes item', function () {
                return liveEndPoint.removeItem('foo')
                    .then(function () { return sinon_1.assert.calledOnce(item.remove); });
            });
            it('calls beforeDelete hook', function () {
                return liveEndPoint.removeItem('foo')
                    .then(function () { return sinon_1.assert.calledWith(beforeDelete, item); });
            });
            it('calls afterDelete hook', function () {
                return liveEndPoint.removeItem('foo')
                    .then(function () { return sinon_1.assert.calledWith(afterDelete, item); });
            });
            it('adds item ID to removed items', function () {
                clock.setSystemTime(10000);
                stubFind([]);
                return liveEndPoint.removeItem('foo')
                    .then(function () { return liveEndPoint.getAll(); })
                    .then(function (result) { return chai_1.expect(result.deletes).eql(['foo']); });
            });
        });
        describe('if item does not exist', function () {
            var item;
            beforeEach(function () {
                item = { remove: sinon_1.stub() };
                sinon_1.stub(model, 'findById').withArgs('bar').returns({ exec: sinon_1.stub().resolves(null) });
            });
            it('does nothing if item does not exist', function () {
                return liveEndPoint.removeItem('bar')
                    .then(function () { return sinon_1.assert.notCalled(item.remove); });
            });
            it('does not call onDelete hook', function () {
                return liveEndPoint.removeItem('bar')
                    .then(function () { return sinon_1.assert.notCalled(beforeDelete); });
            });
            it('does not call hook', function () {
                return liveEndPoint.removeItem('bar')
                    .then(function () { return sinon_1.assert.notCalled(afterDelete); });
            });
        });
    });
    describe('assignAccount()', function () {
        var item = { account: 'origacc' };
        beforeEach(function () {
            sinon_1.stub(model, 'findById').withArgs('foo', 'account')
                .returns({ lean: sinon_1.stub().returns({ exec: sinon_1.stub().resolves(item) }) });
        });
        it('assigns account to item', function () {
            var exec = sinon_1.stub();
            var findByIdAndUpdate = sinon_1.stub(model, 'findByIdAndUpdate').returns({ exec: exec });
            return liveEndPoint.assignAccount('foo', 'bar')
                .then(function () {
                sinon_1.assert.calledWithMatch(findByIdAndUpdate, 'foo', { account: 'bar' });
                sinon_1.assert.calledOnce(exec);
            });
        });
        it('calls afterAssign hook', function () {
            sinon_1.stub(model, 'findByIdAndUpdate').returns({ exec: sinon_1.stub() });
            return liveEndPoint.assignAccount('foo', 'bar')
                .then(function () { return sinon_1.assert.calledWith(afterAssign, 'origacc', 'bar'); });
        });
    });
});
//# sourceMappingURL=liveEndPoint.spec.js.map