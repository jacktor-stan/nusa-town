"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketErrorHandler = void 0;
var lodash_1 = require("lodash");
var ag_sockets_1 = require("ag-sockets");
var logger_1 = require("../logger");
var userError_1 = require("../userError");
var utils_1 = require("../../common/utils");
var reporter_1 = require("../reporter");
var originUtils_1 = require("../originUtils");
var serverActions_1 = require("../serverActions");
var reporterIgnore = /^rate limit exceeded/i;
var ignoreErrors = [
    'String message while forced binary',
];
var rollbarIgnore = new RegExp('^(' + __spreadArray([
    'reserved fields must be empty',
    'rate limit exceeded',
    'transfer limit exceeded',
    'some error',
    'Invalid token',
    'Action not allowed',
    'Client does not exist',
    'Cannot perform this action on admin user',
    'Account creation is temporarily disabled',
    'Not a number',
    'Not a string'
], ignoreErrors).map(lodash_1.escapeRegExp).join('|') + ')', 'i');
var lastError = '';
var lastErrorTime = 0;
function formatMessage(message) {
    if (message === null) {
        return '<null>';
    }
    else if (message === undefined) {
        return '<undefined>';
    }
    else if (typeof message === 'string') {
        return message;
    }
    else if (message instanceof Uint8Array) {
        return "<" + Array.from(message).toString() + ">";
    }
    else {
        return "<" + JSON.stringify(message) + ">";
    }
}
function getPerson(client) {
    return client && client.account ? {
        id: client.accountId,
        username: client.account.name,
    } : {};
}
function reportError(rollbar, e, client, config) {
    if (userError_1.isUserError(e)) {
        userError_1.reportUserError2(e, client);
        return e;
    }
    else {
        if (client && client.reporter && !reporterIgnore.test(e.message)) {
            client.reporter.error(e);
        }
        else if (client && client.originalRequest) {
            var origin_1 = client.originalRequest && originUtils_1.getOriginFromHTTP(client.originalRequest);
            reporter_1.create(config, undefined, undefined, origin_1).error(e);
        }
        else {
            reporter_1.create(config).error(e);
        }
        if (!rollbarIgnore.test(e.message)) {
            rollbar && rollbar.error(e, null, { person: getPerson(client) });
        }
        return new Error('Error occurred');
    }
}
var serverMethods = ag_sockets_1.getMethods(serverActions_1.ServerActions);
function getMethodNameFromPacket(packet) {
    try {
        if (typeof packet === 'string') {
            var values = JSON.parse(packet);
            return serverMethods[values[0]].name;
        }
        else {
            return serverMethods[packet[0]].name;
        }
    }
    catch (_a) {
        return '???';
    }
}
function reportRateLimit(client, e, message) {
    var reported = false;
    if (client.rateLimitMessage === e.message && client.rateLimitCount) {
        if (++client.rateLimitCount > 5) {
            reported = true;
            client.reporter.warn(e.message + " (x5)", message);
            client.rateLimitCount = 1;
            client.disconnect(true, true);
        }
    }
    else {
        client.rateLimitMessage = e.message;
        client.rateLimitCount = 1;
    }
    return reported;
}
var SocketErrorHandler = /** @class */ (function () {
    function SocketErrorHandler(rollbar, config) {
        this.rollbar = rollbar;
        this.config = config;
    }
    SocketErrorHandler.prototype.handleError = function (client, e) {
        if (!/no server for given id/i.test(e.message)) {
            reportError(this.rollbar, e, client || undefined, this.config);
        }
    };
    SocketErrorHandler.prototype.handleRejection = function (client, e) {
        if (/^rate limit exceeded/i.test(e.message)) {
            reportRateLimit(client, e, 'rejection');
            return new Error('Error occurred');
        }
        else {
            return reportError(this.rollbar, e, client, this.config);
        }
    };
    SocketErrorHandler.prototype.handleRecvError = function (client, e, socketMessage) {
        if (lastError === e.message && Date.now() < (lastErrorTime + 5000))
            return;
        var message = formatMessage(socketMessage);
        var method = getMethodNameFromPacket(socketMessage);
        var reported = false;
        if (client.reporter) {
            if (/^rate limit exceeded/i.test(e.message)) {
                reported = reportRateLimit(client, e, message);
            }
            else if (/^transfer limit exceeded/i.test(e.message)) {
                reported = true;
                var desc = e.message.replace(/transfer limit exceeded /i, '');
                client.reporter.warn('Transfer limit exceeded', desc + " - (" + method + ") " + message);
            }
            else if (!utils_1.includes(ignoreErrors, e.message)) {
                reported = true;
                client.reporter.error(e, "(" + method + ") " + message);
            }
        }
        lastError = e.message;
        lastErrorTime = Date.now();
        if (!reported && !rollbarIgnore.test(e.message || '')) {
            logger_1.logger.error("recv error: " + (e.stack || e) + "\n\n    message: " + message);
            this.rollbar && this.rollbar.error(e, null, { custom: { message: message }, person: getPerson(client) });
        }
    };
    return SocketErrorHandler;
}());
exports.SocketErrorHandler = SocketErrorHandler;
//# sourceMappingURL=socketErrorHandler.js.map