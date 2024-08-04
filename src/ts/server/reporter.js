"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFromRequest = exports.create = void 0;
var lodash_1 = require("lodash");
var db_1 = require("./db");
var logger_1 = require("./logger");
var originUtils_1 = require("./originUtils");
var maxDescLength = 300;
/* istanbul ignore next */
var createLogEvent = function (config) {
    return function (account, pony, originInfo, type, message, desc) {
        var server = config.id;
        if (desc) {
            desc = lodash_1.truncate(desc, { length: maxDescLength });
        }
        var origin = originInfo && { ip: originInfo.ip, country: originInfo.country };
        db_1.Event.findOne({ server: server, account: account, pony: pony, type: type, message: message, origin: origin }).exec()
            .then(function (event) {
            if (event) {
                if (!event.desc || (event.desc.length < maxDescLength && desc && event.desc.indexOf(desc) === -1)) {
                    event.desc = ((event.desc || '') + "\n" + (desc || '')).trim();
                }
                return db_1.Event.updateOne({ _id: event._id }, { desc: event.desc, count: event.count + 1 }).exec();
            }
            else {
                return db_1.Event.create({ server: server, account: account, pony: pony, type: type, message: message, origin: origin, desc: desc });
            }
        })
            .catch(logger_1.logger.error);
        return null;
    };
};
var ignoreWarnings = ['Suspicious message', 'Spam'];
/* istanbul ignore next */
function create(server, account, pony, originInfo) {
    var logEvent = createLogEvent(server);
    var accountId = "" + account;
    function log(type, message, desc) {
        logEvent(account, pony, originInfo, type, message, desc);
        if (DEVELOPMENT) {
            logger_1.logger.debug('[event]', "[" + type + "]", message);
        }
    }
    return {
        info: function (message, desc) {
            log('info', message, desc);
        },
        warn: function (message, desc) {
            log('warning', message, desc);
            if (ignoreWarnings.indexOf(message) === -1) {
                logger_1.system(accountId, message);
            }
        },
        warnLog: function (message) {
            logger_1.logger.warn(message);
        },
        danger: function (message, desc) {
            log('danger', message, desc);
            logger_1.logger.error(message, desc || '');
        },
        error: function (error, desc) {
            log('danger', error.message, desc);
            logger_1.logger.error(error, desc || '');
        },
        system: function (message, desc, logEvent) {
            if (logEvent === void 0) { logEvent = true; }
            if (logEvent) {
                log('info', message, desc);
            }
            logger_1.system(accountId, message);
        },
        systemLog: function (message) {
            logger_1.system(accountId, message);
            DEVELOPMENT && logger_1.logger.log(message);
        },
        setPony: function (newPony) {
            pony = newPony;
        },
    };
}
exports.create = create;
/* istanbul ignore next */
function createFromRequest(server, req, pony) {
    var user = req && req.user;
    var account = user ? user.id : undefined;
    var origin = req ? originUtils_1.getOrigin(req) : undefined;
    return create(server, account, pony, origin);
}
exports.createFromRequest = createFromRequest;
//# sourceMappingURL=reporter.js.map