"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportInviteLimit = exports.createReportForbidden = exports.createReportSwears = exports.createReportSuspicious = exports.FORBIDDEN_TIMEOUT = exports.SWEAR_TIMEOUT = exports.SPAM_TIMEOUT = void 0;
var constants_1 = require("../common/constants");
var adminUtils_1 = require("../common/adminUtils");
var utils_1 = require("../common/utils");
var accountUtils_1 = require("./accountUtils");
var serverUtils_1 = require("./serverUtils");
exports.SPAM_TIMEOUT = 1 * constants_1.HOUR;
exports.SWEAR_TIMEOUT = 10 * constants_1.HOUR;
exports.FORBIDDEN_TIMEOUT = 1 * constants_1.HOUR;
var createReportSuspicious = function (counter) {
    return function (client, message, suspicious) {
        var accountId = client.accountId, account = client.account, reporter = client.reporter, shadowed = client.shadowed;
        var limit = 5;
        var _a = counter.add(accountId, message), count = _a.count, items = _a.items;
        if (count > limit || suspicious === 2 /* Very */) {
            var msg = items.join('\n');
            counter.remove(accountId);
            if (!(adminUtils_1.isMuted(account) || shadowed)) {
                reporter.warn('Suspicious messages', msg);
            }
        }
    };
};
exports.createReportSuspicious = createReportSuspicious;
var createReportSwears = function (counter, reportSwearing, timeoutAccount, handlePromise) {
    if (handlePromise === void 0) { handlePromise = serverUtils_1.handlePromiseDefault; }
    return function (client, message, settings) {
        var accountId = client.accountId, account = client.account, reporter = client.reporter, shadowed = client.shadowed;
        var limit = 5; // isNew ? 3 : 6;
        var _a = counter.add(accountId, message), count = _a.count, items = _a.items;
        if (count > limit) {
            var msg_1 = items.join('\n');
            var timeout_1 = settings.autoBanSwearing && !(adminUtils_1.isMuted(account) || shadowed);
            var duration_1 = exports.SWEAR_TIMEOUT * (settings.doubleTimeouts ? 2 : 1);
            counter.remove(accountId);
            handlePromise(Promise.resolve()
                .then(function () { return reportSwearing(accountId); })
                .then(function () { return timeout_1 ? timeoutAccount(accountId, utils_1.fromNow(duration_1), 'Timed out for swearing') : undefined; })
                .then(function () {
                if (timeout_1) {
                    reporter.system('Timed out for swearing', msg_1, !!settings.reportSwears);
                }
                else if (!(adminUtils_1.isMuted(account) || shadowed)) {
                    reporter.warn('Swearing', msg_1);
                }
            }), reporter.error);
        }
    };
};
exports.createReportSwears = createReportSwears;
var createReportForbidden = function (counter, timeoutAccount, handlePromise) {
    if (handlePromise === void 0) { handlePromise = serverUtils_1.handlePromiseDefault; }
    return function (client, message, settings) {
        var accountId = client.accountId, account = client.account, reporter = client.reporter, shadowed = client.shadowed;
        var newAccount = accountUtils_1.isNew(account);
        var limit = newAccount ? 5 : 10;
        var _a = counter.add(accountId, message), count = _a.count, items = _a.items;
        var mutedOrShadowed = adminUtils_1.isMuted(account) || shadowed;
        if (!mutedOrShadowed) {
            if (count >= limit) {
                var msg_2 = items.join('\n');
                var duration = exports.FORBIDDEN_TIMEOUT * (settings.doubleTimeouts ? 2 : 1);
                counter.remove(accountId);
                if (newAccount || settings.autoBanSwearing) {
                    handlePromise(timeoutAccount(accountId, utils_1.fromNow(duration))
                        .then(function () { return reporter.system('Timed out for forbidden messages', msg_2); }), reporter.error);
                }
                else {
                    reporter.warn('Forbidden messages', msg_2);
                }
            }
        }
    };
};
exports.createReportForbidden = createReportForbidden;
var reportInviteLimit = function (reportInviteLimitAccount, message, handlePromise) {
    if (handlePromise === void 0) { handlePromise = serverUtils_1.handlePromiseDefault; }
    return function (_a) {
        var accountId = _a.accountId, reporter = _a.reporter;
        return handlePromise(reportInviteLimitAccount(accountId)
            .then(function (count) {
            reporter.systemLog(message);
            if (count % 10 === 0) {
                reporter.warn(message + " (" + count + ")");
            }
        }), reporter.error);
    };
};
exports.reportInviteLimit = reportInviteLimit;
//# sourceMappingURL=reporting.js.map