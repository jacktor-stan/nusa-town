"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiveEndPoint = void 0;
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var adminInterfaces_1 = require("../common/adminInterfaces");
var constants_1 = require("../common/constants");
var utils_1 = require("../common/utils");
var logger_1 = require("./logger");
function createLiveEndPoint(_a) {
    var model = _a.model, fields = _a.fields, encode = _a.encode, beforeDelete = _a.beforeDelete, afterDelete = _a.afterDelete, beforeAssign = _a.beforeAssign, afterAssign = _a.afterAssign, _b = _a.fix, fix = _b === void 0 ? false : _b;
    var removedItems = [];
    var fixing = false;
    function removedItem(id) {
        removedItems.push({ id: id, updatedAt: new Date() });
    }
    function removeItem(id) {
        return Promise.resolve(model.findById(id).exec())
            .tap(function (item) { return item && beforeDelete && beforeDelete(item); })
            .tap(function (item) {
            if (item) {
                removedItem(item._id.toString());
                return item.remove();
            }
        })
            .tap(function (item) { return item && afterDelete && afterDelete(item); })
            .then(lodash_1.noop);
    }
    function assignAccount(id, account) {
        return Promise.resolve()
            .then(function () { return model.findById(id, 'account').lean().exec(); })
            .tap(function (item) { return item && beforeAssign && beforeAssign(item, account); })
            .tap(function () { return model.findByIdAndUpdate(id, { account: account }).exec(); })
            .tap(function (item) { return item && afterAssign && afterAssign(item.account, account); })
            .then(lodash_1.noop);
    }
    function encodeItems(items, timestamp, more) {
        var base = {};
        var updates = encode(items, base);
        var deletes = removedItems
            .filter(function (x) { return x.updatedAt.getTime() > timestamp.getTime(); })
            .map(function (x) { return x.id; });
        return { updates: updates, deletes: deletes, base: base, more: more };
    }
    function findItems(from) {
        return Promise.resolve(model.find({ updatedAt: { $gt: from } }, fields.join(' '))
            // .sort([['updatedAt', 1], ['id', 1]])
            .sort({ updatedAt: 1 })
            .limit(adminInterfaces_1.ITEM_LIMIT + 1)
            .lean()
            .exec());
    }
    function findItemsExact(date) {
        return Promise.resolve(model.find({ updatedAt: date }, fields.join(' '))
            .lean()
            .exec());
    }
    function hasItem(items, id) {
        return items.some(function (i) { return i._id === id; });
    }
    function addTailItems(items) {
        if (items.length <= adminInterfaces_1.ITEM_LIMIT) {
            return Promise.resolve({ items: items, more: false });
        }
        var a = items[items.length - 1];
        var b = items[items.length - 2];
        if (a.updatedAt.getTime() !== b.updatedAt.getTime()) {
            items.pop();
            return Promise.resolve({ items: items, more: true });
        }
        return findItemsExact(items[items.length - 1].updatedAt)
            .then(function (other) { return other.filter(function (i) { return !hasItem(items, i._id); }); })
            .then(function (other) { return __spreadArray(__spreadArray([], items), other); })
            .then(function (items) { return ({ items: items, more: true }); });
    }
    function getAll(timestamp) {
        var from = timestamp ? new Date(timestamp) : new Date(0);
        return findItems(from)
            .then(addTailItems)
            .tap(function (_a) {
            var items = _a.items;
            try {
                if (items.length > adminInterfaces_1.ITEM_LIMIT * 2) {
                    fixItems(items);
                    logger_1.logger.warn("Fetching " + items.length + " " + model.modelName + "s [" + items[adminInterfaces_1.ITEM_LIMIT + 1].updatedAt.toISOString() + "]");
                }
            }
            catch (e) {
                logger_1.logger.error(e);
            }
        })
            .then(function (_a) {
            var items = _a.items, more = _a.more;
            return encodeItems(items, from, more);
        });
    }
    function fixItems(items) {
        if (fixing || !fix)
            return;
        fixing = true;
        logger_1.logger.info("Fixing " + model.modelName + "s");
        Promise.map(items, function (item) { return model.updateOne({ _id: item._id }, { unused: Date.now() % 1000 }).exec(); }, { concurrency: 1 })
            .then(function () { return logger_1.logger.info("Fixed " + model.modelName + "s"); })
            .catch(function (e) { return logger_1.logger.error(e); })
            .finally(function () { return fixing = false; })
            .done();
    }
    function get(id) {
        return Promise.resolve(model.findById(id).lean().exec());
    }
    var interval = setInterval(function () {
        var date = utils_1.fromNow(-10 * constants_1.MINUTE);
        lodash_1.remove(removedItems, function (x) { return x.updatedAt.getTime() < date.getTime(); });
    }, 1 * constants_1.MINUTE);
    function destroy() {
        clearInterval(interval);
    }
    return {
        get: get,
        getAll: getAll,
        assignAccount: assignAccount,
        removeItem: removeItem,
        removedItem: removedItem,
        encodeItems: encodeItems,
        destroy: destroy,
    };
}
exports.createLiveEndPoint = createLiveEndPoint;
//# sourceMappingURL=liveEndPoint.js.map