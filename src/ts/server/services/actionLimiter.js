"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionLimiter = void 0;
var counter_1 = require("./counter");
var playerUtils_1 = require("../playerUtils");
var ActionLimiter = /** @class */ (function () {
    function ActionLimiter(clearTimeout, countLimit) {
        this.countLimit = countLimit;
        this.counters = new counter_1.CounterService(clearTimeout);
        this.counters.start();
    }
    ActionLimiter.prototype.canExecute = function (requester, target) {
        if (requester === target || requester.accountId === target.accountId)
            return 1 /* SameAccount */;
        if (target.offline)
            return 5 /* TargetOffline */;
        if (playerUtils_1.isMutedOrShadowed(requester))
            return 2 /* MutedOrShadowed */;
        if (playerUtils_1.isIgnored(requester, target) || playerUtils_1.isIgnored(target, requester))
            return 3 /* Ignored */;
        if (this.counters.get(requester.accountId).count >= this.countLimit)
            return 4 /* LimitReached */;
        return 0 /* Yes */;
    };
    ActionLimiter.prototype.count = function (requester) {
        return this.counters.add(requester.accountId).count;
    };
    ActionLimiter.prototype.dispose = function () {
        this.counters.stop();
    };
    return ActionLimiter;
}());
exports.ActionLimiter = ActionLimiter;
//# sourceMappingURL=actionLimiter.js.map